"""Application configuration"""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # Node
    node_api_port: int = 8888
    node_name: str = "node-1"
    
    # Panel connection
    panel_ca_path: str = "/etc/smite-node/ca.crt"
    panel_address: str = "panel.example.com:443"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

