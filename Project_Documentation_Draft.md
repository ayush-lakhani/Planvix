# Project Documentation: Multi AI Agent Content Planner (planvIx) - CrewAI 5-Agent Pipeline

This document serves as the foundational draft for your MCA semester 4 project report. It expands on the core sections required for your documentation, specifically tailored to your Multi AI Agent Content Planner architecture.

---

## 1. Detailed Methodology

This section outlines the comprehensive approach, architectural patterns, and technology stack utilized to research, design, and develop the planvIx continuous content planning system. The methodology acts as the blueprint for ensuring the system is scalable, robust, and capable of handling complex AI orchestrations.

**1.1 Software Development Life Cycle (SDLC): Agile Scrum Framework**
The development of this project adheres strictly to the **Agile Software Development Lifecycle**, specifically utilizing a Scrum-based framework. This approach was chosen over traditional waterfall methods due to the experimental and rapidly evolving nature of Large Language Models (LLMs) and Multi-Agent Systems.

- **Iterative Sprints:** Development is broken down into 1-2 week sprints, allowing for continuous integration of complex AI behaviors and rapid prototyping.
- **Continuous Feedback Loop:** By regularly testing agent interactions and validating their outputs, the development process remains adaptable to API changes, latency issues, and prompt engineering refinements required by AI providers.
- **Version Control:** Git is used for source code management, ensuring all changes to the frontend components and backend logic are tracked, facilitating safe rollbacks and branching for experimental features.

**1.2 System Architecture Approach: CrewAI Sequential Process**
The core innovation of this project lies in utilizing **CrewAI** with a 5-agent sequential pipeline. Each agent specializes in a specific aspect of content strategy generation.

- **Agent 1 - Persona Agent:** Defines the target audience persona including demographics, interests, and pain points.
- **Agent 2 - Trend Agent:** Researches current market trends and competitive landscape for the given topic.
- **Agent 3 - Traffic Agent:** Analyzes potential traffic sources and keyword opportunities.
- **Agent 4 - Synthesis Agent:** Combines allinputs to generate the final content strategy.
- **Agent 5 - ROI Agent:** Calculates projected ROI and provides actionable recommendations.

The orchestrator (`crew_orchestrator.py`) manages the sequential flow, passing outputs from each agent as inputs to the next.

**1.3 Technology Stack Selection & Justification**
The technology stack was carefully selected to balance rapid frontend development with powerful, AI-capable backend processing.

- **Frontend (Presentation Layer):**
  - **React.js:** Chosen for building a dynamic Single Page Application (SPA). React's component-based architecture allows for the reusable design of complex UI components like the `AgentTerminal.jsx`.
  - **CSS / Tailwind CSS:** Used for responsive styling, ensuring the application is accessible on various devices while maintaining a modern, dark-themed aesthetic (`index.css`).
  - **Chart.js / Recharts:** Integrated to power the `RevenueAndUserCharts.jsx` dashboard, enabling the visualization of complex temporal data and usage metrics.

- **Backend (Application & Orchestration Layer):**
  - **Python (FastAPI):** Python is the industry standard for AI and Data Science. The `app/core/` structure was organized using Python to leverage robust support for LLM libraries (like CrewAI, LangChain). FastAPI was chosen for its high performance and native support for asynchronous request handling, which is crucial when waiting for slow AI API responses.

- **AI Orchestration:**
  - **CrewAI:** Framework for building AI agent teams with role-based specialization and sequential task execution.
  - **Groq (Llama 3.3 70B):** High-performance LLM inference API with fast response times.

- **Security & Middleware Layer:**
  - **Custom Python Modules:** Security is prioritized at the gateway level. The `security.py` module manages JSON Web Tokens (JWT) for stateless authentication.
  - **Rate Limiting & Redis:** The `rate_limit.py` ensures the system cannot be spammed, protecting against exorbitant LLM API costs. Redis provides distributed rate limiting across multiple instances. `middleware.py` handles Cross-Origin Resource Sharing (CORS) to safely connect the React frontend with the Python backend.

- **Database (Data Persistence Layer):**
  - **MongoDB Atlas:** A flexible NoSQL database chosen to handle both structured user data (profiles, subscription tiers) and semi-structured AI-generated text (agent outputs, final content plans). It securely stores user sessions, tracks agent states, and persists generated strategies for future dashboard retrieval using high-performance aggregation pipelines.

**1.4 Communication Protocols**

- **RESTful APIs:** Standard synchronous communication between the frontend client and the backend server for CRUD operations (e.g., fetching user data, updating settings).
- **WebSockets:** Utilized for real-time activity feeds and generation status updates. Since AI generation can take 10-30 seconds, WebSockets provide immediate, bi-directional feedback to the user and admin, vastly improving the User Experience (UX) and observability.

**1.5 Observability and Error Management**

- Robust error handling is integrated throughout the system. The `logger.py` module captures all critical system events, AI API timeouts, and application crashes. Centralized logging and a dedicated WebSocket activity feed ensure the system maintains high availability and transparency.

---

## 2. Requirement Specification

This defines what the system must do and the constraints under which it operates.

**2.1 Functional Requirements (FR)**

- **User Registration & Authentication:** Users can securely sign up, log in (via Email or Google OAuth), and manage their profiles.
- **AI Agent Orchestration Feed:** The system provides a real-time feed where users can view autonomous agent activities and status updates.
- **5-Agent CrewAI Pipeline:** The backend orchestrates 5 sequential agents (Persona -> Trend -> Traffic -> Synthesis -> ROI).
- **Real-time Synchronization:** The system syncs progress via WebSockets for immediate feedback and live admin monitoring.
- **Enterprise Analytics Dashboard:** Visualizes business KPIs (MRR, Churn, ARPU) and AI usage metrics through interactive Recharts components.
- **Content History:** Users can view, manage, and delete previously generated content strategies.

**2.2 Non-Functional Requirements (NFR)**

- **Security:** Passwords must be hashed. API routes must be protected via authentication middleware (`security.py`).
- **Rate Limiting:** To prevent abuse and manage API costs (e.g., Groq API limits), the system must enforce strict rate limits per user/tier using Redis (`rate_limit.py`).
- **Performance & Scalability:** The backend must handle concurrent agent executions without blocking the main event loop.
- **Observability/Logging:** All critical system events, errors, and agent API calls must be logged securely (`logger.py`) for debugging and audit purposes.

---

## 3. DFD / ERD (Data Flow & Entity Relationship)

This section conceptualizes how data is structured and how it moves through the system.

**3.1 Entity Relationship Diagram (ERD) - Core Entities**

- **User:** `user_id` (PK), `username`, `email`, `password_hash`, `subscription_tier`, `monthly_quota`, `created_at`.
- **Task:** `task_id` (PK), `user_id` (FK), `topic`, `status` (Pending, Running, Completed, Failed), `started_at`, `completed_at`.
- **Strategy:** `strategy_id` (PK), `task_id` (FK), `target_audience`, `content_tone`, `target_platform`, `keywords`.
- **CrewAgent:** `agent_id` (PK), `role` (Persona/Trend/Traffic/Synthesis/ROI), `agent_type`, `model_type`, `system_prompt`.
- **AgentExecution:** `execution_id` (PK), `task_id` (FK), `agent_id` (FK), `inputs`, `outputs`, `tokens_used`, `executed_at`.
- **UsageTracking:** `usage_id` (PK), `user_id` (FK), `tokens_consumed`, `requests_made`, `period_start`, `period_end`.
- **ContentPlan:** `plan_id` (PK), `task_id` (FK), `final_content`, `target_platform`, `scheduled_date`.
- **System Logs:** `log_id` (PK), `severity_level`, `module`, `message`, `timestamp`.

_(For your project report, you will need to draw these out using boxes and connecting lines, showing 1-to-many relationships, e.g., One User can have Many Tasks)._

**3.2 Data Flow Diagram (DFD) - Level 1 Flow (5-Agent Pipeline)**

1.  **Input:** User submits a content topic via the React Frontend.
2.  **Process 1 (API Gateway):** The Python backend receives the request, middleware validates the JWT/Google token, and `rate_limit.py` checks usage quotas against Redis.
3.  **Process 2 (CrewAI Orchestrator):** The backend spawns 5 sequential agents.
4.  **Agent Pipeline:**
    - Agent 1 (Persona) processes -> Agent 2 (Trend) processes -> Agent 3 (Traffic) processes -> Agent 4 (Synthesis) processes -> Agent 5 (ROI) processes
5.  **Data Store:** Each strategy is saved to the MongoDB `strategies` collection, and usage is logged to `ai_usage_logs`.
6.  **Output:** The backend broadcasts progress via WebSockets back to the Frontend, which updates the UI in real-time.

---

## 4. System Architecture Diagram

The application follows a **Modern Client-Server Micro-architecture** pattern with WebSocket layer.

- **Client (Tier 1):** A Single Page Application (SPA) built with React. It maintains local state and handles user interactions without full page reloads.
- **API / Web Server (Tier 2):** A Python FastAPI application serving RESTful/SSE endpoints. It acts as the CrewAI orchestrator.
- **Caching Layer (Tier 2.5):** Redis for rate limiting and live feed caching.
- **AI Integration Layer (Tier 3):** Groq API communicating with Llama 3.3 70B model.
- **Database (Tier 4):** Persistent storage for user data, tasks, strategies, and usage tracking.

_(Visually, this is represented as 4-5 vertical or horizontal blocks with arrows showing bi-directional data flow, explicitly noting the JSON data format over HTTP/HTTPS and SSE for streaming)._

---

## 5. Interface Design

This component outlines the visible touchpoints of the application.

**5.1 Agent Command Terminal (`AgentTerminal.jsx`)**

- **Concept:** Designed for power users, mirroring a developer console.
- **Features:** A dark-themed text area where users input prompts. Above the input, a scrolling feed displays real-time agent activities, color-coded by agent type (Persona in blue, Trend in green, Traffic in yellow, Synthesis in orange, ROI in purple).

**5.2 Analytics Dashboard (`RevenueAndUserCharts.jsx`)**

- **Concept:** A visual summary of system health and user productivity.
- **Features:** Line charts showing content generation trends over time, and pie charts displaying the distribution of usage across different AI agent roles. Designed using clean, minimalist UI principles for immediate readability.

**5.3 Overall UI/UX Guidelines**

- **Responsive Layout:** Adapting fluidly between desktop and mobile views.
- **State Feedback:** Using loading spinners, toast notifications, and skeleton loaders to indicate asynchronous operations (e.g., waiting for AI to generate text).
- **Theming:** Consistent color palette controlled via CSS variables in `index.css`.
