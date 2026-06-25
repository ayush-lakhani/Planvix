import logging
import json
import sys
import re
from datetime import datetime, timezone
import contextvars
from typing import Any, Dict

# Context variables for enterprise observability
request_id_var = contextvars.ContextVar("request_id", default="system")
user_id_var = contextvars.ContextVar("user_id", default="anonymous")
user_tier_var = contextvars.ContextVar("user_tier", default="free")

# Secrets masking helper definitions
SECRETS_PATTERNS = [
    re.compile(r"gsk_[a-zA-Z0-9]{48}"),  # Groq keys
    re.compile(r"Bearer\s+ey[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_=]*", re.IGNORECASE), # Bearer JWTs
    re.compile(r"ey[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_=]*"), # raw JWTs
]

def mask_secrets(text: str) -> str:
    if not isinstance(text, str):
        return text
    # Mask Groq keys
    text = re.sub(r"gsk_[a-zA-Z0-9]{48}", "gsk_***[MASKED]***", text)
    # Mask JWTs
    text = re.sub(r"ey[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_=]*", "eyJ***[MASKED]***", text)
    
    # Mask key-value secrets (e.g. password="foo")
    def mask_kv(match):
        full_match = match.group(0)
        value = match.group(2)
        if value and "MASKED" not in value:
            return full_match.replace(value, "***[MASKED]***")
        return full_match

    text = re.sub(
        r"(password|secret|token|api_key|key_id|key_secret|authorization|client_secret)['\"]?\s*[:=]\s*['\"]?([^'\",\s]+)",
        mask_kv,
        text,
        flags=re.IGNORECASE
    )
    return text

def mask_data(data: Any) -> Any:
    if isinstance(data, dict):
        masked_dict = {}
        for k, v in data.items():
            k_lower = k.lower()
            if any(sub in k_lower for sub in ["password", "secret", "token", "api_key", "key", "authorization", "jwt"]):
                masked_dict[k] = "***[MASKED]***"
            else:
                masked_dict[k] = mask_data(v)
        return masked_dict
    elif isinstance(data, list):
        return [mask_data(item) for item in data]
    elif isinstance(data, str):
        return mask_secrets(data)
    return data

class EnterpriseJSONFormatter(logging.Formatter):
    """
    Standardized JSON formatter for ELK/Sentry ingestion.
    Includes correlation IDs, performance metadata, and automated secret masking.
    """
    def format(self, record: logging.LogRecord) -> str:
        message = record.getMessage()
        masked_message = mask_secrets(message)

        log_data: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": masked_message,
            "request_id": request_id_var.get(),
            "user_id": user_id_var.get(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }

        # Include custom extra fields
        if hasattr(record, "extra_data"):
            log_data["extra"] = mask_data(record.extra_data)

        # Handle exceptions
        if record.exc_info:
            log_data["exception"] = mask_secrets(self.formatException(record.exc_info))

        return json.dumps(log_data)

def setup_logger(name: str = "planvix"):
    """
    Configures logging globally so all logs are routed through root in JSON.
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Clear existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
        
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(EnterpriseJSONFormatter())
    root_logger.addHandler(handler)
    
    # Configure specific loggers to propagate to root
    for logger_name in ["uvicorn", "uvicorn.error", "uvicorn.access", "fastapi", "app.core.redis_health", "app.core.cache", "app.core.rate_limit"]:
        l = logging.getLogger(logger_name)
        l.handlers = []
        l.propagate = True

    # Setup the named logger
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    logger.propagate = True
    return logger

# Primary logger instance
logger = setup_logger()

# Convenience method for structured logs
def log_event(event_name: str, data: Dict[str, Any], level: int = logging.INFO):
    """
    Logs a structured event with metadata.
    """
    logger.log(level, f"EVENT: {event_name}", extra={"extra_data": data})
