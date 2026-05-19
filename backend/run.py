import sys
import io

# ─── CRITICAL: Fix Unicode on Windows ──────────────────────────────────────
# CrewAI / LiteLLM wraps sys.stdout with the Windows default encoding (cp1252).
# Emoji chars like ✅ ❌ 🤖 are not in cp1252 → UnicodeEncodeError at startup.
# Reconfigure BEFORE any other import.
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

import socket
import uvicorn

PORT = 8000
HOST = "0.0.0.0"

def is_port_free(host, port):
    """Return True if the port is available, False if already in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1)
        return s.connect_ex(("127.0.0.1", port)) != 0

if __name__ == "__main__":
    print("=" * 60)
    print("  Planvix Backend  —  Starting up")
    print("=" * 60)

    if not is_port_free(HOST, PORT):
        print(f"\n[ERROR] Port {PORT} is ALREADY IN USE!")
        print(f"        Another process (e.g. freshya) is running on :{PORT}")
        print(f"        -> Stop that process first, then restart this server.\n")
        print(f"  To find what is using port {PORT}, run:")
        print(f"    netstat -ano | findstr :{PORT}")
        print(f"  Then kill it with:")
        print(f"    taskkill /PID <PID> /F")
        print("=" * 60)
        sys.exit(1)

    print(f"  Listening on  : http://127.0.0.1:{PORT}")
    print(f"  API Docs      : http://127.0.0.1:{PORT}/docs")
    print(f"  Reload mode   : ON")
    print(f"  Log level     : INFO (all requests visible)")
    print("=" * 60 + "\n")

    uvicorn.run(
        "app.main:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info",          # Shows every request + status code
        access_log=True,           # GET /api/strategy 200 OK
    )

