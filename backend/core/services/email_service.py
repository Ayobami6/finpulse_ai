import os
import logging
from typing import List, Dict, Any, Optional
from mailnow import MailnowClient, MailnowError

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("MAILNOW_API_KEY")
        if not self.api_key:
            logger.error("MAILNOW_API_KEY not found in environment variables.")
            raise ValueError("MAILNOW_API_KEY is required.")

        try:
            self.client = MailnowClient(api_key=self.api_key)
            logger.info("MailnowClient initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize MailnowClient: {e}")
            raise

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        from_email: str = "noreply@finpulse.ai",
        attachments: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Sends an email using the Mailnow API.
        """
        logger.info(f"Sending email to {to_email} with subject: {subject}")
        try:
            response = self.client.send_email(
                from_email=from_email,
                to_email=to_email,
                subject=subject,
                html=html_body,
                attachments=attachments,
            )
            logger.info(
                f"Email sent successfully. Message ID: {response.get('message_id')}"
            )
            return response
        except MailnowError as e:
            logger.error(f"Mailnow error while sending email: {e}")
            return {"success": False, "error": str(e)}
        except Exception as e:
            logger.error(f"Unexpected error while sending email: {e}")
            return {"success": False, "error": str(e)}
