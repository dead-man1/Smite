"""Nodes API endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
from pydantic import BaseModel

from app.database import get_db
from app.models import Node


router = APIRouter()


class NodeCreate(BaseModel):
    name: str
    fingerprint: str
    metadata: dict = {}


class NodeResponse(BaseModel):
    id: str
    name: str
    fingerprint: str
    status: str
    registered_at: datetime
    last_seen: datetime
    metadata: dict
    
    class Config:
        from_attributes = True


@router.post("", response_model=NodeResponse)
async def create_node(node: NodeCreate, db: AsyncSession = Depends(get_db)):
    """Register a new node"""
    # Check if fingerprint exists
    result = await db.execute(select(Node).where(Node.fingerprint == node.fingerprint))
    existing = result.scalar_one_or_none()
    
    if existing:
        # Update last_seen and metadata
        existing.last_seen = datetime.utcnow()
        existing.status = "active"
        if node.metadata:
            existing.metadata.update(node.metadata)
        await db.commit()
        await db.refresh(existing)
        return existing
    
    # Create new node
    db_node = Node(
        name=node.name,
        fingerprint=node.fingerprint,
        status="active",
        metadata=node.metadata or {}
    )
    db.add(db_node)
    await db.commit()
    await db.refresh(db_node)
    return db_node


@router.get("", response_model=List[NodeResponse])
async def list_nodes(db: AsyncSession = Depends(get_db)):
    """List all nodes"""
    result = await db.execute(select(Node))
    nodes = result.scalars().all()
    return nodes


@router.get("/{node_id}", response_model=NodeResponse)
async def get_node(node_id: str, db: AsyncSession = Depends(get_db)):
    """Get node by ID"""
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node


@router.delete("/{node_id}")
async def delete_node(node_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a node"""
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    await db.delete(node)
    await db.commit()
    return {"status": "deleted"}

