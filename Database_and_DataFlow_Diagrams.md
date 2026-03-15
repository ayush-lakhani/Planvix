# Database & Data Flow Architecture (Stratify AI)

This document contains the detailed Entity Relationship Diagram (ERD) and Level 1 Data Flow Diagram (DFD) for the Multi AI Agent Content Planner.

These diagrams use Mermaid.js syntax. You can view them by installing a Markdown preview extension that supports Mermaid, or by pasting the code blocks into [Mermaid Live Editor](https://mermaid.live/).

---

## 1. Entity Relationship Diagram (ERD)

This diagram illustrates the core database tables and their relationships within the Stratify AI system.

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

    Agents {
        string agent_id PK "UUID"
        string role "Planner, Researcher, Writer"
        string model "gpt-4, claude-3, etc."
        string system_prompt "Core instructions"
    }

    Agent_Executions {
        string execution_id PK "UUID"
        string task_id FK "References Tasks"
        string agent_id FK "References Agents"
        string inputs "JSON payload to agent"
        string outputs "JSON payload from agent"
        int tokens_used
        timestamp executed_at
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
    Tasks ||--o{ Agent_Executions : "involves"
    Tasks ||--o| Content_Plans : "results in"
    Agents ||--o{ Agent_Executions : "performs"
    Users ||--o{ System_Logs : "generates warnings via"
```

### Table Details:

- **Users:** Manages authentication and billing/quotas (interacting with your `security.py` and `rate_limit.py`).
- **Tasks:** Represents a single user request to the Multi-Agent system (e.g., "Write a blog post about AI").
- **Agents:** Defines the available AI personalities/roles in the system.
- **Agent_Executions:** A join/audit table tracking exactly what each agent did for a specific task, useful for the real-time terminal (`AgentTerminal.jsx`).
- **Content_Plans:** The final, polished output ready for the user's dashboard.
- **System_Logs:** Centralized logging for the python backend (`logger.py`).

---

## 2. Level 1 Data Flow Diagram (DFD)

This diagram shows how data moves between external entities (the User, AI APIs), core processes, and data stores.

```mermaid
flowchart TD
    %% External Entities
    User((User / Browser))
    LLM_API((External LLM APIs\nOpenAI/Gemini))

    %% Data Stores
    DB_Users[(Users DB)]
    DB_Content[(Content/Tasks DB)]
    DB_Logs[(System Logs)]

    %% Processes
    P1[1.0 Authenticate & Validate]
    P2[2.0 Agent Orchestration]
    P3[3.0 AI Processing]
    P4[4.0 Dashboard Analytics]

    %% Flow: User Input & Auth
    User -- "1. Login Credentials" --> P1
    P1 -- "2. Validates JWT / Rate Limits" --> DB_Users
    DB_Users -- "3. Quota Status" --> P1

    %% Flow: Task Creation
    User -- "4. Submits Topic & Prompt" --> P2
    P2 -- "5. Logs Task Start" --> DB_Logs
    P2 -- "6. Saves Pending Task" --> DB_Content

    %% Flow: Multi-Agent Processing
    P2 -- "7. Dispatches Prompts" --> P3
    P3 -- "8. API Requests" --> LLM_API
    LLM_API -- "9. AI Responses\n(Drafts, Research)" --> P3
    P3 -- "10. Returns Agent Outputs" --> P2

    %% Flow: Output Generation
    P2 -- "11. Streams Terminal Updates" --> User
    P2 -- "12. Saves Final Content Plan" --> DB_Content

    %% Flow: Analytics
    User -- "13. Requests Dashboard View" --> P4
    P4 -- "14. Fetches Usage & Plans" --> DB_Content
    P4 -- "15. Returns Chart Data\n(JSON)" --> User
```

### Process Descriptions:

- **Process 1.0 (Authenticate & Validate):** Handled by `security.py` and `rate_limit.py` and `middleware.py`. Ensures the user has permissions and credits to run agents.
- **Process 2.0 (Agent Orchestration):** The core backend logic. It breaks down the user's prompt, assigns sub-tasks to different agents, and orchestrates the flow of data.
- **Process 3.0 (AI Processing):** The specific modules that make network calls to external APIs (OpenAI, Gemini) and parse the JSON responses.
- **Process 4.0 (Dashboard Analytics):** API endpoints that aggregate data to serve the visual charts in `RevenueAndUserCharts.jsx`.
