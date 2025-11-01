"""Panel API endpoints"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, Response
from pathlib import Path
from app.config import settings

router = APIRouter()


@router.get("/ca")
async def get_ca_cert(download: bool = False):
    """Get CA certificate for node enrollment"""
    cert_path = Path(settings.hysteria2_cert_path)
    if not cert_path.exists():
        raise HTTPException(status_code=404, detail="CA certificate not found")
    
    # If download parameter is true, return as file download
    if download:
        return FileResponse(
            cert_path,
            media_type="application/x-pem-file",
            filename="ca.crt",
            headers={"Content-Disposition": "attachment; filename=ca.crt"}
        )
    
    # Otherwise return as text (for display/copy in UI)
    cert_content = cert_path.read_text()
    return Response(content=cert_content, media_type="text/plain")


@router.get("/health")
async def health():
    """Health check"""
    return {"status": "ok"}

