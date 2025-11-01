"""Logs API endpoints"""
from fastapi import APIRouter
from typing import List
from datetime import datetime
import logging
import io


router = APIRouter()

# In-memory log buffer (in production, use proper logging aggregation)
log_buffer = []


class MemoryHandler(logging.Handler):
    """Custom handler that stores logs in memory"""
    def emit(self, record):
        log_buffer.append({
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": self.format(record)
        })
        # Keep only last 1000 entries
        if len(log_buffer) > 1000:
            log_buffer.pop(0)


# Setup handler
handler = MemoryHandler()
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logging.getLogger().addHandler(handler)
logging.getLogger().setLevel(logging.INFO)


@router.get("")
async def get_logs(limit: int = 100):
    """Get logs"""
    return {"logs": log_buffer[-limit:]}

