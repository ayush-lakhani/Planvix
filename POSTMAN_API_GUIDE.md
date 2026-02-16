# Postman API Testing Guide - AgentForge

Use this guide to test all the API endpoints of the project in Postman.

**Base URL:** `http://localhost:8000`

> [!IMPORTANT]
> **Signup and Login MUST use the `POST` method.** If you use `GET`, you will get a "405 Method Not Allowed" error.

> [!TIP]
> **Handling Variables:** If you see `{{strategy_id}}` in the URL, you must either:
> 1. Replace it with a real ID (e.g., `6979fa06...`) from your database/History response.
> 2. Set it as a variable in Postman (right-click the value -> Set as variable).
> 3. **Note:** Plan ID implementation details can be found in the "Payments (Pro)" section.

---

## 1. Authentication (Public)

### Signup (MUST USE POST)
*   **Method:** `POST`
*   **URL:** `{{newbaseurl}}/api/auth/signup`
*   **Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Login
*   **Method:** `POST`
*   **URL:** `{{newbaseurl}}/api/auth/login`
*   **Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
*   **Note:** Copy the `access_token` from the response for the following requests.

---

## 2. Protected Endpoints (Requires Authorization)
**Header:** `Authorization: Bearer <your_access_token>`

### Get My Profile
*   **Method:** `GET`
*   **URL:** `{{newbaseurl}}/api/auth/me`

### Generate Strategy
*   **Method:** `POST`
*   **URL:** `{{newbaseurl}}/api/strategy`
*   **Body (JSON):**
```json
{
  "topic": "Sustainable Fashion",
  "goal": "Increase brand awareness by 20%",
  "audience": "Eco-conscious Gen Z",
  "industry": "Fashion",
  "platform": "Instagram",
  "contentType": "Reels",
  "experience": "beginner" 
}
```
*   Note: `experience` can be `beginner`, `intermediate`, or `expert`.

### Get History (All Strategies)
*   **Method:** `GET`
*   **URL:** `{{newbaseurl}}/api/history`

### Get Strategy Details (By ID)
*   **Method:** `GET`
*   **URL:** `{{newbaseurl}}/api/history/{{strategy_id}}`

### Delete Strategy
*   **Method:** `DELETE`
*   **URL:** `{{newbaseurl}}/api/history/{{strategy_id}}`

---

## 3. User Profile & Feedback

### Get Profile Details
*   **Method:** `GET`
*   **URL:** `{{newbaseurl}}/profile`

### Update Profile
*   **Method:** `PUT`
*   **URL:** `{{newbaseurl}}/profile`
*   **Body (JSON):**
```json
{
  "name": "Ayush Lakhani",
  "photo": "https://example.com/photo.jpg"
}
```

### Submit Feedback
*   **Method:** `POST`
*   **URL:** `{{newbaseurl}}/feedback`
*   **Body (JSON):**
```json
{
  "strategy_id": "YOUR_STRATEGY_ID",
  "rating": "up",
  "comment": "This strategy is amazing!"
}
```

---

## 4. Health & System
### API Health Check
*   **Method:** `GET`
*   **URL:** `{{newbaseurl}}/api/health`

### Root Check
*   **Method:** `GET`
*   **URL:** `{{newbaseurl}}/`

---

## 5. Payments (Pro)
### Create Pro Checkout
*   **Method:** `POST`
*   **URL:** `{{newbaseurl}}/api/pro-checkout`
*   **Body (JSON):**
```json
{
  "plan_id": "plan_Q0kX1234567890" 
}
```
> [!NOTE]
> **Plan ID:** Use `plan_Q0kX1234567890` for **Test Mode**. In Production, use the actual Plan ID from your Razorpay Dashboard.

*   **Response (Success - 200 OK):**
```json
{
  "subscription_id": "sub_1234567890abcdef",
  "razorpay_key": "rzp_test_..." 
}
```
> [!CAUTION]
> **Security Warning:** The `razorpay_key` returned here is the **Public (Publishable) Key**. The Secret Key must **NEVER** be returned by this API or exposed to the frontend.

*   **Response (Error - 400 Bad Request):**
```json
{
  "detail": "Invalid Plan ID provided."
}
```
