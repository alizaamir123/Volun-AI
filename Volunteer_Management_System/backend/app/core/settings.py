from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Volunteer Management System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database - SQLite
    DATABASE_URL: str = "sqlite:///./volunteer_management.db"

    GOOGLE_API_KEY: str | None = None
    GOOGLE_MODEL: str = "gemini-2.0-flash"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ]

    class Config:
        env_file = ".env"


settings = Settings()