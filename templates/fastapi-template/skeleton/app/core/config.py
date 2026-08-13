from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/${{ values.moduleName }}"
    cors_origins: list[str] = ["http://localhost:3000"]
    secret_key: str = "change-me-in-production"
    debug: bool = False


settings = Settings()
