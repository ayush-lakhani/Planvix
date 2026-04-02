# Stratify AI - Technical Implementation Document

## 1. Project Overview
**Stratify AI** (or PlanvIx) is a premium, multi-agent AI Content Planner designed to orchestrate high-converting content strategies. It uses a swarm of autonomous agents to handle research, copywriting, and SEO optimization in a single pass.

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
- **AI Engine**: CrewAI (Sequential & Collaborative Process)
- **LLMs**: Llama 3.3 70B (via Groq API)
- **Authentication**: JWT (JSON Web Tokens) with Google OAuth support

### 🗄️ Database & Middleware
- **Primary DB**: MongoDB (User profiles, strategy history, analytics)
- **Cache**: Redis (Session management, rate-limiting, and feed events)
- **Payments**: Razorpay (Subscription management & Webhook fulfillment)

---

## 3. System Architecture

### 🤖 Multi-Agent Orchestration (CrewAI)
The core of the system is the **CrewAI** engine, which manages three distinct personas:
1.  **Market Researcher**: Scours the input parameters to identify trends and niche-specific data points.
2.  **Creative Director**: Synthesizes research into content pillars and high-conversion hooks.
3.  **SEO Expert**: Injects semantic keywords and optimizes the strategy for search rankings.

### 🔄 Data Flow
1.  **Request**: User submits a niche to the React frontend.
2.  **Process**: FastAPI validates the request and triggers the CrewAI task.
3.  **Storage**: The final JSON strategy is saved to MongoDB.
4.  **Analytics**: Token consumption is logged to Redis and tracked on the Admin Dashboard.
5.  **Delivery**: Results are streamed back to the user via the frontend dashboard.

---

## 4. Key Performance Features

### 💰 ROI & Localization
- **Localized Metrics**: Displays all financial projections in **₹ (Rupees)**.
- **ROI Engine**: Predicts monthly traffic lift and conversion rates based on AI projections.

### 🛡️ Security & Scalability
- **Rate-Limiting**: Integrated Redis-based limiting to prevent API abuse.
- **Pro Tier Logic**: Automatic subscription identification via Razorpay webhooks.

---

## 5. Deployment Architecture
- **Frontend**: Vercel (Production-grade global CDN).
- **Backend**: Railway / Docker (Containerized Python environment).
- **Database**: MongoDB Atlas (Cloud-native NoSQL storage).

---

## 6. Future Roadmap
- One-click multi-platform posting (X, LinkedIn, Instagram).
- Image generation agents (DALL-E 3 / Flux integration).
- AI Team Role Expansion (Custom agents per brand).
