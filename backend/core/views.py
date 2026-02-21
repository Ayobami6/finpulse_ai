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
        # 1. Top 5 Issues (Clusters)
        top_clusters = IssueCluster.objects.order_by("-frequency")[:5]
        top_issues_data = IssueClusterSerializer(top_clusters, many=True).data

        # 2. Angry Customers (Lowest Sentiment)
        angry_chats = ChatEntry.objects.order_by("sentiment_score")[:5]
        angry_customers = [
            {"sender": c.sender_id, "score": c.sentiment_score, "message": c.message}
            for c in angry_chats
        ]

        # 3. System Components (Log Failures)
        # Group by source for ERROR logs
        failing_components = (
            LogEntry.objects.filter(level="ERROR")
            .values("source")
            .annotate(count=Count("source"))
            .order_by("-count")[:5]
        )

        return Response(
            {
                "top_issues": top_issues_data,
                "angry_customers": angry_customers,
                "failing_components": failing_components,
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
