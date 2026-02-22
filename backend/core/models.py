from django.db import models


class LogEntry(models.Model):
    timestamp = models.DateTimeField()
    source = models.CharField(max_length=255)  # e.g. "nginx", "payment-service"
    level = models.CharField(max_length=50)  # INFO, ERROR, WARN
    caller = models.CharField(
        max_length=255, blank=True, null=True
    )  # e.g. "api/api.go:78"
    message = models.TextField()
    metadata = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.timestamp} - {self.source} - {self.level}"


class ChatEntry(models.Model):
    timestamp = models.DateTimeField()
    source = models.CharField(max_length=50)  # "whatsapp", "freshchat"
    external_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    sender_id = models.CharField(max_length=255)
    message = models.TextField()
    sentiment_score = models.FloatField(null=True, blank=True)
    metadata = models.JSONField(default=dict)
    processed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.source} - {self.sender_id}"


class IngestionLog(models.Model):
    source = models.CharField(max_length=50, unique=True)  # "whatsapp", "freshchat"
    last_polled_at = models.DateTimeField(auto_now=True)
    offset = models.CharField(
        max_length=255, blank=True, null=True
    )  # Cursor or ID for pagination

    def __str__(self):
        return f"{self.source} - {self.last_polled_at}"


class IssueCluster(models.Model):
    theme = models.CharField(max_length=255)  # "Transfer Failed"
    description = models.TextField()
    frequency = models.IntegerField(default=0)
    trend = models.CharField(
        max_length=10, choices=[("UP", "Up"), ("DOWN", "Down"), ("STABLE", "Stable")]
    )
    sentiment_score = models.FloatField()
    sample_messages = models.JSONField(default=list)
    root_cause_analysis = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.theme


class ActionRecommendation(models.Model):
    cluster = models.ForeignKey(
        IssueCluster, on_delete=models.CASCADE, related_name="actions"
    )
    summary = models.TextField()
    likely_root_cause = models.TextField()
    suggested_actions = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Action for {self.cluster.theme}"


class TeamMember(models.Model):
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100)  # Product, Engineering, Ops
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.email


class IntegrationConfig(models.Model):
    SOURCE_CHOICES = [
        ("whatsapp", "WhatsApp"),
        ("freshchat", "Freshchat"),
    ]
    source_type = models.CharField(max_length=50, choices=SOURCE_CHOICES, unique=True)
    api_key = models.TextField()
    webhook_secret = models.TextField(blank=True, null=True)
    account_url = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.source_type} Config"
