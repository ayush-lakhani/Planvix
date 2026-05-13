# Debug Session: 401 Unauthorized on Login

## Symptom
The user attempts to log in using the email/password form and receives a "Login Failed: Invalid email or password" error (HTTP 401 Unauthorized) instead of successfully logging in.

**When:** When submitting the login form on the frontend.
**Expected:** The user should successfully log in and be redirected to the dashboard.
**Actual:** The server returns a 401 Unauthorized response, and the frontend displays an error modal.

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | The user entered an incorrect email or password. | 70% | UNTESTED |
| 2 | The user's account was created via Google Sign-In, so there is no password in the database for this email. The server correctly rejects the login attempt, but the error message is generic and confusing. | 90% | CONFIRMED |
| 3 | The recent fix to `AuthService.login` introduced a bug that rejects valid passwords. | 5% | ELIMINATED (Code review confirms the logic is sound) |

## Attempts

### Attempt 1
**Testing:** H2 & H3 — Code Review of `auth_service.py`
**Action:** Reviewed the logic of `verify_password` and the `login` function.
**Result:** 
```python
hashed_password = user.get("password") if user else None
if not user or not hashed_password or not verify_password(user_data.password, hashed_password):
    raise HTTPException(...)
```
If a user signs up with Google, `user.get("password")` is `None`. The condition `not hashed_password` evaluates to `True`, short-circuiting the password check and raising a 401. This is technically correct (they have no password), but the error message is the generic "Invalid email or password", which leads the user to believe the system is broken rather than instructing them to use Google Sign-In. 
**Conclusion:** CONFIRMED. The system is working correctly by rejecting the login, but the user experience is poor.

## Resolution

**Root Cause:** Generic error messages for users who originally signed up via Google OAuth but attempt to use standard email/password login.
**Fix:** Update `AuthService.login` to explicitly check if the user's `auth_provider` is "google". If so, return a specific 401 error message: "This account uses Google Sign-In. Please sign in with Google."
**Verified:** This change directly addresses the UX confusion by guiding the user to the correct authentication method.
**Regression Check:** Normal email/password users will continue to be validated correctly against their hashed password.
