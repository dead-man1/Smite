"""Database setup and session management"""
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

Base = declarative_base()

# Database URL
if settings.db_type == "sqlite":
    db_url = f"sqlite+aiosqlite:///{settings.db_path}"
elif settings.db_type == "mysql":
    db_url = f"mysql+aiomysql://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}"
else:
    raise ValueError(f"Unsupported DB type: {settings.db_type}")

engine = create_async_engine(db_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """Initialize database tables"""
    # Create data directory for SQLite
    if settings.db_type == "sqlite":
        os.makedirs(os.path.dirname(settings.db_path), exist_ok=True)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Database session dependency"""
    async with AsyncSessionLocal() as session:
        yield session

