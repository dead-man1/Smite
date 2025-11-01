"""Usage tracking API endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import List

from app.database import get_db
from app.models import Tunnel, Usage, Node


router = APIRouter()


class UsagePush(BaseModel):
    tunnel_id: str
    node_id: str
    bytes_used: int


class UsageResponse(BaseModel):
    tunnel_id: str
    bytes_used: int
    timestamp: str


@router.post("/push")
async def push_usage(usage_data: UsagePush, db: AsyncSession = Depends(get_db)):
    """Node pushes usage data"""
    # Verify tunnel exists
    result = await db.execute(select(Tunnel).where(Tunnel.id == usage_data.tunnel_id))
    tunnel = result.scalar_one_or_none()
    if not tunnel:
        raise HTTPException(status_code=404, detail="Tunnel not found")
    
    # Update tunnel usage
    tunnel.used_mb += usage_data.bytes_used / (1024 * 1024)
    
    # Check quota
    if tunnel.quota_mb > 0 and tunnel.used_mb >= tunnel.quota_mb:
        tunnel.status = "error"
    
    # Record usage
    usage = Usage(
        tunnel_id=usage_data.tunnel_id,
        node_id=usage_data.node_id,
        bytes_used=usage_data.bytes_used
    )
    db.add(usage)
    await db.commit()
    
    return {"status": "ok"}


@router.get("/tunnel/{tunnel_id}")
async def get_tunnel_usage(tunnel_id: str, db: AsyncSession = Depends(get_db)):
    """Get usage for a tunnel"""
    result = await db.execute(select(Tunnel).where(Tunnel.id == tunnel_id))
    tunnel = result.scalar_one_or_none()
    if not tunnel:
        raise HTTPException(status_code=404, detail="Tunnel not found")
    
    return {
        "tunnel_id": tunnel_id,
        "used_mb": tunnel.used_mb,
        "quota_mb": tunnel.quota_mb,
        "remaining_mb": max(0, tunnel.quota_mb - tunnel.used_mb) if tunnel.quota_mb > 0 else None
    }

