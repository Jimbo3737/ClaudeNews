from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://claudenews:claudenews@localhost:5432/claudenews"
    redis_url: str = "redis://localhost:6379/0"

    anthropic_api_key: str = ""

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/auth/google/callback"
    gmail_account: str = ""

    storage_bucket: str = ""
    storage_endpoint: str = ""
    storage_key_id: str = ""
    storage_secret: str = ""

    cors_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
