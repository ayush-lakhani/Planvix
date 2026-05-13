# Database & Data Flow Architecture (planvIx) - CrewAI 5-Agent Pipeline

This document contains the detailed Entity Relationship Diagram (ERD) and Level 1 Data Flow Diagram (DFD) for the Multi AI Agent Content Planner.

These diagrams use Mermaid.js syntax. You can view them by installing a Markdown preview extension that supports Mermaid, or by pasting the code blocks into [Mermaid Live Editor](https://mermaid.live/).

---

## 1. Entity Relationship Diagram (ERD)

This diagram illustrates the core database tables and their relationships within the planvIx system.

```mermaid
erDiagram
    Users {
        string user_id PK "UUID"
        string username
        string email
        string password_hash
        string subscription_tier "Free, Pro, Enterprise"
        int monthly_quota "Remaining credits"
        timestamp created_at
    }

    Tasks {
        string task_id PK "UUID"
        string user_id FK "References Users"
        string topic "E.g., AI in Healthcare"
        string status "Pending, Running, Completed, Failed"
        timestamp started_at
        timestamp completed_at
    }

    Strategies {
        string strategy_id PK "UUID"
        string task_id FK "References Tasks"
        string target_audience "Target demographics"
        string content_tone "Formal, Casual, Professional"
        string target_platform "Twitter, LinkedIn, Blog"
        string keywords "JSON array of keywords"
        timestamp created_at
    }

    CrewAgents {
        string agent_id PK "UUID"
        string role "Persona, Trend, Traffic, Synthesis, ROI"
        string agent_type "research, analysis, synthesis, roi"
        string model "llama-3.3-70b-versatile"
        string system_prompt "Core instructions"
    }

    Agent_Executions {
        string execution_id PK "UUID"
        string task_id FK "References Tasks"
        string agent_id FK "References CrewAgents"
        string inputs "JSON payload to agent"
        string outputs "JSON payload from agent"
        int tokens_used
        timestamp executed_at
    }

    UsageTracking {
        string usage_id PK "UUID"
        string user_id FK "References Users"
        int tokens_consumed "Current period"
        int requests_made "Current period"
        timestamp period_start
        timestamp period_end
    }

    Content_Plans {
        string plan_id PK "UUID"
        string task_id FK "References Tasks"
        string final_content "Markdown/HTML output"
        string target_platform "Twitter, LinkedIn, Blog"
        date scheduled_date
    }

    System_Logs {
        string log_id PK "UUID"
        string severity "INFO, ERROR, WARN"
        string module "E.g., rate_limit.py, security.py"
        string message
        timestamp created_at
    }

    %% Relationships
    Users ||--o{ Tasks : "creates"
    Tasks ||--o{ Strategies : "generates"
    Tasks ||--o{ Agent_Executions : "involves"
    Tasks ||--o| Content_Plans : "results in"
    CrewAgents ||--o{ Agent_Executions : "performs"
    Users ||--o{ UsageTracking : "tracks"
    Users ||--o{ System_Logs : "generates warnings via"
```

### Table Details:

- **Users:** Manages authentication and billing/quotas (interacting with your `security.py` and `rate_limit.py`).
- **Tasks:** Represents a single user request to the Multi-Agent system (e.g., "Write a blog post about AI").
- **Strategies:** Stores the content strategy including target audience, tone, platform, and keywords.
- **CrewAgents:** Defines the 5 CrewAI agents - Persona, Trend, Traffic, Synthesis, ROI.
- **Agent_Executions:** A join/audit table tracking exactly what each agent did for a specific task, useful for the real-time terminal (`AgentTerminal.jsx`).
- **UsageTracking:** Tracks token consumption and request counts per billing period.
- **Content_Plans:** The final, polished output ready for the user's dashboard.
- **System_Logs:** Centralized logging for the python backend (`logger.py`).

---

## 2. Level 0 Context Diagram (DFD)

The Context Diagram defines the boundary between the planvIx system and its external environment.

```mermaid
flowchart LR
    %% External Entities - Left Side
    subgraph External_Entities
        direction TB
        User((👤 User / Browser))
    end

    %% Central Process - Middle
    subgraph planvIx_Platform
        direction TB
        P[🔧 planvIx Content Strategy Platform]
    end

    %% External Services - Right Side
    subgraph External_Services
        direction TB
        OAuth((🔐 Google OAuth\nIdentity Provider))
        Groq_API((🚀 Groq Llama 3.3\n70B Model))
    end

    %% Auth Flow (Top)
    User -- "1. Login credentials,\nStrategy parameters" --> P
    P -- "2. Auth Token,\nStrategy JSON,\nSSE Stream" --> User
    
    %% OAuth Flow
    P -- "3. Auth Request" --> OAuth
    OAuth -- "4. User Profile,\nAccess Token" --> P
    
    %% LLM Flow (Bottom)
    P -- "5. Prompt context\n(5 agents)" --> Groq_API
    Groq_API -- "6. LLM completions\n(Persona, Trends,\nTraffic, Synthesis, ROI)" --> P
```

---

## 3. Level 1 Functional Data Flow Diagram (DFD) - 5 CrewAI Agents

This diagram shows how data moves internally across the different planvIx functional components with the 5-agent CrewAI pipeline.

```mermaid
flowchart TB
    subgraph CLIENT["📱 Client Layer"]
        direction LR
        C1[👤 User Browser]
    end

    subgraph API["⚙️ API Layer"]
        direction TB
        A1[🔐 Auth Service]
        A2[📡 SSE Stream]
    end

    subgraph ORCH["🎯 Orchestrator Layer"]
        direction TB
        O1[⚙️ CrewAI Orchestrator]
    end

    subgraph AGENTS["🤖 5-Agent Pipeline"]
        direction LR
        G1[👤 Persona] --> G2[📈 Trend] --> G3[🔍 Traffic] --> G4[✍️ Synthesis] --> G5[💰 ROI]
    end

    subgraph LLM["🧠 LLM Layer"]
        direction LR
        L1[🤖 Agent Executor] --> L2[(🚀 Groq API)]
    end

    subgraph CACHE["⚡ Cache Layer"]
        C3[(⚡ Redis Cache)]
    end

    subgraph STORAGE["💾 Storage Layer"]
        direction LR
        S1[(👥 Users)]
        S2[(📋 Strategies)]
        S3[(📄 Tasks)]
        S4[(📝 Executions)]
        S5[(📊 Usage)]
        S6[(📋 Logs)]
    end

    C1 -->|Login| A1
    C1 -->|Submit Input| A2
    A1 -->|Verify| S1
    A1 -->|Cache Token| C3
    O1 -->|Check| C3
    C3 -->|Allow/Block| O1
    A2 -->|Start| O1
    O1 --> G1
    G1 -->|Query| L1
    G2 -->|Query| L1
    G3 -->|Query| L1
    G4 -->|Query| L1
    G5 -->|Query| L1
    L1 -->|Request| L2
    L2 -->|Response| L1
    G1 -->|Log| S4
    G2 -->|Log| S4
    G3 -->|Log| S4
    G4 -->|Log| S4
    G5 -->|Log| S4
    G5 -->|Save Strategy| S2
    G5 -->|Save Content| S3
    G1 -.->|Progress| A2
    G2 -.->|Progress| A2
    G3 -.->|Progress| A2
    G4 -.->|Progress| A2
    G5 -.->|Final| A2
    A2 -->|SSE| C1
    C1 -->|Query| S2
    S2 -->|Data| S5
    S5 -->|Charts| C1
```
```

### Process Descriptions:

- **1.0 (Auth & Security):** Handled by `auth_service.py` and `security.py`. Manages registration, session validation, and JWT refreshes.
- **2.0 (CrewAI Orchestrator):** Orchestrated by `crew_orchestrator.py` using CrewAI with 5 sequential agents.
- **3.0 (Agent Execution):** Individual agent interactions with Groq/Llama 3.3 70B.
- **4.0 (Usage & Rate Limiting):** Managed by `UsageService` and Redis for rate limits.
- **5.0 (Analytics Aggregation):** Handled by `AnalyticsService`. Computes charts for dashboards.
- **6.0 (WebSocket/SSE Streaming):** Real-time progress updates and streaming output.

---

## 4. System Architecture Diagram

```mermaid
flowchart TB
    subgraph "Client Tier"
        direction LR
        Browser[🌐 Browser / Mobile]
    end

    subgraph "Frontend Tier"
        Vercel[Vercel CDN]
        React[React.js SPA]
    end

    subgraph "Backend Tier"
        Railway[Railway / Render]
        Docker[🐳 Docker Container]
        FastAPI[FastAPI Server]
        Crew[CrewAI Orchestrator]
        SSE[SSE Handler]
    end

    subgraph "Cache Tier"
        Redis[(⚡ Redis)]
    end

    subgraph "Database Tier"
        MongoDB[(MongoDB Atlas)]
    end

    subgraph "AI Tier"
        Groq[(🚀 Groq API)]
        Llama[Llama 3.3 70B]
    end

    Browser -->|HTTPS| Vercel
    Vercel -->|HTTPS/SSE| Railway
    React -->|HTTP| FastAPI
    FastAPI -->|Execute| Crew
    Crew -->|Stream| SSE
    SSE -->|SSE| React
    FastAPI -->|Rate Limit| Redis
    FastAPI -->|Save/Query| MongoDB
    Crew -->|Query| Groq
    Groq -->|Inference| Llama
    Llama -->|Response| Groq
```

### System Architecture Notes:

| Tier | Component | Description |
|------|-----------|-------------|
| Client | Browser/Mobile | User accesses the application |
| Frontend | Vercel + React SPA | Global CDN for fast loading |
| Backend | Railway + FastAPI | API server in Docker |
| Cache | Redis | Rate limiting & sessions |
| Database | MongoDB | Persistent storage |
| AI | Groq + Llama 3.3 | LLM inference |
