# UML Diagrams: Multi AI Agent Content Planner (planvIx)

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

class Agent {
  + String agent_id [PK]
  + String role
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
Agent "1" -- "0..*" AgentExecution : performs >
Task "1" -- "0..1" ContentPlan : results in >
User "1" -- "0..*" SystemLog : triggers >

@enduml
```

---

## 2. UML Component/Data Flow Diagram (DFD Level 1)

This diagram shows how the system components interact and pass data to each other, representing the flow of information.

```plantuml
@startuml
skinparam componentStyle uml2

actor "User" as user

package "Frontend (React SPA)" {
    [Agent Terminal UI] as Terminal
    [Analytics Dashboard UI] as Dashboard
}

package "Backend (Python APIs)" {
    [Auth & Rate Limiting AuthGateway] as Gateway
    [Agent Orchestrator Controller] as Orchestrator
    [LLM Service Interface] as LLM_Service
    [Dashboard Controller] as DashService
}

database "PostgreSQL / MongoDB" as DB {
    [Users & Quotas]
    [Tasks & Content]
    [System Logs]
}

cloud "External AI APIs" as ExternalAI {
    [OpenAI / Gemini API]
}

' Flow 1: Auth & Input
user --> Terminal : Enters Prompt
user --> Dashboard : Views Charts
Terminal --> Gateway : POST /api/tasks (JWT)
Dashboard --> DashService : GET /api/analytics (JWT)

' Flow 2: Validation
Gateway --> [Users & Quotas] : Validate Session & Credits

' Flow 3: Processing
Gateway --> Orchestrator : Forward Valid Task
Orchestrator --> [System Logs] : Log Task Start
Orchestrator --> [Tasks & Content] : Save Pending Task

' Flow 4: Multi-Agent Logic
Orchestrator <--> LLM_Service : Delegate Sub-tasks
LLM_Service <--> ExternalAI : API Req/Res (JSON)
Orchestrator --> [Tasks & Content] : Save intermediate steps (executions)

' Flow 5: Output
Orchestrator -> [Tasks & Content] : Save Final ContentPlan
Orchestrator --> Terminal : Stream Response via WebSockets/SSE

' Flow 6: Analytics
DashService --> [Tasks & Content] : Aggregate Usage Data
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

node "Web Server Instance" <<Server Node>> {
  node "Python Runtime (FastAPI/Flask)" {
    component "middleware.py" as middleware
    component "security.py" as security
    component "rate_limit.py" as ratelimit
    component "logger.py" as logger
    component "Agent Orchestrator Routes" as routes

    middleware --> security
    middleware --> ratelimit
    routes --> logger
  }
}

node "Database Server" <<Database Node>> {
  database "PostgreSQL / MySQL Core" {
    collections "Tables: Users, Tasks, Logs"
  }
}

cloud "External Services" {
  node "OpenAI / Claude API Host" <<AI Provider>>
}

' Connections
"React.js SPA Bundle" --(0 "REST / WebSocket (HTTPS)" middleware
middleware --(0 "DB Driver (TCP/IP)" "PostgreSQL / MySQL Core"
routes --(0 "REST (HTTPS)" "OpenAI / Claude API Host"

note right of "React.js SPA Bundle"
  Presentation Layer handling
  state and visualization
end note

note right of "Python Runtime (FastAPI/Flask)"
  Application Layer handling
  business logic, MAS routing
end note

@enduml
```
