"""Panel API endpoints"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, Response
from pathlib import Path
from app.config import settings

router = APIRouter()


@router.get("/ca")
async def get_ca_cert():
    """Get CA certificate for node enrollment"""
    cert_path = Path(settings.hysteria2_cert_path)
    if not cert_path.exists():
        raise HTTPException(status_code=404, detail="CA certificate not found")
    
    return FileResponse(
        cert_path,
        media_type="application/x-pem-file",
        filename="ca.crt",
        headers={"Content-Disposition": "attachment; filename=ca.crt"}
    )


@router.get("/health")
async def health():
    """Health check"""
    return {"status": "ok"}

