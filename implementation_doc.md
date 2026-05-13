# Stratify AI - Technical Implementation Document

## 1. Project Overview
**Stratify AI** (or PlanvIx) is a premium, multi-agent AI Content Planner designed to orchestrate high-converting content strategies. It uses a **5-agent CrewAI sequential pipeline** to handle audience analysis, trend research, traffic analysis, content synthesis, and ROI prediction in a single pass.

---

## 2. Technology Stack

### 💻 Frontend
- **Framework**: React.js 18 (Vite)
- **Styling**: Tailwind CSS (Premium Dark Mode / Glassmorphism)
- **Icons**: Lucide React
- **Animations**: AOS (Animate On Scroll) & Framer Motion transitions
- **Charts**: Recharts (ROI and Usage Visualization)

### ⚙️ Backend
- **Framework**: FastAPI (Python 3.10+)
- **AI Engine**: CrewAI (Sequential Process)
- **LLMs**: Llama 3.3 70B (via Groq API)
- **Authentication**: JWT (JSON Web Tokens) with Google OAuth support

### 🗄️ Database & Middleware
- **Primary DB**: MongoDB (User profiles, strategy history, analytics, agent executions, usage tracking)
- **Cache**: Redis (Session management, rate-limiting, and SSE live feed events)
- **Payments**: Razorpay (Subscription management & Webhook fulfillment)

---

## 3. System Architecture

### 🤖 5-Agent CrewAI Pipeline (Sequential)
The core of the system is the **CrewAI** engine (`crew_orchestrator.py`), which manages five sequential agents:

1.  **Persona Agent** (`persona_agent.py`): Defines target audience demographics, pain points, and emotional triggers.
2.  **Trend Agent** (`trend_agent.py`): Identifies industry gaps, current trends, and hook angles.
3.  **Traffic Agent** (`traffic_agent.py`): Generates SEO keywords, long-tail phrases, and hashtags.
4.  **Synthesis Agent** (`synthesis_agent.py`): Creates content pillars, sample posts, and content calendar.
5.  **ROI Agent** (`roi_agent.py`): Merges all outputs, calculates projected ROI, traffic lift, and engagement predictions.

Each agent passes its output to the next via the `context` parameter in CrewAI tasks, ensuring a cohesive final strategy.

### 🔄 Data Flow
1.  **Request**: User submits content strategy parameters (goal, audience, industry, platform) via React frontend.
2.  **Validation**: FastAPI validates JWT and checks rate limits against Redis.
3.  **Orchestration**: CrewAI kicks off the 5-agent sequential pipeline.
4.  **Streaming**: Each agent completion triggers an SSE event to the frontend for real-time progress updates.
5.  **Storage**: The final merged JSON strategy is saved to MongoDB.
6.  **Analytics**: Token consumption is logged to MongoDB (UsageTracking collection) and Redis.
7.  **Delivery**: Results are streamed via SSE back to the user.

### 📡 Real-time Streaming (SSE)
- **Endpoint**: `/api/tasks/{task_id}/stream`
- **Implementation**: Server-Sent Events provide one-way real-time updates.
- **Events**: Each agent triggers an event: `persona:done`, `trends:done`, `traffic:done`, `synthesis:done`, `roi:done`.

---

## 4. Key Performance Features

### 💰 ROI & Localization
- **Localized Metrics**: Displays all financial projections in **₹ (Rupees)**.
- **ROI Engine**: The ROI Agent predicts monthly traffic lift, engagement boost, estimated reach, conversion rate, and risk level.

### 🛡️ Security & Scalability
- **Rate-Limiting**: Integrated Redis-based limiting to prevent API abuse.
- **Pro Tier Logic**: Automatic subscription identification via Razorpay webhooks.
- **SSE Streaming**: Non-blocking real-time updates via HTTP streaming.

---

## 5. Deployment Architecture
- **Frontend**: Vercel (Production-grade global CDN).
- **Backend**: Railway / Docker (Containerized Python environment).
- **Database**: MongoDB Atlas (Cloud-native NoSQL storage).
- **Cache**: Redis (Upstash or Railway Redis).

---

## 6. Future Roadmap
- One-click multi-platform posting (X, LinkedIn, Instagram).
- Image generation agents (DALL-E 3 / Flux integration).
- AI Team Role Expansion (Custom agents per brand).
- Collaborative process mode (agents working in parallel).
