"""
Planvix Backend Entry Point
Run with: python main.py  OR  uvicorn app.main:app --reload
"""
import sys
import io

# ─── CRITICAL: Fix Unicode on Windows ──────────────────────────────────────
# CrewAI / LiteLLM wraps sys.stdout with a stream that uses the Windows
# default encoding (cp1252).  Emoji characters like ✅ ❌ 🤖 are not in
# cp1252 → UnicodeEncodeError at startup.  Reconfigure BEFORE any import
# that might trigger CrewAI's stream wrapper.
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    else:
        sys.stdout = io.TextIOWrapper(
            sys.stdout.buffer, encoding="utf-8", errors="replace"
        )

    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    else:
        sys.stderr = io.TextIOWrapper(
            sys.stderr.buffer, encoding="utf-8", errors="replace"
        )
except Exception:
    pass
# ───────────────────────────────────────────────────────────────────────────

import uvicorn

if __name__ == "__main__":
    print("Starting Planvix Backend (app.main:app) ...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_excludes=["*.log", "*.txt"],
    )
