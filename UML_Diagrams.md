# UML Diagrams: Multi AI Agent Content Planner (planvIx) - CrewAI 5-Agent Pipeline

Below are the **UML Class Diagram** (for the database schema representing the ERD), the **UML Activity/Component Diagram** (representing DFD Level 1), and the **UML Deployment Diagram** (representing the System Architecture).

You can render these diagrams using **PlantUML**. You can copy each `@startuml ... @enduml` block and paste it directly into an online viewer like [PlantText](https://www.planttext.com/) or the [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/).

---

## 1. UML Class Diagram (ERD Representation)

This diagram object-orients your database tables, showing their attributes (columns) and relationships (foreign keys).

```plantuml
@startuml
skinparam roundcorner 10
skinparam class {
    BackgroundColor White
    ArrowColor Black
    BorderColor Black
}

class User {
  + String user_id [PK]
  + String username
  + String email
  + String password_hash
  + String subscription_tier
  + Integer monthly_quota
  + Timestamp created_at
  --
  + authenticate()
  + check_quota()
}

class Task {
  + String task_id [PK]
  + String user_id [FK]
  + String topic
  + String status
  + Timestamp started_at
  + Timestamp completed_at
  --
  + start_execution()
  + update_status()
}

class Strategy {
  + String strategy_id [PK]
  + String task_id [FK]
  + String target_audience
  + String content_tone
  + String target_platform
  + String keywords[]
  --
  + apply_strategy()
}

class CrewAgent {
  + String agent_id [PK]
  + String role
  + String agent_type
  + String model_type
  + String system_prompt
  --
  + generate_response()
}

class AgentExecution {
  + String execution_id [PK]
  + String task_id [FK]
  + String agent_id [FK]
  + String inputs
  + String outputs
  + Integer tokens_used
  + Timestamp executed_at
  --
  + log_activity()
}

class UsageTracking {
  + String usage_id [PK]
  + String user_id [FK]
  + Integer tokens_consumed
  + Integer requests_made
  + Timestamp period_start
  + Timestamp period_end
  --
  + track_usage()
  + check_limits()
}

class ContentPlan {
  + String plan_id [PK]
  + String task_id [FK]
  + String final_content
  + String target_platform
  + Date scheduled_date
  --
  + export_pdf()
  + export_markdown()
}

class SystemLog {
  + String log_id [PK]
  + String severity
  + String module_name
  + String message
  + Timestamp created_at
}

User "1" -- "0..*" Task : creates >
Task "1" -- "0..*" AgentExecution : contains >
CrewAgent "1" -- "0..*" AgentExecution : performs >
Task "1" -- "0..1" Strategy : generates >
Strategy "1" -- "0..1" ContentPlan : guides >
Task "1" -- "0..1" ContentPlan : results in >
User "1" -- "0..*" UsageTracking : tracks >
User "1" -- "0..*" SystemLog : triggers >

@enduml
```

---

## 2. UML Component/Data Flow Diagram (DFD Level 1) - 5 CrewAI Agents

This diagram shows how the system components interact and pass data to each other, representing the flow of information with the 5-agent CrewAI pipeline.

```plantuml
@startuml
skinparam componentStyle uml2

actor "User" as user

package "Frontend (React SPA)" {
    [Agent Terminal UI] as Terminal
    [Analytics Dashboard UI] as Dashboard
}

package "Backend (FastAPI)" {
    [Auth & Rate Limiting AuthGateway] as Gateway
    [CrewAI Orchestrator] as Orchestrator
    [Groq/Llama Service] as LLM_Service
    [Dashboard Controller] as DashService
    [WebSocket Handler] as WS_Handler
}

database "PostgreSQL / MongoDB" as DB {
    [Users & Quotas]
    [Tasks & Content]
    [Strategy]
    [AgentExecutions]
    [UsageTracking]
    [System Logs]
}

database "Redis Cache" as Redis {
    [Rate Limit Counter]
    [Live Feed Cache]
}

cloud "Groq API" as ExternalAI {
    [Llama 3.3 70B]
}

package "5 CrewAI Agents" as CrewAgents {
    [1. Persona Agent] as Persona
    [2. Trend Agent] as Trend
    [3. Traffic Agent] as Traffic
    [4. Synthesis Agent] as Synthesis
    [5. ROI Agent] as ROI
}

' Flow 1: Auth & Input
user --> Terminal : Enters Prompt
user --> Dashboard : Views Charts
Terminal --> Gateway : POST /api/tasks (JWT)
Dashboard --> DashService : GET /api/analytics (JWT)

' Flow 2: Validation
Gateway --> [Users & Quotas] : Validate Session
Gateway --> Redis : Check Rate Limit
Redis --> Gateway : Allow/Block

' Flow 3: Processing
Gateway --> Orchestrator : Forward Valid Task
Orchestrator --> [System Logs] : Log Task Start
Orchestrator --> [Tasks & Content] : Save Pending Task

' Flow 4: 5-Agent Pipeline (Sequential)
Orchestrator --> Persona : Agent 1: Define Audience Persona
Persona --> Trend : Agent 2: Research Trends
Trend --> Traffic : Agent 3: Analyze Traffic
Traffic --> Synthesis : Agent 4: Synthesize Content
Synthesis --> ROI : Agent 5: Calculate ROI

' Flow 5: Execution Logging
Persona --> [AgentExecutions] : Log Persona result
Trend --> [AgentExecutions] : Log Trend result
Traffic --> [AgentExecutions] : Log Traffic result
Synthesis --> [AgentExecutions] : Log Synthesis result
ROI --> [AgentExecutions] : Log ROI result
ROI --> [Strategy] : Save Strategy
ROI --> [Tasks & Content] : Save Final ContentPlan

' Flow 6: LLM Calls
Persona <--> LLM_Service : Llama 3.3
Trend <--> LLM_Service : Llama 3.3
Traffic <--> LLM_Service : Llama 3.3
Synthesis <--> LLM_Service : Llama 3.3
ROI <--> LLM_Service : Llama 3.3
LLM_Service <--> ExternalAI : API Req/Res (JSON)

' Flow 7: Real-time Streaming
Orchestrator --> WS_Handler : SSE Events
WS_Handler --> Terminal : Stream Progress

' Flow 8: Usage Tracking
Orchestrator --> UsageTracking : Update token usage
DashService --> [UsageTracking] : Aggregate Data
DashService --> Dashboard : Return Chart Data (JSON)

@enduml
```

---

## 3. UML Deployment Diagram (System Architecture)

This diagram maps your software architecture onto the physical (or virtual) servers where they will run.

```plantuml
@startuml
node "User Device (Browser / Mobile)" <<Client Node>> {
  node "Web Browser" {
    artifact "React.js SPA Bundle" {
        component "AgentTerminal.jsx"
        component "RevenueAndUserCharts.jsx"
        component "index.css"
    }
  }
}

node "Vercel (Frontend)" <<CDN Node>> {
  component "React SPA Hosting"
}

node "Railway/Render (Backend)" <<Server Node>> {
  node "Docker Container" {
    node "Python Runtime (FastAPI)" {
        component "middleware.py" as middleware
        component "security.py" as security
        component "rate_limit.py" as ratelimit
        component "logger.py" as logger
        component "crew_orchestrator.py" as orchestrator
        component "WebSocket Handler" as ws_handler

        middleware --> security
        middleware --> ratelimit
        orchestrator --> logger
    }
  }
}

node "Redis (Rate Limiting)" <<Cache Node>> {
    database "Redis Instance"
}

node "Database Server" <<Database Node>> {
  database "PostgreSQL" {
    collections "Users, Tasks, Strategy, AgentExecutions, UsageTracking, SystemLogs"
  }
}

cloud "Groq API" {
  node "Llama 3.3 70B" <<AI Provider>>
}

' Connections
"React.js SPA Bundle" --(0 "HTTPS / SSE" Vercel
Vercel --(0 "HTTPS / WebSocket" Railway/Render
Railway/Render --(0 "Redis Protocol" Redis
Railway/Render --(0 "DB Driver (TCP/IP)" PostgreSQL
orchestrator --(0 "HTTPS (JSON)" Llama 3.3 70B

note right of "React.js SPA Bundle"
  Presentation Layer handling
  state and visualization
end note

note right of "Docker Container"
  Application Layer handling
  CrewAI 5-agent orchestration
end note

note right of "Redis"
  Caching layer for rate limiting
  and live feed streaming
end note

@enduml
```
