"""
Smite Panel - Central Controller
"""
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import nodes, tunnels, panel, usage, status, logs
from app.hysteria2_server import Hysteria2Server


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Initialize database
    await init_db()
    
    # Start Hysteria2 server if enabled (cert generation)
    h2_server = Hysteria2Server()
    await h2_server.start()
    app.state.h2_server = h2_server
    
    yield
    
    # Shutdown
    if hasattr(app.state, 'h2_server'):
        await app.state.h2_server.stop()


app = FastAPI(
    title="Smite Panel",
    description="Tunneling Control Panel",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.docs_enabled else None,
    redoc_url="/redoc" if settings.docs_enabled else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(panel.router, prefix="/api/panel", tags=["panel"])
app.include_router(nodes.router, prefix="/api/nodes", tags=["nodes"])
app.include_router(tunnels.router, prefix="/api/tunnels", tags=["tunnels"])
app.include_router(usage.router, prefix="/api/usage", tags=["usage"])
app.include_router(status.router, prefix="/api/status", tags=["status"])
app.include_router(logs.router, prefix="/api/logs", tags=["logs"])

# Serve frontend static files if available
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

@app.get("/")
async def root():
    return RedirectResponse(url="/dashboard")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
