import os
import django
import json

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.services.ai_service import AIService
from django.conf import settings


def verify_gemini():
    print("Verifying Gemini AI Service Integration...")

    api_key = getattr(settings, "GOOGLE_GEMINI_API_KEY", "")
    # if not api_key or api_key == "YOUR_GOOGLE_GEMINI_API_KEY":
    #     print("ERROR: GOOGLE_GEMINI_API_KEY is not set correctly in settings.")
    #     return

    # 1. Test Embedding
    print("\n1. Testing Embeddings...")
    text = "The system is failing and users are angry."
    embedding = AIService.get_embedding(text)
    if embedding and len(embedding) > 0:
        print(f"SUCCESS: Got embedding of length {len(embedding)}")
    else:
        print("FAILURE: Failed to get embedding.")

    # 2. Test Sentiment
    print("\n2. Testing Sentiment Analysis...")
    sentiment = AIService.analyze_sentiment(text)
    print(f"Sentiment for '{text}': {sentiment}")
    if isinstance(sentiment, float):
        print("SUCCESS: Sentiment score is a float.")
    else:
        print("FAILURE: Sentiment score is not a float.")

    # 3. Test Recommendations (Mock Cluster)
    print("\n3. Testing Action Recommendations...")
    cluster_desc = "Payment gateway timeout errors"
    root_cause = "Redis connection pool exhaustion"
    actions = AIService.generate_actions(cluster_desc, root_cause)
    print("Generated Actions:")
    print(json.dumps(actions, indent=2))

    if actions.get("summary") and actions.get("suggested_actions"):
        print("SUCCESS: AI Service returned structured recommendations.")
    else:
        print("FAILURE: Action recommendations are missing fields.")


if __name__ == "__main__":
    verify_gemini()
