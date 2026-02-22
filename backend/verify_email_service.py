import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.services.email_service import EmailService


def verify_email():
    print("Initializing EmailService...")
    try:
        service = EmailService()
        print("Sending test email...")
        response = service.send_email(
            to_email="test@example.com",
            subject="FinPulse AI Test Email",
            html_body="<h1>Hello!</h1><p>This is a test email from FinPulse AI.</p>",
        )
        print(f"Response: {response}")
        if response.get("success") is not False:
            print("Verification successful!")
        else:
            print(f"Verification failed: {response.get('error')}")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    verify_email()
