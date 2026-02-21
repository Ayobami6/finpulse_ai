from django.contrib import admin
from .models import (
    LogEntry,
    ChatEntry,
    IngestionLog,
    IssueCluster,
    ActionRecommendation,
    TeamMember,
    IntegrationConfig,
)


@admin.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "source", "level", "message")
    list_filter = ("source", "level")
    search_fields = ("message", "source")


@admin.register(ChatEntry)
class ChatEntryAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "source", "sender_id", "sentiment_score", "processed")
    list_filter = ("source", "processed")
    search_fields = ("message", "sender_id", "external_id")


@admin.register(IngestionLog)
class IngestionLogAdmin(admin.ModelAdmin):
    list_display = ("source", "last_polled_at", "offset")
    list_filter = ("source",)


@admin.register(IssueCluster)
class IssueClusterAdmin(admin.ModelAdmin):
    list_display = ("theme", "frequency", "trend", "sentiment_score", "created_at")
    list_filter = ("trend",)
    search_fields = ("theme", "description")


@admin.register(ActionRecommendation)
class ActionRecommendationAdmin(admin.ModelAdmin):
    list_display = ("cluster", "summary", "created_at")
    search_fields = ("summary", "likely_root_cause")


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "department")
    list_filter = ("department",)
    search_fields = ("name", "email")


@admin.register(IntegrationConfig)
class IntegrationConfigAdmin(admin.ModelAdmin):
    list_display = ("source_type", "account_url", "is_active", "last_synced_at")
    list_filter = ("source_type", "is_active")
    search_fields = ("account_url",)
