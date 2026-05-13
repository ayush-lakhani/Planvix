# planvIx Merged Project Documentation

This file consolidates the material from the 6 files inside `documentation/` into one report-style document.
Duplicate abstract files were merged once to avoid repeated pages.

---

## Page 1 - Cover Page

**PROJECT TITLE**

planvIx: Multi-Agent AI Content Strategy Planner

**PROJECT/INTERNSHIP REPORT**

Submitted by

- STUDENT 1 NAME (USN: _______________)
- STUDENT 2 NAME (USN: _______________)
- STUDENT 3 NAME (USN: _______________)

In partial fulfillment for the award of the degree of

**MASTER OF COMPUTER APPLICATIONS**

With Specialization In

____________________________

Department of Computer Science and Information Technology
School of Computer Science and IT
Jain Knowledge Campus
Jayanagar 9th Block, Bangalore - 560041

May - 2026

---

## Page 2 - Title Page / Submission Page

**planvIx: Multi-Agent AI Content Strategy Planner**

**Internship/Project Report**

Submitted by

- STUDENT 1 NAME (USN: _______________)
- STUDENT 2 NAME (USN: _______________)
- STUDENT 3 NAME (USN: _______________)

In partial fulfillment for the award of the degree of

**Master of Computer Applications**

With Specialization in

____________________________

Department of Computer Science and IT
Jain Knowledge Campus
Jayanagar 9th Block
Bangalore - 560041

May - 2026

---

## Page 3 - Department Certificate

DEPARTMENT OF COMPUTER SCIENCE AND IT  
Jain Knowledge Campus  
Jayanagar 9th Block, Bangalore - 560041

This is to certify that the project entitled:

**planvIx: Multi-Agent AI Content Strategy Planner**

is the bonafide record of project work done by:

- STUDENT 1 NAME (USN: _______________)
- STUDENT 2 NAME (USN: _______________)
- STUDENT 3 NAME (USN: _______________)

MCA with Specialization in __________________ during the academic year 2025-2026.

Guide / Mentor  
Name: ___________________________  
Department of Computer Science and IT  
JAIN (Deemed-to-be University)

Programme Head  
Dr. Murugan R  
Programme Head - MCA  
Department of Computer Science and IT  
JAIN (Deemed-to-be University)

---

## Page 4 - Certificate

**CERTIFICATE**

This is to certify that STUDENT 1 NAME (USN: _______________), STUDENT 2 NAME (USN: _______________), and STUDENT 3 NAME (USN: _______________) of MCA with Specialization in __________________, in the Department of Computer Science and IT, have fulfilled the Project / Internship requirements prescribed for the MCA programme in JAIN (Deemed-to-be University).

The project titled **"planvIx: Multi-Agent AI Content Strategy Planner"** was carried out under my direct supervision. No part of this dissertation was submitted earlier for the award of any degree or diploma.

Guide / Mentor  
Name: ___________________________  
JAIN (Deemed-to-be University)

Project / Internship Viva-voce:

1. Examiner Name: ___________________________  Signature with Date: ___________________________
2. Examiner Name: ___________________________  Signature with Date: ___________________________

---

## Page 5 - Declaration

**DECLARATION**

I / We affirm that the project work titled **"planvIx: Multi-Agent AI Content Strategy Planner"**, submitted in partial fulfillment for the award of **Master of Computer Applications** with Specialization in __________________, is original work carried out by us. It has not formed part of any other project submitted for the award of any degree or diploma in this or any other university.

Signature of Candidate(s): ___________________________  
Student Name(s): ___________________________  
USN Number(s): ___________________________

---

## Page 6 - Acknowledgement

**ACKNOWLEDGEMENT**

We express our sincere gratitude to our project mentor, faculty members, and the Department of Computer Science and IT, JAIN (Deemed-to-be University), for their continuous guidance and support throughout the development of this project.

We are thankful to the academic leadership of the School of Computer Science and IT for providing the institutional environment and encouragement required to complete this work successfully.

We also acknowledge the contribution of open-source communities and technical documentation for React, FastAPI, MongoDB, Redis, and related AI tooling, which supported the implementation of this project.

Finally, we thank our families and friends for their encouragement, patience, and support during the completion of this project report.

Special thanks to:

- Dr. Sagar Gulati, Director, School of Computer Science and IT
- Dr. Ananta Charan Ojha, Deputy Director, School of Computer Science and IT
- Dr. K Suneetha, Head, Department of Computer Science and IT
- Dr. Murugan R, Programme Head, MCA Programme
- Dr. I Brem Navas, Professor and Project Coordinator

---

## Page 7 - Abstract

**ABSTRACT**

planvIx is a multi-agent AI content strategy platform designed to help users generate structured, platform-specific marketing strategies through an integrated web application. The system combines a React frontend, a FastAPI backend, MongoDB-based persistence, Redis caching, WebSocket-based live activity updates, and an AI orchestration layer that produces strategic outputs such as positioning insights, content pillars, keyword plans, ROI estimates, and execution calendars.

The motivation behind this project is the growing need for small businesses, creators, and digital teams to generate high-quality content plans quickly without manually combining market research, audience profiling, and platform-specific content decisions. Traditional content planning is time-consuming, inconsistent, and difficult to scale. planvIx addresses this problem by organizing the workflow into a modular architecture and simulating specialized AI agents for analysis, persona building, strategy creation, and optimization.

The system implements secure user authentication, role-based access for administrators, usage tracking, analytics dashboards, and a history-based strategy archive. It also supports admin intelligence features such as KPI monitoring, system health visibility, revenue analytics, and live event feeds. The backend follows a layered architecture with clear separation between routers, services, schemas, and infrastructure components, making the project scalable and maintainable.

This project demonstrates how modern web engineering, AI-assisted generation, and software architecture principles can be combined to build a practical SaaS-style platform. The final result is a documentation-ready, deployment-oriented application that provides real value for content planning workflows while also serving as a strong case study in full-stack development, system design, and applied AI integration.

---

## Page 8 - Table of Contents

**TABLE OF CONTENTS**

| S. No. | Topic | Page |
| --- | --- | --- |
| 1 | Cover Page | 1 |
| 2 | Title Page / Submission Page | 2 |
| 3 | Department Certificate | 3 |
| 4 | Certificate | 4 |
| 5 | Declaration | 5 |
| 6 | Acknowledgement | 6 |
| 7 | Abstract | 7 |
| 8 | Table of Contents | 8 |
| 9 | List of Tables | 9 |
| 10 | List of Figures | 10 |
| 11 | Chapter 1 - Introduction | 11 |
| 12 | Chapter 2 - Literature Review | 13 |
| 13 | Chapter 3 - System Analysis | 15 |
| 14 | Chapter 4 - System Design and Architecture | 18 |
| 15 | Chapter 5 - System Requirements | 22 |
| 16 | Chapter 6 - Implementation | 24 |
| 17 | Chapter 7 - Results and Screenshots | 29 |
| 18 | Chapter 8 - Conclusion and Future Enhancement | 32 |
| 19 | References | 34 |

---

## Page 9 - List of Tables

**LIST OF TABLES**

| Table No. | Title | Page |
| --- | --- | --- |
| Table 4.1 | Major Functional Modules of planvIx | 19 |
| Table 4.2 | Database Collections and Purpose | 21 |
| Table 5.1 | Software Requirements | 22 |
| Table 5.2 | Hardware Requirements | 23 |
| Table 7.1 | Output and Result Summary | 29 |

---

## Page 10 - List of Figures

**LIST OF FIGURES**

| Figure No. | Title | Page |
| --- | --- | --- |
| Fig. 4.1 | High-Level System Architecture | 18 |
| Fig. 4.2 | Strategy Generation Flow | 20 |
| Fig. 4.3 | Admin Analytics and Activity Flow | 21 |
| Fig. 7.1 | User Dashboard / Planner Screen | 30 |
| Fig. 7.2 | Generated Strategy Output Screen | 30 |
| Fig. 7.3 | Admin Dashboard Analytics Screen | 31 |

---

## Page 11 - Chapter 1: Introduction

### 1.1 Background

Digital marketing teams increasingly rely on software platforms to plan campaigns, analyze audience behavior, and generate content ideas. However, many existing tools either focus only on text generation or only on dashboard analytics. There is a gap between content ideation, business strategy, keyword planning, and execution scheduling.

planvIx was developed to bridge this gap by delivering an integrated system that accepts user business goals and produces a structured content strategy. The project uses a multi-agent inspired workflow to divide the planning process into logical roles such as analysis, persona building, content design, and optimization.

### 1.2 Problem Statement

Manual content planning is often slow, inconsistent, and difficult to personalize for different industries and platforms. Businesses and creators need a tool that can:

- understand campaign goals and target audience,
- suggest content pillars and post structures,
- provide keyword and hashtag support,
- estimate performance and ROI direction,
- store and retrieve previous strategies, and
- offer analytics for administrative monitoring.

### 1.3 Objectives

The major objectives of this project are:

- To design and develop an AI-assisted multi-agent content strategy platform.
- To generate structured marketing plans based on user goals, platform, audience, and industry.
- To provide a secure full-stack application with authentication and role-based access.
- To maintain strategy history, token/usage visibility, and administrative analytics.
- To implement a scalable layered architecture suitable for real-world deployment.

### 1.4 Scope of the Project

The scope of planvIx includes user registration, login, strategy generation, strategy history, profile and usage monitoring, admin dashboard analytics, WebSocket activity updates, and payment-aware upgrade flow support. The project focuses on strategic planning assistance rather than direct publishing to third-party social networks.

### 1.5 Significance of the Project

This project is significant because it demonstrates the practical application of AI orchestration in a business use case. It combines modern frontend and backend engineering with data persistence, caching, security, and analytics into one usable product-oriented system.

---

## Page 13 - Chapter 2: Literature Review

### 2.1 AI-Assisted Content Generation Systems

Recent AI content tools have shown that large language models can generate captions, blog ideas, and campaign copy quickly. However, many such tools behave as isolated prompt wrappers and do not provide a structured end-to-end strategy. planvIx extends this idea by organizing the workflow into a set of specialized agent roles and returning structured outputs instead of free-form text alone.

### 2.2 Multi-Agent Decision Making

Multi-agent systems divide a complex task into smaller responsibilities handled by specialized units. In marketing strategy generation, this helps separate audience understanding, content framing, keyword planning, and ROI reasoning. The conceptual value of multi-agent design is modularity, explainability, and easier future extension.

### 2.3 SaaS Analytics Platforms

Modern SaaS applications typically include activity tracking, KPI dashboards, billing awareness, and user management. planvIx borrows these ideas by integrating analytics and monitoring into the platform, allowing both operational visibility and user-level personalization.

### 2.4 Relevance to the Proposed System

The literature and industry patterns suggest that a strong product in this space should combine:

- AI-assisted output generation,
- modular architecture,
- real-time monitoring,
- secure access control, and
- persistent data analysis.

planvIx incorporates these elements in a single application, making it a suitable academic and practical implementation.

---

## Page 15 - Chapter 3: System Analysis

### 3.1 Existing System

In a conventional workflow, content planning is performed manually using spreadsheets, note-taking tools, keyword search platforms, and separate analytics dashboards. This creates fragmentation, increases effort, and reduces consistency.

### 3.2 Limitations of the Existing Approach

- No unified interface for idea generation and execution planning.
- High dependence on manual research.
- Limited personalization across industries and target audiences.
- Time-consuming repetition for recurring campaigns.
- Weak feedback loop between planning and analytics.

### 3.3 Proposed System

The proposed system is a full-stack web application where authenticated users can generate a detailed content strategy by entering a business goal, audience, industry, platform, content type, and strategy mode. The platform then produces structured outputs including overview, content pillars, calendar, keywords, and ROI-oriented metrics.

### 3.4 Functional Requirements

- User signup and login.
- Protected strategy generation API.
- Strategy history storage and retrieval.
- Usage counting and monthly tier limits.
- Admin authentication and dashboard access.
- Real-time event broadcasting through WebSockets.
- Analytics and health monitoring.

### 3.5 Non-Functional Requirements

- Scalability through layered architecture.
- Security through JWT, admin secret, and rate limiting.
- Performance through Redis caching.
- Maintainability through modular services and schemas.
- Usability through responsive React-based interfaces.

### 3.6 Feasibility Analysis

**Technical Feasibility:** The project uses mature technologies such as React, FastAPI, MongoDB, Redis, and WebSockets, making implementation practical.

**Operational Feasibility:** The system matches real user needs for content planning and admin monitoring.

**Economic Feasibility:** The system is implementable with open-source frameworks and can be extended into a SaaS product model.

---

## Page 18 - Chapter 4: System Design and Architecture

### 4.1 High-Level Architecture

planvIx follows a decoupled layered architecture:

- **Frontend Layer:** React + Vite SPA for user and admin interfaces.
- **API Layer:** FastAPI routers for auth, strategy, analytics, profile, payment, and health.
- **Service Layer:** Business logic for strategy creation, analytics, usage tracking, and system health.
- **Data Layer:** MongoDB for persistence and Redis for caching.
- **Communication Layer:** WebSocket manager for live admin activity feed.

### 4.2 Architecture Flow

1. User enters strategy inputs from the planner page.
2. Frontend sends a protected API request.
3. Backend validates the user and usage limits.
4. Strategy service checks cache and invokes the orchestration layer.
5. Strategy is saved to MongoDB and usage counters are updated.
6. Event notifications are broadcast to the admin activity feed.
7. Frontend displays structured results to the user.

### 4.3 Major Modules

| Module | Description |
| --- | --- |
| Authentication Module | Handles signup, login, JWT issuance, and protected route access. |
| Strategy Module | Accepts strategy input and returns structured content strategy output. |
| History Module | Stores and retrieves previously generated strategies. |
| Profile Module | Displays user usage, tier, and account data. |
| Admin Module | Provides analytics, user management views, and system monitoring. |
| WebSocket Module | Streams live activity updates to the admin dashboard. |
| Payment / Upgrade Module | Supports subscription-aware features and premium flow expansion. |

### 4.4 Data Model Overview

| Collection | Purpose |
| --- | --- |
| `users` | Stores account identity, tier, usage count, and billing-related fields. |
| `strategies` | Stores generated strategy documents and metadata. |
| `ai_usage_logs` | Tracks AI token usage and related analytics data. |
| `admin_logs` | Stores live activity and admin-event history. |

### 4.5 API Design Summary

Important endpoints include:

- `/api/auth/signup`
- `/api/auth/login`
- `/api/strategy`
- `/api/history`
- `/api/profile`
- `/api/admin/analytics`
- `/api/admin/health`
- `/ws/admin/activity`

### 4.6 Security Design

The system applies:

- JWT authentication for users,
- admin authorization through protected admin flows,
- request validation using Pydantic schemas,
- rate limiting through SlowAPI,
- CORS configuration,
- password hashing,
- secure middleware and error handling.

---

## Page 22 - Chapter 5: System Requirements

### 5.1 Software Requirements

| Requirement | Details |
| --- | --- |
| Operating System | Windows / Linux / macOS |
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Database | MongoDB |
| Cache | Redis |
| AI / Orchestration | CrewAI-style orchestration, Groq API support |
| Browser | Latest Chrome / Edge / Firefox |

### 5.2 Hardware Requirements

| Requirement | Minimum |
| --- | --- |
| Processor | Intel i5 or equivalent |
| RAM | 8 GB |
| Storage | 10 GB free space |
| Internet | Required for API access and dependency installation |

### 5.3 Platform Features Used

- Responsive single-page frontend.
- Secure REST API backend.
- Persistent storage for user and strategy data.
- Cached reads for better performance.
- Real-time monitoring through WebSockets.

---

## Page 24 - Chapter 6: Implementation

### 6.1 Frontend Implementation

The frontend is built using React and Vite. It contains user-facing pages such as landing, login, signup, dashboard, planner, history, analytics, calendar, profile, upgrade, and blueprint pages. It also includes admin login and admin dashboard pages. Route protection is implemented using dedicated protected route wrappers.

### 6.2 Planner Module

The strategic planner interface collects inputs such as goal, audience, industry, platform, content type, and strategy mode. While the request is processed, the UI displays simulated agent logs to create an interactive planning experience. After the response is returned, the frontend normalizes the strategy object and displays the result.

### 6.3 Backend Implementation

The backend is implemented using FastAPI. Routers are defined for authentication, strategy generation, profile handling, analytics, admin operations, health checks, and payment workflows. Business logic is delegated to service classes to maintain clean separation from route handlers.

### 6.4 Strategy Generation Workflow

The strategy service performs the following operations:

1. Generate a cache key from input parameters.
2. Check Redis for existing matching strategy output.
3. If not cached, invoke the strategy orchestrator.
4. Add metadata such as difficulty score, confidence score, and growth score.
5. Store the strategy in MongoDB.
6. Update usage counters.
7. Return the structured strategy to the frontend.

### 6.5 History and Profile Module

Generated strategies are stored per user and can be fetched later from the history endpoint. Profile information includes tier, usage count, total strategies, and account creation data. This gives the platform continuity beyond one-time generation.

### 6.6 Admin Dashboard Implementation

The admin dashboard presents analytics data such as monthly recurring revenue, user growth, token usage, industry breakdown, live activities, and system health. These metrics are driven by backend endpoints and MongoDB aggregation logic.

### 6.7 Real-Time Activity Feed

The WebSocket activity module broadcasts important events such as user signup, strategy generation, strategy deletion, admin login, and payment events. This improves visibility for monitoring and platform operations.

### 6.8 Payment and Upgrade Flow

The project includes pricing tiers and upgrade-related flows, making the platform suitable for SaaS-oriented extension. This supports business modeling as well as technical expansion.

---

## Page 29 - Chapter 7: Results and Screenshots

### 7.1 Result Summary

| Feature | Outcome |
| --- | --- |
| User Authentication | Implemented |
| Strategy Generation | Implemented |
| Strategy History | Implemented |
| Usage Tracking | Implemented |
| Admin Dashboard | Implemented |
| Analytics Engine | Implemented |
| WebSocket Activity Feed | Implemented |
| Payment / Upgrade Flow | Implemented in project structure |

### 7.2 Observed Outputs

The developed system successfully generates structured strategy outputs containing:

- strategic overview,
- content pillars,
- sample post ideas,
- calendar entries,
- keyword suggestions,
- ROI prediction metrics.

The admin side successfully presents analytics and real-time activity monitoring, indicating that the project integrates both user productivity features and platform-level intelligence.

### 7.3 Suggested Screenshot Placement

Insert the following screenshots while preparing the final Word/PDF submission:

- Fig. 7.1: User dashboard or planner input screen
- Fig. 7.2: Generated strategy results screen
- Fig. 7.3: Admin dashboard analytics screen
- Fig. 7.4: Live activity or system health screen

### 7.4 Remarks

The project outcome demonstrates that a modular AI-assisted system can be designed as a practical full-stack application instead of a simple prompt-based prototype. The software is suitable both as an academic submission and as a base for production-oriented enhancement.

---

## Page 32 - Chapter 8: Conclusion and Future Enhancement

### 8.1 Conclusion

planvIx successfully demonstrates the design and implementation of a multi-agent AI content strategy planner using a modern full-stack architecture. The project integrates secure authentication, modular backend services, real-time communication, caching, analytics, and structured AI-assisted outputs into a single coherent platform.

The system reduces the effort required for content planning by transforming raw user goals into organized strategic recommendations. It also provides operational value through admin intelligence features, making it more comprehensive than a basic text-generation application.

### 8.2 Future Enhancements

Possible future enhancements include:

- direct publishing integrations with social media platforms,
- richer persona and competitor analysis,
- collaborative team workspaces,
- export to PDF, DOCX, and presentation formats,
- advanced feedback-based strategy refinement,
- multilingual content generation,
- deeper payment and subscription automation,
- predictive analytics based on historical strategy performance.

---

## Page 34 - References

**REFERENCES**

1. React Documentation. https://react.dev/
2. FastAPI Documentation. https://fastapi.tiangolo.com/
3. MongoDB Documentation. https://www.mongodb.com/docs/
4. Redis Documentation. https://redis.io/docs/
5. Vite Documentation. https://vitejs.dev/
6. Tailwind CSS Documentation. https://tailwindcss.com/docs/
7. Pydantic Documentation. https://docs.pydantic.dev/
8. Uvicorn Documentation. https://www.uvicorn.org/
9. WebSocket Protocol Overview. https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
10. CrewAI and multi-agent orchestration references used in project implementation context.

---

## Notes For Final Submission

- Replace all student name, USN, specialization, and guide placeholders.
- Add institutional signatures where required.
- Insert real screenshots from the running application into Chapter 7.
- If you need a final college submission version, export this file to Word/PDF and adjust spacing and page numbering.
