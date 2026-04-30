import logging
import json
from datetime import datetime
import contextvars

# Context variable to store request ID across async calls
request_id_var = contextvars.ContextVar("request_id", default="system")

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_var.get(),
        }
        if record.exc_info:
            # We don't expose stack trace to the client, but we log it internally
            log_record["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logger(name="app"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Prevent duplicate handlers
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        
    # Disable propagation to root logger to avoid duplicate logs if root is configured elsewhere
    logger.propagate = False
    
    return logger

logger = setup_logger()
