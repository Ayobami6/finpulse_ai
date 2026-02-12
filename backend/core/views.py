from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import LogEntry, ChatEntry, IssueCluster, ActionRecommendation, TeamMember
from .serializers import (
    LogEntrySerializer, ChatEntrySerializer,
    IssueClusterSerializer, ActionRecommendationSerializer,
    TeamMemberSerializer
)
from .tasks import process_new_log_entry, process_new_chat_entry


class LogEntryViewSet(viewsets.ModelViewSet):
    queryset = LogEntry.objects.all().order_by('-timestamp')
    serializer_class = LogEntrySerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        process_new_log_entry.delay(instance.id)


class ChatEntryViewSet(viewsets.ModelViewSet):
    queryset = ChatEntry.objects.all().order_by('-timestamp')
    serializer_class = ChatEntrySerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        process_new_chat_entry.delay(instance.id)


class IssueClusterViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IssueCluster.objects.all().order_by('-frequency')
    serializer_class = IssueClusterSerializer

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Returns top 5 issues for the dashboard.
        """
        top_issues = self.queryset[:5]
        serializer = self.get_serializer(top_issues, many=True)
        return Response(serializer.data)


from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for executive dashboard metrics.
    """
    @action(detail=False, methods=['get'])
    def executive_summary(self, request):
        # 1. Top 5 Issues (Clusters)
        top_clusters = IssueCluster.objects.order_by('-frequency')[:5]
        top_issues_data = IssueClusterSerializer(top_clusters, many=True).data

        # 2. Angry Customers (Lowest Sentiment)
        angry_chats = ChatEntry.objects.order_by('sentiment_score')[:5]
        angry_customers = [{"sender": c.sender_id, "score": c.sentiment_score, "message": c.message} for c in angry_chats]

        # 3. System Components (Log Failures)
        # Group by source for ERROR logs
        failing_components = LogEntry.objects.filter(level='ERROR').values('source').annotate(count=Count('source')).order_by('-count')[:5]

        return Response({
            "top_issues": top_issues_data,
            "angry_customers": angry_customers,
            "failing_components": failing_components
        })


class ActionRecommendationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActionRecommendation.objects.all()
    serializer_class = ActionRecommendationSerializer


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
