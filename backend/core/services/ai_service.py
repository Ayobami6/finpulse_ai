import os
import openai
from sklearn.cluster import DBSCAN
import numpy as np
from django.utils import timezone
from datetime import timedelta
from ..models import IssueCluster, LogEntry

# Initialize OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

class AIService:
    @staticmethod
    def get_embedding(text):
        if not openai.api_key:
            # Mock embedding: explicit deterministic mock for testing
            # Use hash of text to seed random so similar text gets similar embeddings
            seed = sum(ord(c) for c in text)
            np.random.seed(seed)
            return np.random.rand(1536).tolist()
            
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
        # eps=0.5, min_samples=2 is a starting point for small batches
        # Metric cosine distance is 1 - cosine similarity
        clustering = DBSCAN(eps=0.3, min_samples=2, metric='cosine').fit(embeddings)
        return clustering.labels_

    @staticmethod
    def analyze_sentiment(text):
        """
        Returns a sentiment score between -1.0 (negative) and 1.0 (positive).
        """
        if not openai.api_key:
            # Mock sentiment based on keywords
            text_lower = text.lower()
            if "failed" in text_lower or "error" in text_lower or "broken" in text_lower:
                return -0.8
            if "bad" in text_lower or "slow" in text_lower:
                return -0.5
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
    def correlate_root_cause(cluster):
        """
        Correlates a cluster with system logs.
        1. Find time window of chats in cluster.
        2. Fetch error logs in that window.
        3. Use LLM to check semantic correlation.
        """
        # 1. Get time window
        # Assuming cluster is fresh, look back 1 hour from now or from sample messages
        # In a real system, we'd use the timestamps of the messages in the cluster
        time_threshold = timezone.now() - timedelta(hours=1)
        
        # 2. Fetch error logs
        error_logs = LogEntry.objects.filter(
            timestamp__gte=time_threshold,
            level='ERROR'
        ).order_by('-timestamp')[:10] # Top 10 recent errors
        
        if not error_logs.exists():
            return "No recent system errors found to correlate."

        log_summaries = "\n".join([f"[{log.timestamp}] {log.source}: {log.message}" for log in error_logs])
        cluster_text = "\n".join(cluster.sample_messages[:5])

        # 3. LLM Correlation
        if not openai.api_key:
            # Mock correlation
            first_log = error_logs.first()
            return f"Mock Correlation: Detected potential link to {first_log.source} error: {first_log.message}"

        try:
            prompt = (
                f"Analyze the following CUSTOMER COMPLAINTS and SYSTEM LOGS to find a root cause correlation.\n\n"
                f"CUSTOMER COMPLAINTS:\n{cluster_text}\n\n"
                f"SYSTEM LOGS:\n{log_summaries}\n\n"
                f"Is there a correlation? If yes, explain it concisely. If no, say 'No correlation found'."
            )
            
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Error analyzing correlation: {e}"

    @staticmethod
    def generate_actions(cluster_description, root_cause_analysis):
        """
        Generates action recommendations.
        """
        if not openai.api_key:
             return {
                "summary": f"Issue with {cluster_description}",
                "likely_root_cause": root_cause_analysis,
                "suggested_actions": ["Investigate logs", "Check service health", "Notify engineering"]
            }

        try:
            prompt = (
                f"Issue: {cluster_description}\n"
                f"Root Cause Analysis: {root_cause_analysis}\n\n"
                f"Provide:\n1. A 1-sentence summary.\n2. Likely root cause.\n3. 3 specific actionable steps for Ops/Eng."
            )
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}]
            )
            # Naive parsing
            content = response.choices[0].message.content
            return {
                "summary": content[:200] + "...", # Simplified
                "likely_root_cause": root_cause_analysis,
                "suggested_actions": [content] # Put full content in list for now
            }
        except Exception as e:
            return {}
