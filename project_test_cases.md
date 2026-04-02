# Stratify AI - Comprehensive Test Cases

Use these test cases to verify the application's functionality before your presentation.

---

### 1. Authentication & Security
| Test Case ID | Feature | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| AUTH-001 | Signup | User signs up with a valid email/password. | Account created, redirected to dashboard. |
| AUTH-002 | Login | User logs in with correct credentials. | Valid JWT token stored, user profile loaded. |
| AUTH-003 | Google OAuth | User clicks "Sign in with Google". | Google popup appears, login succeeds. |
| AUTH-004 | Session Log | User clicks "Logout". | Token cleared, redirected to Landing page. |

### 2. AI Intelligence (The Brain)
| Test Case ID | Feature | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| AI-001 | Strategy Gen | User enters niche and clicks generate. | CrewAI starts (Researcher -> Copywriter -> SEO). |
| AI-002 | SEO Logic | Check generated keywords. | Keywords are relevant to the niche provided. |
| AI-003 | Calendar View | Switch to Calendar tab. | Multi-day schedule appears with correct themes. |
| AI-004 | Multi-Agent | Inspect server logs during generation. | All three agents log their distinct steps. |

### 3. Localization & Business Logic
| Test Case ID | Feature | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| BIZ-001 | Currency | View ROI on Landing & Results. | Currency symbol is **₹** (Rupee). |
| BIZ-002 | Pricing | View Pricing Modal. | Pricing clearly shows ₹499/mo or ₹2,399/yr. |
| BIZ-003 | Free Limit | Create 4th strategy on a free account. | Access blocked, "Upgrade to Pro" modal appears. |
| BIZ-004 | Razorpay | Click "Upgrade to Pro". | Razorpay checkout overlay appears. |

### 4. Admin Intelligence (Dashboard)
| Test Case ID | Feature | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| ADM-001 | KPI Cards | View total users/revenue. | Cards update in real-time from MongoDB. |
| ADM-002 | Token Tracking | Generate a strategy, check tokens. | Token count increases in AI Usage chart. |
| ADM-003 | Activity Feed | Perform any action (login/generate). | Event appears instantly in the Live Feed. |

### 5. UI/UX & Reliability
| Test Case ID | Feature | Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| UX-001 | Responsiveness | Open on a mobile device/Small window. | Layout adjusts perfectly; no clipping. |
| UX-002 | Dark Mode | Switch OS theme (if supported). | Colors transition smoothly; glass effects remain readable. |
| UX-003 | Error Handling | Disconnect Internet and try to generate. | Error toast appears; app doesn't crash. |
