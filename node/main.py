"""
Smite Node - Lightweight Agent
"""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import agent
from app.hysteria2_client import Hysteria2Client
from app.core_adapters import AdapterManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Start Hysteria2 client and connect to panel
    h2_client = Hysteria2Client()
    await h2_client.start()
    app.state.h2_client = h2_client
    
    # Initialize adapter manager
    adapter_manager = AdapterManager()
    app.state.adapter_manager = adapter_manager
    
    # Auto-register with panel
    try:
        await h2_client.register_with_panel()
    except Exception as e:
        print(f"Warning: Could not register with panel: {e}")
        print("Node will continue running but manual registration may be needed")
    
    yield
    
    # Shutdown
    if hasattr(app.state, 'h2_client'):
        await app.state.h2_client.stop()
    if hasattr(app.state, 'adapter_manager'):
        await app.state.adapter_manager.cleanup()


app = FastAPI(
    title="Smite Node",
    description="Lightweight Tunnel Agent",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent.router, prefix="/api/agent", tags=["agent"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "smite-node"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8888)

