"""Hysteria2 server for panel-node communication"""
import asyncio
import ssl
from pathlib import Path
from typing import Optional
from app.config import settings


class Hysteria2Server:
    """Hysteria2 server with mTLS for secure panel-node communication"""
    
    def __init__(self):
        self.port = settings.hysteria2_port
        self.cert_path = settings.hysteria2_cert_path
        self.key_path = settings.hysteria2_key_path
        self.server: Optional[asyncio.Server] = None
        self.clients = {}
    
    async def start(self):
        """Start Hysteria2 server"""
        # Ensure certs exist
        cert_path = Path(self.cert_path)
        key_path = Path(self.key_path)
        
        if not cert_path.exists() or not key_path.exists():
            # Generate self-signed cert for CA
            await self._generate_certs()
        
        # Start server (simplified - actual Hysteria2 integration would use their library)
        print(f"Hysteria2 server starting on port {self.port}")
        # TODO: Integrate with actual Hysteria2 library
    
    async def stop(self):
        """Stop Hysteria2 server"""
        if self.server:
            self.server.close()
            await self.server.wait_closed()
    
    async def _generate_certs(self):
        """Generate CA certificate and key"""
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa
        from datetime import datetime, timedelta
        
        # Create directories
        Path(self.cert_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Generate private key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        
        # Create certificate
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "CA"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, "SF"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Smite Panel"),
            x509.NameAttribute(NameOID.COMMON_NAME, "Smite CA"),
        ])
        
        cert = x509.CertificateBuilder().subject_name(
            subject
        ).issuer_name(
            issuer
        ).public_key(
            private_key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.utcnow()
        ).not_valid_after(
            datetime.utcnow() + timedelta(days=365)
        ).add_extension(
            x509.BasicConstraints(ca=True, path_length=None),
            critical=True,
        ).sign(private_key, hashes.SHA256())
        
        # Write certificate
        with open(self.cert_path, "wb") as f:
            f.write(cert.public_bytes(serialization.Encoding.PEM))
        
        # Write private key
        with open(self.key_path, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        print(f"Generated CA certificate at {self.cert_path}")

