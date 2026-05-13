# Stratify AI - Backend Presentation Guide

When explaining the backend to your mentor, focus on these **5 core technical pillars**. It shows that you didn't just build a wrapper for an API, but a scalable, secure ecosystem.

---

### 1. Framework: FastAPI (Asynchronous Performance)
*   **What to say**: "We chose **FastAPI** because it's one of the fastest Python frameworks available. It uses `async/await` which allows the server to handle multiple requests simultaneously without blocking."
*   **Key Tech Points**:
    *   **Pydantic**: Used for data validation (ensures only correctly formatted data enters the DB).
    *   **Auto-Docs**: Show the `/docs` URL (Swagger UI) which was generated automatically from our code.

### 2. AI Orchestration: CrewAI 5-Agent Pipeline
*   **What to say**: "Our backend doesn't just send a prompt to ChatGPT. We use **CrewAI** to orchestrate five specialized agents in a sequential pipeline that build upon each other's output."
*   **Key Tech Points**:
    *   **Agent 1 - Persona**: Defines target audience demographics, interests, and pain points.
    *   **Agent 2 - Trend**: Researches current market trends and competitive landscape.
    *   **Agent 3 - Traffic**: Analyzes traffic sources and keyword opportunities.
    *   **Agent 4 - Synthesis**: Combines all inputs to generate the final content strategy.
    *   **Agent 5 - ROI**: Calculates projected ROI and provides actionable recommendations.
    *   **Sequential Process**: Each agent's output flows to the next, ensuring a cohesive final strategy.
    *   **State Management**: Context is passed between agents so the final output is comprehensive.

### 3. High-Speed Inference: Groq + Llama 3.3
*   **What to say**: "To ensure a premium user experience, we integrated **Groq**. It's an LPU (Language Processing Unit) that delivers Llama 3.3 tokens at incredible speeds—meaning the user gets their strategy in seconds, not minutes."

### 4. Real-time Streaming: Server-Sent Events (SSE)
*   **What to say**: "We implemented SSE to stream agent progress in real-time. Users see each agent's thought process as it happens."
*   **Key Tech Points**:
    *   **SSE Endpoint**: `/api/tasks/{task_id}/stream` provides real-time updates.
    *   **Progress Events**: Each agent completion triggers an event sent to the frontend.
    *   **No WebSocket Overhead**: SSE uses simpler HTTP streaming, ideal for one-way updates.

### 5. Hybrid Database Layer: MongoDB & Redis
*   **What to say**: "We use a 'Best-of-both-worlds' polyglot persistence strategy."
*   **Key Tech Points**:
    *   **MongoDB**: Ideal for storing AI output because the data can be deeply nested and unstructured. Stores Users, Tasks, Strategies, AgentExecutions, UsageTracking.
    *   **Redis**: Used for high-speed tasks like **Rate Limiting** (preventing API abuse) and managing the **Live Activity Feed** for SSE streaming.

---

### 💡 Potential Mentor Questions (FAQ)

**Q: Why MongoDB instead of SQL (MySQL/PostgreSQL)?**
*   **Answer**: "Content strategies are JSON-heavy and can change structure based on future agent updates. NoSQL gives us the flexibility to evolve the product without expensive schema migrations."

**Q: How do you handle security?**
*   **Answer**: "We use **JWT (JSON Web Tokens)** for session management. Passwords are never stored in plain text; they are hashed using **bcrypt**. Additionally, we use **SecurityHeadersMiddleware** to prevent common web attacks like XSS and Clickjacking."

**Q: How does the AI work if the Groq key is missing?**
*   **Answer**: "We built a **Logic Fallback**. If the API key isn't provided, the system detects it and switches to 'Demo Mode,' returning high-quality mock data so the app remains usable for testing."

**Q: How does the 5-agent pipeline ensure quality?**
*   **Answer**: "Each agent specializes in one aspect of content strategy. The sequential flow ensures that Persona defines the audience before Trend researches the market, before Traffic analyzes keywords, before Synthesis creates content, before ROI calculates returns. This division of labor ensures each component is thoroughly researched."
