import requests
import random
from datetime import datetime
import time

BASE_URL = "http://localhost:8000/api"

def seed_logs():
    sources = ["payment_service", "auth_service", "core_backend", "frontend_app"]
    levels = ["INFO", "WARNING", "ERROR"]
    messages = [
        "Payment gateway timeout",
        "User login failed",
        "Database connection lost",
        "API rate limit exceeded",
        "Transaction processed successfully",
        "High latency detected"
    ]

    print("Seeding logs...")
    for _ in range(20):
        data = {
            "timestamp": datetime.now().isoformat(),
            "source": random.choice(sources),
            "level": random.choice(levels),
            "message": random.choice(messages),
            "metadata": {"latency": random.randint(10, 500)}
        }
        try:
            requests.post(f"{BASE_URL}/logs/", json=data)
        except requests.exceptions.RequestException as e:
            print(f"Error seeding log: {e}")

def seed_chats():
    sources = ["whatsapp", "freshchat", "email"]
    messages = [
        "My transfer failed again! Fix this now.",
        "How do I reset my password?",
        "Great service, thanks!",
        "Why is my account blocked?",
        "I need help with a refund.",
        "The app is crashing on startup.",
        "Where can I find my transaction history?"
    ]

    print("Seeding chats...")
    for i in range(15):
        data = {
            "timestamp": datetime.now().isoformat(),
            "source": random.choice(sources),
            "sender_id": f"user_{random.randint(1000, 9999)}",
            "message": random.choice(messages),
            "metadata": {"platform": "mobile"}
        }
        try:
            requests.post(f"{BASE_URL}/chats/", json=data)
        except requests.exceptions.RequestException as e:
            print(f"Error seeding chat: {e}")
        time.sleep(0.1) # Simulate delay

if __name__ == "__main__":
    try:
        seed_logs()
        seed_chats()
        print("Seeding complete!")
    except Exception as e:
        print(f"Seeding failed: {e}")
