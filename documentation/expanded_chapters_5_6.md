# CHAPTER 5
# SYSTEM REQUIREMENTS

### 5.1 Introduction to System Requirements

The requirement specification phase is the most critical foundation of the **planvIx** development lifecycle. It serves as the formal bridge between the high-level vision of a multi-agent AI strategist and the concrete technical implementation. In this chapter, we detail the multi-dimensional requirements—spanning hardware, software, functional, and non-functional domains—that ensure the platform is robust, scalable, and capable of delivering high-fidelity content strategies in real-time. 

Given the complexity of orchestrating multiple Large Language Models (LLMs) and maintaining a stateful user experience across asynchronous workloads, these requirements are designed to minimize latency, maximize security, and provide a seamless interface for both creators and administrators. The requirements listed here reflect the "Production-Grade" philosophy of planvIx, moving beyond a simple academic prototype to a viable Software-as-a-Service (SaaS) architecture.

---

### 5.2 User Requirements

User requirements define the expectations and needs of the different personas interacting with the system. planvIx caters to three primary user groups, each with distinct needs for strategic depth and system feedback.

#### 5.2.1 Content Creators and Solo-Preneurs
- **Minimal Cognitive Friction:** Users require a "Zero-Prompt" interface where they provide high-level goals (e.g., "Grow my coffee brand") rather than writing complex engineering prompts.
- **Real-time Feedback:** Due to the 30-60 second duration of AI generation, users require a "Live Progress Feed" to reduce perceived latency and build trust in the agentic process.
- **Actionable Outputs:** The system must provide structured content (calendars, hooks, keywords) that can be immediately copied into social media management tools.
- **Historical Memory:** Users need to store and retrieve past strategies to maintain brand consistency over months of content production.

#### 5.2.2 Marketing Agencies and SMBs
- **High-Volume Generation:** Agencies require the ability to generate multiple strategies for different clients simultaneously without system degradation.
- **ROI Justification:** Business users require quantitative scores (Growth, Difficulty, Confidence) to justify content decisions to stakeholders or clients.
- **Multi-Platform Support:** The system must tailor strategies for different algorithmic requirements (e.g., LinkedIn's professional tone vs. TikTok's high-energy hooks).

#### 5.2.3 Administrative Stakeholders
- **System Telemetry:** Admins require a dashboard to monitor global system health, API response times, and database performance.
- **Usage Governance:** Real-time tracking of token consumption and user activity is required to manage API costs and prevent platform abuse.
- **User Management:** Ability to manage subscription tiers, quotas, and access levels for "Pro" features.

---

### 5.3 Hardware Requirements

The hardware requirements for planvIx are bifurcated into the "Development Environment" (where the system was built) and the "Production Environment" (where the system is hosted).

#### 5.3.1 Development Workstation Specifications (Minimum)
To handle the local execution of the React frontend, the FastAPI backend, and multiple Docker containers, the development environment requires:
- **Processor:** Intel Core i7 or AMD Ryzen 7 (8 Cores minimum) to handle concurrent asynchronous threads.
- **RAM:** 16GB DDR4 (32GB recommended) to support simultaneous execution of IDEs, Docker, and local browser testing.
- **Storage:** 512GB NVMe SSD for fast compilation and database I/O.
- **Network:** Stable 50 Mbps+ connection for constant communication with external LLM APIs (Groq/OpenAI).

#### 5.3.2 Production Server Infrastructure (Cloud Native)
The production environment utilizes a distributed cloud architecture:
- **Application Server (FastAPI):** Managed container instance with 2 vCPUs and 4GB RAM, optimized for high I/O and network throughput.
- **Database Server (MongoDB):** Multi-node cluster with automated sharding and at least 2GB of dedicated RAM for index caching.
- **Cache Server (Redis):** In-memory instance with 1GB RAM to handle thousands of concurrent rate-limit checks and SSE message broadcasts.

#### 5.3.3 AI Inference Hardware (The LPU/GPU Tier)
Since planvIx uses external API providers for LLMs, the "Hardware Requirement" for the actual AI "Thinking" is outsourced to:
- **Groq LPU (Language Processing Units):** Specialized hardware designed for sub-second LLM inference, ensuring the agents can "talk" to each other at a speed of 200+ tokens per second.
- **NVIDIA H100/A100 Clusters:** Utilized via OpenAI/Azure endpoints for complex reasoning tasks that require high-parameter models.

---

### 5.4 Software Requirements

The software stack was selected based on the principle of "Modern Asynchronicity"—ensuring that slow AI operations do not block the user interface.

#### 5.4.1 Development Software Stack
- **Operating System:** Windows 11 / Linux (Ubuntu 22.04 LTS) / macOS.
- **Environment:** Node.js (v18+) for frontend builds and Python (v3.10+) for backend logic.
- **IDEs:** Visual Studio Code with Pylance and ESLint plugins for static analysis.
- **Containerization:** Docker Desktop and Docker Compose for environment parity.

#### 5.4.2 Frontend Technologies (The Presentation Layer)
- **Framework:** React 18 (with Vite) for concurrent UI rendering.
- **Styling:** Tailwind CSS 3.4 for responsive, utility-first design.
- **Animation:** AOS (Animate On Scroll) and Framer Motion for premium micro-interactions.
- **Charts:** Recharts for dynamic ROI and usage visualization.

#### 5.4.3 Backend Technologies (The Intelligence Layer)
- **Framework:** FastAPI (Python) for high-performance, asynchronous REST/SSE/WS endpoints.
- **Concurrency:** Uvicorn (ASGI server) with `uvloop` for high-speed event loop management.
- **Security:** Python-Jose (JWT) and Passlib (Argon2) for enterprise-grade authentication.

#### 5.4.4 Data & AI Infrastructure
- **Database:** MongoDB Atlas (Cloud NoSQL) for flexible strategy storage.
- **Cache/Pub-Sub:** Redis for rate-limiting and real-time event broadcasting.
- **Orchestration:** CrewAI Framework for role-based agent collaboration.
- **Models:** Llama 3.3 70B (via Groq) and GPT-4o (via OpenAI).

---

### 5.5 Functional Requirements Specification

The functional requirements describe the specific behaviors and features that the system must perform to satisfy the user needs.

#### 5.5.1 Module 1: Authentication & User Governance
- **FR1.1:** The system shall allow users to register with a valid email, unique username, and complex password.
- **FR1.2:** The system shall implement Argon2id hashing for all stored passwords.
- **FR1.3:** The system shall issue a stateless JSON Web Token (JWT) upon successful login, with a configurable 24-hour expiration.
- **FR1.4:** The system shall restrict access to strategic planning routes to authenticated users only.

#### 5.5.2 Module 2: Strategic Intake & Validation
- **FR2.1:** The interface shall provide a four-field intake form (Topic, Industry, Target Audience, Platform).
- **FR2.2:** The backend shall validate inputs using Pydantic schemas to prevent SQL/NoSQL injection and oversized payloads.
- **FR2.3:** The system shall allow users to select "Tone" and "Goal" to further refine agent behavior.

#### 5.5.3 Module 3: Agentic Orchestration Engine (The 5-Agent Pipeline)
- **FR3.1:** The system shall initialize a sequential CrewAI pipeline upon a valid strategy request.
- **FR3.2:** **Agent 1 (Persona):** Shall generate a detailed consumer psychology profile (Pains, Gains, Triggers).
- **FR3.3:** **Agent 2 (Trend):** Shall identify at least 3 current market trends and viral hooks relevant to the persona.
- **FR3.4:** **Agent 3 (Traffic):** Shall generate a list of 10 keywords and 15 hashtags optimized for the target platform's algorithm.
- **FR3.5:** **Agent 4 (Synthesis):** Shall build a structured 30-day content calendar with specific post titles and captions.
- **FR3.6:** **Agent 5 (ROI):** Shall perform a final audit and assign Growth, Difficulty, and Confidence scores.

#### 5.5.4 Module 4: Real-time Telemetry & Streaming
- **FR4.1:** The system shall maintain an open Server-Sent Events (SSE) connection during the entire 60-second generation window.
- **FR4.2:** The system shall stream the "Internal Monologue" of each agent as they complete their sub-tasks.
- **FR4.3:** The frontend shall display these thoughts in a color-coded "Agent Terminal" for user transparency.

#### 5.5.5 Module 5: Admin Analytics & Monitoring
- **FR5.1:** The system shall provide an Admin Dashboard accessible only to users with the `admin` flag.
- **FR5.2:** The dashboard shall visualize system-wide token usage, daily active users (DAU), and total strategies generated using line and pie charts.
- **FR5.3:** The system shall broadcast live platform activity (signups/generations) via WebSockets to the admin view.

---

### 5.6 Non-Functional Requirements (NFR)

NFRs define the quality attributes of the system, ensuring it is reliable under stress and secure under threat.

#### 5.6.1 Performance and Latency
- **NFR1.1:** The system shall deliver the first "Thought Token" in the terminal within 500ms of the request.
- **NFR1.2:** A full 30-day strategy shall be completed in under 60 seconds.
- **NFR1.3:** The frontend shall load the initial interactive dashboard in under 1.2 seconds (LCP).

#### 5.6.2 Scalability and Concurrency
- **NFR2.1:** The system shall support at least 50 concurrent strategy generations without a 20% increase in latency per user.
- **NFR2.2:** The database shall support horizontal scaling (sharding) to handle up to 1 million stored strategy documents.

#### 5.6.3 Security and Privacy
- **NFR3.1:** All communication between client and server shall be encrypted via TLS 1.3.
- **NFR3.2:** The system shall implement Redis-based rate limiting (e.g., 5 requests per minute per IP) to prevent API credit exhaustion.
- **NFR3.3:** User data shall be logically isolated at the database level to prevent cross-account data leakage.

#### 5.6.4 Availability and Reliability
- **NFR4.1:** The system shall maintain an uptime of 99.9%.
- **NFR4.2:** The system shall implement "Graceful Failure" modes—if the AI API is down, the user shall receive a meaningful error message instead of a system crash.

---

### 5.7 System Constraints and Assumptions

#### 5.7.1 Technical Constraints
- **Model Window:** The system is constrained by the context window of the underlying LLM (e.g., 128k tokens for Llama 3).
- **API Rate Limits:** The system's throughput is ultimately capped by the rate limits imposed by Groq and OpenAI.

#### 5.7.2 Budgetary Constraints
- **Token Costs:** Each strategy generation costs approximately $0.05 - $0.20 in API credits, requiring a strict billing/quota management system.

#### 5.7.3 Operational Assumptions
- **User Internet:** It is assumed the user has a stable broadband connection; SSE streaming may fail on intermittent 2G/3G mobile networks.
- **Language:** The current version is optimized for English-language strategies.

---

# CHAPTER 6
# IMPLEMENTATION

### 6.1 Implementation Overview

The implementation phase of **planvIx** involved translating the complex multi-agent architecture into a high-performance, asynchronous software system. The development followed a "Modular Monolith" approach, where core services (AI, Data, Auth) are decoupled internally but deployed as a cohesive unit for ease of management. 

The primary challenge during implementation was the orchestration of long-running AI tasks within a request-response web environment. We solved this by utilizing **Server-Sent Events (SSE)** for real-time progress updates and **FastAPI's Background Tasks** to ensure that the server remains responsive while agents are "thinking." This chapter details the technical hurdles, code structures, and architectural decisions made during the build.

---

### 6.2 Environment Setup and Configuration

Before writing the first line of code, we established a rigid environment configuration to ensure "Dev-Prod Parity."

- **Dependency Management:** We utilized `pip` with `requirements.txt` for the backend and `npm` with `package.json` for the frontend.
- **Configuration Security:** Sensitive keys (Groq API, MongoDB URI, JWT Secret) are never hardcoded. They are managed via a `.env` file and loaded using Pydantic's `BaseSettings` class, which provides automatic type validation and default values.
- **Asynchronous Foundation:** The entire backend was built using `async/await` syntax to leverage Python's non-blocking I/O capabilities.

---

### 6.3 Backend Implementation Details

The backend is the "Brain" of planvIx, managing the flow of data between the user, the AI agents, and the database.

#### 6.3.1 FastAPI Application Structure
The backend follows a standard Clean Architecture pattern:
- `/app/api/`: Contains the REST routers (Auth, Strategies, Admin).
- `/app/core/`: Contains system-wide logic (Security, Config, Logger).
- `/app/models/`: Defines Pydantic schemas for request validation.
- `/app/services/`: Contains the business logic for strategy generation and database interactions.
- `/app/orchestrator/`: The specialized module for CrewAI agent definitions.

#### 6.3.2 Multi-Agent Orchestration Logic (CrewAI)
The core of the implementation is the `CrewOrchestrator` class. It instantiates the five specialized agents:

1.  **Persona Agent:** Configured with a system prompt that focuses on empathy mapping and psychographics.
2.  **Trend Agent:** Given tools to simulate market research (using internal knowledge and historical patterns).
3.  **Traffic Agent:** Specialized in SEO and social media platform technicalities.
4.  **Synthesis Agent:** The "Project Manager" that compiles all data into a cohesive 30-day JSON calendar.
5.  **ROI Agent:** A critic that reviews the final output and assigns confidence scores.

The orchestration uses a **Sequential Process**, ensuring that the output of Agent N becomes the high-fidelity context for Agent N+1. This is implemented via the `context` parameter in the CrewAI `Task` definition.

#### 6.3.3 Real-time Event Streaming (SSE) Implementation
Traditional REST APIs are "Fire and Forget," which is unsuitable for 60-second AI tasks. We implemented SSE to stream progress:
- **The Event Loop:** When a strategy is requested, the backend initializes a generator function.
- **Redis Pub/Sub:** As the CrewAI agents work, they emit "Thought" events to a Redis channel.
- **The Streamer:** The generator function listens to this Redis channel and yields `data: {message}` chunks to the browser in real-time. This ensures the user sees every collaborative step of the AI.

---

### 6.4 Frontend Implementation Details

The frontend was built to be a "Premium Command Center," utilizing modern design trends to wow the user.

#### 6.4.1 React Component Architecture
We utilized a "Feature-Based" structure:
- **`Layout/`:** Manages the sidebar, navigation, and glassmorphic background.
- **`Auth/`:** Handles login/register forms and JWT persistence in `localStorage`.
- **`Planner/`:** The main intake form with validation.
- **`Terminal/`:** A high-performance text-streaming component that handles ANSI-like color codes for different agents.
- **`Dashboard/`:** Utilizes Recharts to render the ROI Radar Chart and Usage Line Charts.

#### 6.4.2 The Glassmorphism Design System
The "Premium" feel was achieved via **Tailwind CSS** and custom backdrop filters:
- **Card Backgrounds:** `bg-slate-900/40 backdrop-blur-xl border border-white/10`.
- **Typography:** Using the **Inter** font for readability and **Outfit** for headlines to give a futuristic aesthetic.
- **Micro-animations:** We used **AOS.js** to animate the dashboard widgets as they appear, providing a sense of "Living Software."

---

### 6.5 Database and Persistence Layer Implementation

#### 6.5.1 MongoDB Document Modeling
Strategies are stored as rich documents to avoid expensive joins:
```json
{
  "_id": "65e...",
  "user_id": "ref...",
  "topic": "Sustainable Denim",
  "agents_logs": ["Persona: ...", "Trend: ..."],
  "final_strategy": {
    "week1": [...],
    "week2": [...]
  },
  "metrics": {
    "growth": 85,
    "confidence": 92
  },
  "created_at": "2024-03-01T..."
}
```
We implemented a **Compound Index** on `user_id` and `created_at` to ensure that the user's history page loads in under 100ms regardless of the database size.

#### 6.5.2 Redis-Based Rate Limiting
To prevent API abuse, we implemented a custom middleware:
- Every request checks the user's IP/ID against a Redis key.
- If the count exceeds the threshold (e.g., 5/min), the request is rejected with a `429 Too Many Requests` status.
- This protects our Groq/OpenAI budget from automated scraping bots.

---

### 6.6 Security & Authentication Implementation

- **JWT Middleware:** Every protected route passes through a `get_current_user` dependency. It decodes the JWT, verifies the signature, and checks the database to ensure the user is still active.
- **CORS Policy:** We restricted backend access to only our production frontend domain (Vercel) and local development (localhost), preventing "Cross-Site Request Forgery" and unauthorized API use from third-party domains.
- **Input Sanitization:** We use Pydantic models to strictly enforce data types, ensuring that no malicious scripts can be injected into the system via user input fields.

---

### 6.7 Deployment and Infrastructure

- **Dockerization:** We created a `Dockerfile` for the backend and a multi-stage `Dockerfile` for the React frontend. This ensures that the application runs identically in development and production.
- **CI/CD Pipeline:** We implemented GitHub Actions to:
  1. Run unit tests on every pull request.
  2. Lint the code for style consistency (Black/ESLint).
  3. Automatically deploy the frontend to **Vercel** and the backend to **Railway** upon merging to the `main` branch.
- **Cloud Database:** We utilized **MongoDB Atlas** for its automated backups and 99.99% uptime guarantee.

---

### 6.8 Summary of Implementation Challenges

1.  **Non-Deterministic Outputs:** AI agents occasionally returned malformed JSON. We solved this by implementing a **"Retry Logic"** in the synthesis agent and using **Pydantic validation** to force re-generation if the structure was invalid.
2.  **SSE Connection Drops:** On slow networks, the SSE stream would occasionally drop. We implemented a "Re-sync" logic on the frontend that fetches the partial result from the database if the stream terminates early.
3.  **Latency Management:** The initial 5-agent pipeline took over 2 minutes. By switching the inference engine to **Groq LPUs**, we reduced the execution time by 400%, bringing it down to the current ~45-second benchmark.

---
