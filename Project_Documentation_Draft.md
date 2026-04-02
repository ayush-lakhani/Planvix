# Project Documentation: Multi AI Agent Content Planner (planvIx)

This document serves as the foundational draft for your MCA semester 4 project report. It expands on the core sections required for your documentation, specifically tailored to your Multi AI Agent Content Planner architecture.

---

## 1. Detailed Methodology

This section outlines the comprehensive approach, architectural patterns, and technology stack utilized to research, design, and develop the planvIx continuous content planning system. The methodology acts as the blueprint for ensuring the system is scalable, robust, and capable of handling complex AI orchestrations.

**1.1 Software Development Life Cycle (SDLC): Agile Scrum Framework**
The development of this project adheres strictly to the **Agile Software Development Lifecycle**, specifically utilizing a Scrum-based framework. This approach was chosen over traditional waterfall methods due to the experimental and rapidly evolving nature of Large Language Models (LLMs) and Multi-Agent Systems.

- **Iterative Sprints:** Development is broken down into 1-2 week sprints, allowing for continuous integration of complex AI behaviors and rapid prototyping.
- **Continuous Feedback Loop:** By regularly testing agent interactions and validating their outputs, the development process remains adaptable to API changes, latency issues, and prompt engineering refinements required by AI providers.
- **Version Control:** Git is used for source code management, ensuring all changes to the frontend components and backend logic are tracked, facilitating safe rollbacks and branching for experimental features.

**1.2 System Architecture Approach: Multi-Agent System (MAS)**
The core innovation of this project lies in moving away from a single, monolithic AI query system and adopting a **Multi-Agent System (MAS)** architecture.

- **Agent Specialization:** Tasks are decomposed and delegated to specialized agents with distinct personas and system prompts. For example, a "Research Agent" is responsible for gathering factual data and trending topics, a "Writer Agent" focuses on drafting the content according to specific brand voices, and a "Planner Agent" handles the scheduling and platform-specific formatting.
- **Asynchronous Orchestration:** These agents do not block each other. They communicate asynchronously via the Python backend, allowing the system to handle complex, multi-step content pipelines efficiently. The orchestrator manages the flow of information between agents, resolving dependencies (e.g., the Writer cannot start until the Researcher provides data).

**1.3 Technology Stack Selection & Justification**
The technology stack was carefully selected to balance rapid frontend development with powerful, AI-capable backend processing.

- **Frontend (Presentation Layer):**
  - **React.js:** Chosen for building a dynamic Single Page Application (SPA). React's component-based architecture allows for the reusable design of complex UI components like the `AgentTerminal.jsx`.
  - **CSS / Tailwind CSS:** Used for responsive styling, ensuring the application is accessible on various devices while maintaining a modern, dark-themed aesthetic (`index.css`).
  - **Chart.js / Recharts:** Integrated to power the `RevenueAndUserCharts.jsx` dashboard, enabling the visualization of complex temporal data and usage metrics.

- **Backend (Application & Orchestration Layer):**
  - **Python (FastAPI / Flask):** Python is the industry standard for AI and Data Science. The `app/core/` structure was organized using Python to leverage robust support for LLM libraries (like LangChain or OpenAI SDKs). FastAPI/Flask was chosen for its high performance and native support for asynchronous request handling, which is crucial when waiting for slow AI API responses.

- **Security & Middleware Layer:**
  - **Custom Python Modules:** Security is prioritized at the gateway level. The `security.py` module manages JSON Web Tokens (JWT) for stateless authentication.
  - **Rate Limiting & CORS:** The `rate_limit.py` ensures the system cannot be spammed, protecting against exorbitant LLM API costs. `middleware.py` handles Cross-Origin Resource Sharing (CORS) to safely connect the React frontend with the Python backend.

- **Database (Data Persistence Layer):**
  - **Relational / NoSQL Database (PostgreSQL/MongoDB):** Designed to handle both structured user data (profiles, subscription tiers) and unstructured AI-generated text (agent thoughts, final content plans). It securely stores user sessions, tracks agent states, and persists generated content for future dashboard retrieval.

**1.4 Communication Protocols**

- **RESTful APIs:** Standard synchronous communication between the frontend client and the backend server for CRUD operations (e.g., fetching user data, updating settings).
- **WebSockets / Server-Sent Events (SSE):** Utilized for the `AgentTerminal.jsx` to stream data in real-time. Since AI generation can take 10-30 seconds, streaming provides immediate feedback to the user, showing the agent's thought process token by token, vastly improving the User Experience (UX).

**1.5 Observability and Error Management**

- Robust error handling is integrated throughout the system. The `logger.py` module captures all critical system events, AI API timeouts, and application crashes. This centralized logging is vital for debugging the complex interactions within the Multi-Agent environment and ensures the system maintains high availability.

---

## 2. Requirement Specification

This defines what the system must do and the constraints under which it operates.

**2.1 Functional Requirements (FR)**

- **User Registration & Authentication:** Users must be able to securely sign up, log in, and manage their profiles.
- **AI Agent Terminal:** The system must provide a terminal-like interface (`AgentTerminal.jsx`) where users can issue commands, assign tasks, and view real-time agent thought processes.
- **Multi-Agent Orchestration:** The backend must be able to spawn, monitor, and manage communication between multiple AI agents simultaneously.
- **Analytics Dashboard:** The system must visualize usage metrics, such as generated content volume and user activity, through interactive charts (`RevenueAndUserCharts.jsx`).
- **Content Export:** Users must be able to export generated content plans to various formats (e.g., CSV, PDF, Markdown).

**2.2 Non-Functional Requirements (NFR)**

- **Security:** Passwords must be hashed. API routes must be protected via authentication middleware (`security.py`).
- **Rate Limiting:** To prevent abuse and manage API costs (e.g., OpenAI API limits), the system must enforce strict rate limits per user/tier (`rate_limit.py`).
- **Performance & Scalability:** The backend must handle concurrent agent executions without blocking the main event loop.
- **Observability/Logging:** All critical system events, errors, and agent API calls must be logged securely (`logger.py`) for debugging and audit purposes.

---

## 3. DFD / ERD (Data Flow & Entity Relationship)

This section conceptualizes how data is structured and how it moves through the system.

**3.1 Entity Relationship Diagram (ERD) - Core Entities**

- **User:** `user_id` (PK), `username`, `email`, `password_hash`, `subscription_tier`, `created_at`.
- **Agent Task:** `task_id` (PK), `user_id` (FK), `task_prompt`, `status` (Pending, In-Progress, Completed, Failed), `created_at`.
- **Content Plan:** `plan_id` (PK), `task_id` (FK), `generated_content`, `target_platform`, `scheduled_date`.
- **System Logs (from `logger.py`):** `log_id` (PK), `severity_level`, `message`, `timestamp`.

_(For your project report, you will need to draw these out using boxes and connecting lines, showing 1-to-many relationships, e.g., One User can have Many Tasks)._

**3.2 Data Flow Diagram (DFD) - Level 1 Flow**

1.  **Input:** User subits a content topic via the React Frontend (`AgentTerminal.jsx`).
2.  **Process 1 (API Gateway):** The Python backend receives the request, `middleware.py` validates the session, and `rate_limit.py` checks usage quotas.
3.  **Process 2 (Agent Orchestrator):** The backend distributes the topic to the AI Agents.
4.  **Data Store:** Intermediate thoughts and the final generated content are saved to the Database.
5.  **Output:** The backend streams the generated content plan back to the Frontend, which updates the UI.

---

## 4. System Architecture Diagram

The application follows a **Modern Client-Server Micro-architecture** pattern.

- **Client (Tier 1):** A Single Page Application (SPA) built with React. It maintains local state and handles user interactions without full page reloads.
- **API / Web Server (Tier 2):** A Python application serving RESTful or GraphQL/WebSocket endpoints. It acts as the orchestrator.
- **AI Integration Layer (Tier 3):** An external connection layer communicating with Large Language Models (LLMs) (e.g., OpenAI, Anthropic, or local open-source models).
- **Database (Tier 4):** Persistent storage for user data and application state.

_(Visually, this is represented as 4 vertical or horizontal blocks with arrows showing bi-directional data flow, explicitly noting the JSON data format over HTTP/HTTPS)._

---

## 5. Interface Design

This component outlines the visible touchpoints of the application.

**5.1 Agent Command Terminal (`AgentTerminal.jsx`)**

- **Concept:** Designed for power users, mirroring a developer console.
- **Features:** A dark-themed text area where users input prompts. Above the input, a scrolling feed displays real-time agent activities, color-coded by agent type (e.g., Research Agent in blue, Writer Agent in green).

**5.2 Analytics Dashboard (`RevenueAndUserCharts.jsx`)**

- **Concept:** A visual summary of system health and user productivity.
- **Features:** Line charts showing content generation trends over time, and pie charts displaying the distribution of usage across different AI agent roles. Designed using clean, minimalist UI principles for immediate readability.

**5.3 Overall UI/UX Guidelines**

- **Responsive Layout:** Adapting fluidly between desktop and mobile views.
- **State Feedback:** Using loading spinners, toast notifications, and skeleton loaders to indicate asynchronous operations (e.g., waiting for AI to generate text).
- **Theming:** Consistent color palette controlled via CSS variables in `index.css`.
