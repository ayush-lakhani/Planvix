import logging
import json
import sys
from datetime import datetime, timezone
import contextvars
from typing import Any, Dict

# Context variables for enterprise observability
request_id_var = contextvars.ContextVar("request_id", default="system")
user_id_var = contextvars.ContextVar("user_id", default="anonymous")
user_tier_var = contextvars.ContextVar("user_tier", default="free")

class EnterpriseJSONFormatter(logging.Formatter):
    """
    Standardized JSON formatter for ELK/Sentry ingestion.
    Includes correlation IDs and performance metadata.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_var.get(),
            "user_id": user_id_var.get(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }

        # Include custom extra fields
        if hasattr(record, "extra_data"):
            log_data["extra"] = record.extra_data

        # Handle exceptions
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_data)

def setup_logger(name: str = "planvix"):
    """
    Configures the logger for production SaaS observability.
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(EnterpriseJSONFormatter())
        logger.addHandler(handler)
        
    logger.propagate = False
    return logger

# Primary logger instance
logger = setup_logger()

# Convenience method for structured logs
def log_event(event_name: str, data: Dict[str, Any], level: int = logging.INFO):
    """
    Logs a structured event with metadata.
    """
    logger.log(level, f"EVENT: {event_name}", extra={"extra_data": data})
