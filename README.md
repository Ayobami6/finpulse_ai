# FinPulse AI

**Automated Intelligence for Fintech Operations**

FinPulse AI is an automated intelligence layer designed to streamline fintech operations. It listens to customer complaints (from sources like WhatsApp, Freshchat) and system signals (logs), correlates them to identify root causes, and provides actionable insights to Product, Engineering, and Operations teams.

## 🚀 Vision

To move organizations from reactive firefighting to proactive, data-driven resolution by:
-   **Automating Issue Detection:** Clustering support messages into themes.
-   **Correlating Root Causes:** Linking complaints to system error logs.
-   **Providing Actionable Intelligence:** Generating summaries and suggested fixes.
-   **Enabling Closed-Loop Automation:** Alerting teams and effectively managing issues.

## 🛠 Tech Stack

The project is a monorepo structured with distinct frontend and backend services.

### Backend (`/backend`)
-   **Language:** Python
-   **Frameworks:** Django, Django REST Framework
-   **AI/ML:** OpenAI, scikit-learn, pandas
-   **Async Processing:** Celery, Redis
-   **Real-time:** Channels, Daphne
-   **Server:** Gunicorn, Uvicorn

### Frontend (`/frontend`)
-   **Framework:** Next.js (check `frontend/package.json` for exact version)
-   **Library:** React
-   **Styling:** Tailwind CSS
-   **Language:** TypeScript

### Infrastructure
-   **Containerization:** Docker (for services like Redis)

## 📂 Project Structure

```
finpulse_ai/
├── backend/            # Django API and AI Engine
├── frontend/           # Next.js Web App
├── conductor/          # Project documentation, plans, and workflows
├── scripts/            # Utility scripts
└── docker-compose.yml  # Infrastructure orchestration (Redis, etc.)
```

## ⚡️ Getting Started

### Prerequisites

-   Python 3.10+
-   Node.js 18+
-   Docker (for Redis)

### 1. Services Setup (Redis)

Start the required infrastructure services:

```bash
docker-compose up -d redis
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Set up environment variables (create a `.env` file based on your configuration requirements).

Run migrations:

```bash
python manage.py migrate
```

Start the development server:

```bash
python manage.py runserver
```

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to view the application.

## 📘 Documentation

Detailed documentation and project plans can be found in the `conductor/` directory:
-   `conductor/product.md`: Product vision and feature definitions.
-   `conductor/tech-stack.md`: Detailed technology choices.
-   `conductor/workflow.md`: Development workflows and guidelines.

## 🤝 Contributing

Please refer to `conductor/workflow.md` for detailed instructions on the development workflow, testing requirements, and code review process.

## 📄 License

[Insert License Information Here]
