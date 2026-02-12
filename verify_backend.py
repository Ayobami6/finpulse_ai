import requests
import time
import subprocess
import os
import signal
import sys

# Define URLs
BASE_URL = "http://localhost:8000/api"

def run_verification():
    print("Starting verification...")
    
    # Check if Redis is running
    try:
        subprocess.check_call(["docker", "compose", "ps", "redis"], cwd="/home/ayo/.gemini/antigravity/scratch/finpulse_ai", stdout=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print("Redis is not running. Please start it with 'docker compose up -d redis'.")
        return False

    # 1. Start Django Server
    django_process = subprocess.Popen(
        ["uv", "run", "python", "manage.py", "runserver"],
        cwd="/home/ayo/.gemini/antigravity/scratch/finpulse_ai/backend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid 
    )
    print(f"Django server started with PID {django_process.pid}.")

    # 2. Start Celery Worker
    celery_process = subprocess.Popen(
        ["uv", "run", "celery", "-A", "config", "worker", "--loglevel=info"],
        cwd="/home/ayo/.gemini/antigravity/scratch/finpulse_ai/backend",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid
    )
    print(f"Celery worker started with PID {celery_process.pid}.")

    # 3. Wait for services to start
    print("Waiting for services to initialize...")
    time.sleep(10)

    try:
        # Check if server is reachable
        try:
            requests.get("http://localhost:8000/admin/", timeout=5)
        except requests.exceptions.ConnectionError:
            print("Django server failed to start.")
            # Print stderr
            print(django_process.stderr.read().decode())
            return False

        # 4. Test Log Ingestion
        print("Testing Log Ingestion...")
        log_data = {
            "timestamp": "2023-10-27T10:00:00Z",
            "source": "payment_service",
            "level": "ERROR",
            "message": "Payment gateway timeout",
            "metadata": {"transaction_id": "12345"}
        }
        response = requests.post(f"{BASE_URL}/logs/", json=log_data)
        if response.status_code == 201:
            print(f"Log ingestion successful. ID: {response.json()['id']}")
        else:
            print(f"Log ingestion failed: {response.status_code} {response.text}")
            return False

        # 5. Test Chat Ingestion
        print("Testing Chat Ingestion...")
        chat_data = {
            "timestamp": "2023-10-27T10:05:00Z",
            "source": "whatsapp",
            "sender_id": "+1234567890",
            "message": "I cannot transfer money",
            "metadata": {}
        }
        response = requests.post(f"{BASE_URL}/chats/", json=chat_data)
        if response.status_code == 201:
             print(f"Chat ingestion successful. ID: {response.json()['id']}")
        else:
            print(f"Chat ingestion failed: {response.status_code} {response.text}")
            return False
            
        print("Verification passed!")
        return True

    except Exception as e:
        print(f"Verification failed with error: {e}")
        return False
    finally:
        # Cleanup
        print("Stopping services...")
        os.killpg(os.getpgid(django_process.pid), signal.SIGTERM)
        os.killpg(os.getpgid(celery_process.pid), signal.SIGTERM)

if __name__ == "__main__":
    success = run_verification()
    sys.exit(0 if success else 1)
