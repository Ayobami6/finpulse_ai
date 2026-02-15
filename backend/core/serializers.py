from rest_framework import serializers
from .models import LogEntry, ChatEntry, IssueCluster, ActionRecommendation, TeamMember

class LogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LogEntry
        fields = '__all__'

class ChatEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatEntry
        fields = '__all__'

class ActionRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionRecommendation
        fields = '__all__'

class IssueClusterSerializer(serializers.ModelSerializer):
    actions = ActionRecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = IssueCluster
        fields = '__all__'
        read_only_fields = ['root_cause_analysis', 'metadata']

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'
