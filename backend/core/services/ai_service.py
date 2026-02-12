import os
import openai
from sklearn.cluster import DBSCAN
import numpy as np
from ..models import IssueCluster

# Initialize OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

class AIService:
    @staticmethod
    def get_embedding(text):
        if not openai.api_key:
            return np.random.rand(1536).tolist() # Mock embedding
        try:
            response = openai.embeddings.create(
                input=text,
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error getting embedding: {e}")
            return []

    @staticmethod
    def cluster_issues(texts):
        """
        Clusters a list of texts using DBSCAN on embeddings.
        Returns a list of cluster labels.
        -1 indicates noise (unclustered).
        """
        if not texts:
            return []
            
        embeddings = [AIService.get_embedding(text) for text in texts]
        if not embeddings or not embeddings[0]:
            return [-1] * len(texts)

        # DBSCAN clustering
        # eps=0.5, min_samples=3 is a starting point
        clustering = DBSCAN(eps=0.5, min_samples=2, metric='cosine').fit(embeddings)
        return clustering.labels_

    @staticmethod
    def analyze_sentiment(text):
        """
        Returns a sentiment score between -1.0 (negative) and 1.0 (positive).
        """
        # TODO: Use LLM or specific model
        # For now, mock it or use simple keyword matching if API key missing
        if not openai.api_key:
            return 0.0
            
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Analyze the sentiment of the following text. Respond with a single number between -1.0 and 1.0."},
                    {"role": "user", "content": text}
                ],
                max_tokens=10
            )
            content = response.choices[0].message.content.strip()
            return float(content)
        except Exception:
            return 0.0

    @staticmethod
    def generate_actions(cluster_description):
        """
        Generates action recommendations for a cluster.
        """
        if not openai.api_key:
             return {
                "summary": "Mock summary",
                "root_cause": "Mock root cause",
                "actions": ["Check logs", "Restart service"]
            }

        try:
            prompt = f"Analyze this issue cluster: '{cluster_description}'. Provide a summary, likely root cause, and 3 actionable steps."
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            # Parse response (simplified)
            return {
                "summary": response.choices[0].message.content[:100] + "...",
                "root_cause": "AI determined root cause",
                "actions": ["Action 1", "Action 2"]
            }
        except Exception as e:
            print(f"Error generating actions: {e}")
            return {}
