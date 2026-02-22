from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import (
    LogEntry,
    ChatEntry,
    IssueCluster,
    ActionRecommendation,
    TeamMember,
    IntegrationConfig,
)
from .serializers import (
    LogEntrySerializer,
    ChatEntrySerializer,
    IssueClusterSerializer,
    ActionRecommendationSerializer,
    TeamMemberSerializer,
    IntegrationConfigSerializer,
)
from .tasks import process_new_log_entry, process_new_chat_entry
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from .services.freshchat_service import FreshchatService
from .services.whatsapp_service import WhatsAppService
import logging

logger = logging.getLogger(__name__)


class LogEntryViewSet(viewsets.ModelViewSet):
    queryset = LogEntry.objects.all().order_by("-timestamp")
    serializer_class = LogEntrySerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        process_new_log_entry.delay(instance.id)


class ChatEntryViewSet(viewsets.ModelViewSet):
    queryset = ChatEntry.objects.all().order_by("-timestamp")
    serializer_class = ChatEntrySerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        process_new_chat_entry.delay(instance.id)


class IssueClusterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IssueCluster.objects.all().order_by("-frequency")
    serializer_class = IssueClusterSerializer

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """
        Returns top 5 issues for the dashboard.
        """
        top_issues = self.queryset[:5]
        serializer = self.get_serializer(top_issues, many=True)
        return Response(serializer.data)


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for executive dashboard metrics.
    """

    @action(detail=False, methods=["get"])
    def executive_summary(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # 1. Stats
        active_issues_count = IssueCluster.objects.count()
        avg_sentiment = (
            ChatEntry.objects.aggregate(Avg("sentiment_score"))["sentiment_score__avg"]
            or 0
        )
        system_errors = LogEntry.objects.filter(
            level="ERROR", timestamp__gte=now - timedelta(days=1)
        ).count()
        auto_actions = ActionRecommendation.objects.count()

        # 2. Top 5 Issues (Clusters)
        top_clusters = IssueCluster.objects.order_by("-frequency")[:5]
        top_issues_data = IssueClusterSerializer(top_clusters, many=True).data

        # 3. Chart Data (Issue Trends - last 30 days)
        # Group by day
        daily_counts = (
            IssueCluster.objects.filter(created_at__gte=thirty_days_ago)
            .extra(select={"day": "date(created_at)"})
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        chart_data = [
            {"name": item["day"], "value": item["count"]} for item in daily_counts
        ]

        # 4. Component Impact
        failing_components = (
            LogEntry.objects.filter(level="ERROR")
            .values("source")
            .annotate(value=Count("source"))
            .order_by("-value")[:5]
        )
        component_impact = [
            {"name": item["source"], "value": item["value"]}
            for item in failing_components
        ]

        # 5. Customer Segments (Mock for now, as we don't have segments in models yet)
        # But we can base it on volume of chats per sender_id if we had a mapping
        customer_segments = [
            {
                "id": 1,
                "name": "General Users",
                "description": "Standard account holders",
                "sentiment_score": avg_sentiment,
                "complaints_count": ChatEntry.objects.count(),
            },
        ]

        return Response(
            {
                "stats": {
                    "active_issues": {
                        "value": active_issues_count,
                        "trend": "Last 7 days",
                        "direction": "neutral",
                    },
                    "avg_sentiment": {
                        "value": f"{avg_sentiment:.1f}/5",
                        "trend": "Real-time",
                        "direction": "neutral",
                    },
                    "system_errors": {
                        "value": system_errors,
                        "trend": "Last 24h",
                        "direction": "up" if system_errors > 0 else "neutral",
                    },
                    "auto_actions": {
                        "value": auto_actions,
                        "trend": "Total recommendations",
                        "direction": "neutral",
                    },
                },
                "top_issues": top_issues_data,
                "chart_data": chart_data,
                "component_impact": component_impact,
                "customer_segments": customer_segments,
            }
        )


class ActionRecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActionRecommendation.objects.all()
    serializer_class = ActionRecommendationSerializer


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer


class IntegrationConfigViewSet(viewsets.ModelViewSet):
    queryset = IntegrationConfig.objects.all()
    serializer_class = IntegrationConfigSerializer


class FreshchatWebhookView(APIView):
    """
    Endpoint for Freshchat webhooks.
    """

    permission_classes = []  # Open endpoint, verified by signature
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        signature = request.headers.get("X-Freshchat-Signature")
        if not signature:
            return Response(
                {"error": "Missing signature"}, status=status.HTTP_400_BAD_REQUEST
            )

        payload = request.body
        service = FreshchatService()

        if not service.verify_signature(payload, signature):
            return Response(
                {"error": "Invalid signature"}, status=status.HTTP_403_FORBIDDEN
            )

        try:
            data = request.data
            messages = service.handle_webhook_payload(data)

            for msg in messages:
                chat = ChatEntry.objects.create(
                    timestamp=msg["timestamp"],
                    source=msg["source"],
                    sender_id=msg["sender_id"],
                    message=msg["message"],
                    external_id=msg["id"],
                    metadata=msg["metadata"],
                )
                process_new_chat_entry.delay(chat.id)

            return Response({"status": "success"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error processing Freshchat webhook: {e}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class WhatsAppWebhookView(APIView):
    """
    Endpoint for WhatsApp webhooks (Meta Graph API).
    """

    permission_classes = []
    authentication_classes = []

    def get(self, request, *args, **kwargs):
        """
        Webhook verification (GET request from Meta).
        """
        service = WhatsAppService()
        mode = request.query_params.get("hub.mode")
        token = request.query_params.get("hub.verify_token")
        challenge = request.query_params.get("hub.challenge")

        if mode and token:
            result = service.verify_webhook(mode, token, challenge)
            if result:
                from django.http import HttpResponse

                return HttpResponse(result)

        return Response("Verification failed", status=status.HTTP_403_FORBIDDEN)

    def post(self, request, *args, **kwargs):
        """
        Incoming messages (POST request from Meta).
        """
        service = WhatsAppService()
        data = request.data

        try:
            messages = service.handle_webhook_payload(data)

            for msg in messages:
                chat = ChatEntry.objects.create(
                    timestamp=msg["timestamp"],
                    source=msg["source"],
                    sender_id=msg["sender_id"],
                    message=msg["message"],
                    external_id=msg["id"],
                    metadata=msg["metadata"],
                )
                process_new_chat_entry.delay(chat.id)

            return Response({"status": "success"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error processing WhatsApp webhook: {e}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
