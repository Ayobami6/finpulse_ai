import logging
from .email_service import EmailService
from ..models import TeamMember

logger = logging.getLogger(__name__)


class AlertService:
    """
    Service to handle dispatching alerts to various channels (Email, ClickUp, Slack, etc.)
    """

    @staticmethod
    def notify_teams(cluster, action_rec):
        """
        Dispatches alerts based on the issue cluster and action recommendation.
        """
        logger.info(f"Dispatching alerts for Cluster: {cluster.theme}")

        # 1. Fetch team emails from database
        eng_emails = list(
            TeamMember.objects.filter(department__iexact="Engineering").values_list(
                "email", flat=True
            )
        )
        prod_emails = list(
            TeamMember.objects.filter(department__iexact="Product").values_list(
                "email", flat=True
            )
        )

        all_recipients = list(set(eng_emails + prod_emails))

        if not all_recipients:
            logger.warning(
                "No team members found in Engineering or Product departments. Sending to fallback."
            )
            all_recipients = ["support@finpulse.ai"]

        recipients_str = ", ".join(all_recipients)

        subject = f"URGENT: {cluster.theme} (Frequency: {cluster.frequency})"
        body = f"""
        <h2>Issue Cluster: {cluster.theme}</h2>
        <p><strong>Description:</strong> {cluster.description}</p>
        <p><strong>Root Cause Analysis:</strong> {cluster.root_cause_analysis}</p>
        <hr>
        <h3>Recommended Actions</h3>
        <p>{action_rec.summary}</p>
        <ul>
            {"".join(f"<li>{action}</li>" for action in action_rec.suggested_actions)}
        </ul>
        <br>
        <p><a href="http://localhost:3000/dashboard">View Insights Dashboard</a></p>
        """

        # 2. Real Email Delivery
        try:
            email_service = EmailService()
            for recipient in all_recipients:
                email_service.send_email(
                    to_email=recipient, subject=subject, html_body=body
                )
            logger.info(f"Internal alerts sent to {recipients_str}")
        except Exception as e:
            logger.error(f"Failed to send internal team alerts: {e}")

        # 3. Mock ClickUp Task (keeping as mock for now unless asked otherwise)
        AlertService._create_clickup_task(
            title=f"Fix: {cluster.theme}",
            description=f"Root Cause: {cluster.root_cause_analysis}\n\nActions: {action_rec.suggested_actions}",
        )

    @staticmethod
    def _create_clickup_task(title, description):
        logger.info(f"Creating ClickUp Task: {title}")
        # In real app: requests.post(CLICKUP_API, ...)
