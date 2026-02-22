import os
import json
import logging
import re
import asyncio
from datetime import timedelta
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field
from google.adk.agents.llm_agent import Agent
from google.adk.tools import McpToolset
from google.adk.tools.mcp_tool import SseConnectionParams
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from asgiref.sync import sync_to_async

from django.utils import timezone
from django.conf import settings

from ..models import IssueCluster, LogEntry, ChatEntry, ActionRecommendation

logger = logging.getLogger(__name__)

# --- Schemas ---


class SentimentResult(BaseModel):
    score: float = Field(..., description="Sentiment score between -1.0 and 1.0")
    reasoning: str = Field(..., description="Brief reasoning for the score")


class TriageResult(BaseModel):
    is_correlated: bool = Field(..., description="Whether a correlation was found")
    explanation: str = Field(
        ..., description="Explanation of the correlation or lack thereof"
    )
    related_log_ids: List[int] = Field(
        default_factory=list, description="IDs of related log entries"
    )


class ActionRecResult(BaseModel):
    summary: str = Field(..., description="1-sentence summary of the issue")
    likely_root_cause: str = Field(..., description="Likely root cause analysis")
    suggested_actions: List[str] = Field(..., description="3 specific actionable steps")


# --- Tools ---


@sync_to_async
def get_recent_error_logs(lookback_hours: int = 1) -> List[Dict[str, Any]]:
    """
    Fetches recent ERROR logs from the database.
    Args:
        lookback_hours: Number of hours to look back.
    """
    threshold = timezone.now() - timedelta(hours=lookback_hours)
    logs = LogEntry.objects.filter(level="ERROR", timestamp__gte=threshold).order_by(
        "-timestamp"
    )[:20]
    return [
        {
            "id": log.id,
            "source": log.source,
            "message": log.message,
            "timestamp": str(log.timestamp),
        }
        for log in logs
    ]


@sync_to_async
def save_issue_analysis(
    theme: str, description: str, sentiment: float, root_cause: str = None
) -> int:
    """
    Saves or updates an IssueCluster in the database.
    Returns the cluster ID.
    """
    logger.info(f"TOOL CALL: save_issue_analysis(theme={theme}, sentiment={sentiment})")
    cluster, created = IssueCluster.objects.get_or_create(
        theme=theme,
        defaults={
            "description": description,
            "sentiment_score": sentiment,
            "root_cause_analysis": root_cause or "",
        },
    )
    if not created:
        cluster.description = description
        cluster.sentiment_score = sentiment
        if root_cause:
            cluster.root_cause_analysis = root_cause
        cluster.save()
    return cluster.id


@sync_to_async
def save_recommendations(
    cluster_id: int, summary: str, root_cause: str, actions: List[str]
):
    """
    Saves action recommendations for a cluster.
    """
    logger.info(
        f"TOOL CALL: save_recommendations(cluster_id={cluster_id}, summary={summary})"
    )
    cluster = IssueCluster.objects.get(id=cluster_id)
    ActionRecommendation.objects.update_or_create(
        cluster=cluster,
        defaults={
            "summary": summary,
            "likely_root_cause": root_cause,
            "suggested_actions": actions,
        },
    )


@sync_to_async
def reply_to_freshchat(conversation_id: str, message: str):
    """
    Sends a reply message to a Freshchat conversation.
    Use this if the user needs immediate confirmation or a quick troubleshooting tip.
    """
    from .freshchat_service import FreshchatService

    service = FreshchatService()
    return service.send_message(conversation_id, message)


@sync_to_async
def reply_to_whatsapp(sender_id: str, message: str):
    """
    Sends a reply message to a WhatsApp user.
    Use this if the user needs immediate confirmation or a quick troubleshooting tip.
    """
    from .whatsapp_service import WhatsAppService

    service = WhatsAppService()
    return service.send_message(sender_id, message)


@sync_to_async
def notify_internal_team(cluster_id: int):
    """
    Notifies the internal Engineering and Product teams about a confirmed system issue.
    Call this ONLY when a definite system error (e.g., API failure, crash) is identified as the root cause.
    """
    from .alert_service import AlertService

    try:
        cluster = IssueCluster.objects.get(id=cluster_id)
        action_rec = cluster.actions.first()
        if not action_rec:
            # Create a dummy recommendation if none exists yet
            action_rec = ActionRecommendation.objects.create(
                cluster=cluster,
                summary="System issue detected and requires attention.",
                likely_root_cause=cluster.root_cause_analysis
                or "Unknown system error.",
                suggested_actions=[
                    "Investigate logs",
                    "Fix root cause",
                    "Verify resolution",
                ],
            )

        AlertService.notify_teams(cluster, action_rec)
        return "Internal teams notified successfully."
    except IssueCluster.DoesNotExist:
        return f"Error: Cluster {cluster_id} not found."
    except Exception as e:
        return f"Error notifying teams: {e}"


# --- AI Service Class ---


class AIService:
    # Initialize components
    GEMINI_API_KEY = getattr(
        settings, "GOOGLE_GEMINI_API_KEY", os.getenv("GOOGLE_GEMINI_API_KEY")
    )
    if GEMINI_API_KEY:
        os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

    # We use a session service to maintain state during an agent run if needed
    _session_service = InMemorySessionService()

    # Define Agents

    grouping_agent = Agent(
        name="GroupingAgent",
        model="gemini-2.5-flash",
        description="Specially trained to identify thematic patterns across disparate data points.",
        instruction="""
        Your task is to review a collection of customer messages and system logs.
        Identify the single most dominant theme or 'Cluster' that unites them.
        Provide a short Label (e.g., 'PAYMENT_CORE_FAILURE') and a Brief Description.
        REPORT THIS TO THE SUPERVISOR.
        """,
    )

    analyzer_agent = Agent(
        name="IssueAnalyzer",
        model="gemini-2.5-flash",
        description="A detail-oriented analyst specializing in customer sentiment and thematic categorization.",
        instruction="""
        Your goal is to parse customer messages and determine the emotional pulse (sentiment) and the core 'pillar' of the issue.
        Pillars include: PAYMENT_FAILURE, APP_CRASH, ONBOARDING_DELAY, and GENERAL_QUERY.
        Provide a concise reasoning for your classification.
        REPORT YOUR FINDINGS TO THE SUPERVISOR. DO NOT ADDRESS THE END USER.
        """,
    )

    triage_agent = Agent(
        name="SystemTriage",
        model="gemini-2.5-flash",
        description="A technical specialist who correlates user complaints with live system telemetry.",
        instruction="""
        Your goal is to find the 'smoking gun' in the system logs.
        Use the get_recent_error_logs tool to see what was happening in the backend when the users complained.
        Look for semantic matches (e.g., user says 'can't pay' -> logs show 'Stripe API Error').
        REPORT YOUR FINDINGS TO THE SUPERVISOR. DO NOT ADDRESS THE END USER.
        """,
        tools=[get_recent_error_logs],
    )

    action_agent = Agent(
        name="ActionSpecialist",
        model="gemini-2.5-flash",
        description="A proactive operations expert who translates analysis into immediate business value.",
        instruction="""
        You are responsible for CLOSING THE LOOP and satisfying the user.
        1. Use save_issue_analysis to save the theme, sentiment, and root cause.
        2. Use save_recommendations to save action items for the cluster.
        3. If you identify a definite system issue (via SystemTriage), use the appropriate reply tool to send a brief, empathetic response to the user:
           - Use reply_to_freshchat if the source is 'freshchat' (use conversation_id from metadata).
           - Use reply_to_whatsapp if the source is 'whatsapp' (use sender_id/phone number).
           Example: "I've detected a Stripe connection issue on our end and our team is already on it. Sorry for the trouble!"
        4. MANDATORY: If a definite system issue is identified, call notify_internal_team with the cluster_id returned by save_issue_analysis.
        5. Confirm to the Supervisor once tools are called.
        MANDATORY: You MUST call the tools. Do not just describe what should be saved.
        """,
        tools=[
            save_issue_analysis,
            save_recommendations,
            reply_to_freshchat,
            reply_to_whatsapp,
            notify_internal_team,
        ],
    )

    sharppay_toolset = McpToolset(
        connection_params=SseConnectionParams(url="http://localhost:8081/sse")
    )

    account_assistant = Agent(
        name="AccountAssistant",
        instruction="""
        You help users manage their Sharppay accounts using the provided MCP tools.
        You can check wallet balances, see transaction status, and retrieve transaction history.
        IMPORTANT: Before calling any tool, you MUST ask the user for their email address (for balance and history) or the specific transaction ID.
        Do not try to guess or extract these from the background metadata unless the user has explicitly provided them in the current conversation.
        """,
        tools=[sharppay_toolset],
    )

    supervisor = Agent(
        name="Supervisor",
        model="gemini-2.5-flash",
        description="The high-level orchestrator of the FinPulse AI intelligence loop.",
        instruction="""
        You are a PIPELINE EXECUTOR.
        1. Start by calling GroupingAgent with all provided data to define the cluster.
        2. Once grouped, call IssueAnalyzer for sentiment and pillars.
        3. THEN CALL SystemTriage with those findings to correlate with logs.
        4. If the user's issue relates to their Sharppay account (balance, transactions), call AccountAssistant.
        5. FINALLY CALL ActionSpecialist to save the data.
        CRITICAL: Ensure ActionSpecialist confirms that tools save_issue_analysis AND save_recommendations were successfully called.
        DO NOT END THE SESSION UNTIL EVERYTHING IS SAVED.
        """,
        sub_agents=[
            grouping_agent,
            analyzer_agent,
            triage_agent,
            action_agent,
            account_assistant,
        ],
    )

    runner = Runner(
        agent=supervisor,
        session_service=_session_service,
        app_name="FinPulse-Agentic-AI",
    )

    @staticmethod
    def run_agentic_pipeline(raw_payload: Dict[str, Any]):
        """
        Runs the full ADK agentic pipeline.
        Now takes raw data and handles grouping internally.
        """
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(AIService._run_adk_runner(raw_payload))
        finally:
            # Allow pending tasks (like AsyncClient.aclose) to finish
            try:
                pending = asyncio.all_tasks(loop)
                if pending:
                    loop.run_until_complete(
                        asyncio.gather(*pending, return_exceptions=True)
                    )
            except Exception as e:
                logger.error(f"Error during loop cleanup in run_agentic_pipeline: {e}")
            loop.close()

    @staticmethod
    async def _run_adk_runner(raw_payload: Dict[str, Any]):
        user_id = "system_orchestrator"
        session = await AIService._session_service.create_session(
            user_id=user_id, app_name="FinPulse-Agentic-AI"
        )

        message_text = f"Process this raw intelligence data:\n{json.dumps(raw_payload)}"
        new_message = Content(parts=[Part(text=message_text)])

        final_response = ""
        async for event in AIService.runner.run_async(
            session_id=session.id, user_id=user_id, new_message=new_message
        ):
            logger.info(f"ADK Event: {type(event).__name__}")
            if event.is_final_response():
                final_response = "".join(
                    [p.text for p in event.content.parts if p.text]
                )
                logger.info(f"Final Response Event Received: {final_response[:100]}...")
            elif event.error_message:
                logger.error(f"ADK Runner Error: {event.error_message}")

            # Log any parts (including tool calls if visible)
            if hasattr(event, "content") and event.content:
                for part in event.content.parts:
                    if part.function_call:
                        logger.info(
                            f"Model requested tool call: {part.function_call.name}"
                        )

        return final_response

    @staticmethod
    def run_smart_reply(chat_id: int):
        """
        Runs a focused agentic pipeline for a single incoming message.
        This is for real-time 'Smart Reply' functionality.
        """
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(AIService._run_smart_reply_runner(chat_id))
        finally:
            # Allow pending tasks (like AsyncClient.aclose) to finish
            try:
                pending = asyncio.all_tasks(loop)
                if pending:
                    loop.run_until_complete(
                        asyncio.gather(*pending, return_exceptions=True)
                    )
            except Exception as e:
                logger.error(f"Error during loop cleanup in run_smart_reply: {e}")
            loop.close()

    @staticmethod
    async def _run_smart_reply_runner(chat_id: int):
        user_id = "smart_reply_orchestrator"
        session = await AIService._session_service.create_session(
            user_id=user_id, app_name="FinPulse-Agentic-AI"
        )

        chat = await sync_to_async(ChatEntry.objects.get)(id=chat_id)

        message_text = (
            f"A customer just sent this message: '{chat.message}'\n"
            f"Sender ID: {chat.sender_id}\n"
            f"Metadata: {json.dumps(chat.metadata)}\n"
            "Please analyze this immediately. Check system logs for correlations and REPLY to the user if you find a problem."
        )
        new_message = Content(parts=[Part(text=message_text)])

        final_response = ""
        async for event in AIService.runner.run_async(
            session_id=session.id, user_id=user_id, new_message=new_message
        ):
            if event.is_final_response():
                final_response = "".join(
                    [p.text for p in event.content.parts if p.text]
                )
            elif event.error_message:
                logger.error(f"ADK Smart Reply Error: {event.error_message}")

        return final_response

    @staticmethod
    def correlate_root_cause(cluster):
        return "Handled by Agentic Pipeline"

    @staticmethod
    def generate_actions(cluster_description, root_cause_analysis):
        return {"summary": "Handled by Agentic Pipeline", "suggested_actions": []}
