class AlertService:
    """
    Service to handle dispatching alerts to various channels (Email, ClickUp, Slack, etc.)
    For now, we mock these interactions.
    """

    @staticmethod
    def notify_teams(cluster, action_rec):
        """
        Dispatches alerts based on the issue cluster and action recommendation.
        """
        print(f"\n[AlertService] Dispatching alerts for Cluster: {cluster.theme}")
        
        # 1. Mock Email
        AlertService._send_email(
            to="support@finpulse.ai, product@finpulse.ai, engineering@finpulse.ai",
            subject=f"URGENT: {cluster.theme} (Frequency: {cluster.frequency})",
            body=f"""
            Issue: {cluster.description}
            Root Cause: {cluster.root_cause_analysis}
            
            Suggested Actions:
            {action_rec.summary}
            
            View Dashboard: http://localhost:3000/dashboard
            """
        )
        
        # 2. Mock ClickUp Task
        AlertService._create_clickup_task(
            title=f"Fix: {cluster.theme}",
            description=f"Root Cause: {cluster.root_cause_analysis}\n\nActions: {action_rec.suggested_actions}"
        )

    @staticmethod
    def _send_email(to, subject, body):
        print(f"[AlertService] 📧 Sending Email to [{to}]")
        print(f"Subject: {subject}")
        # In real app: sendgrid/smtp call here

    @staticmethod
    def _create_clickup_task(title, description):
        print(f"[AlertService] 🎫 Creating ClickUp Task: {title}")
        # In real app: requests.post(CLICKUP_API, ...)
