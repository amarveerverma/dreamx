from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, SecretStr

class Settings(BaseSettings):
    environment: str = Field(alias="ENVIRONMENT", default="development")
    log_level: str = Field(alias="LOG_LEVEL", default="INFO")
    port: int = Field(alias="PORT", default=8000)
    
    # Supabase
    supabase_url: str = Field(alias="SUPABASE_URL")
    supabase_service_role_key: SecretStr = Field(alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_jwt_secret: SecretStr = Field(alias="SUPABASE_JWT_SECRET")
    database_url: SecretStr = Field(alias="DATABASE_URL")
    
    # Razorpay MVP
    razorpay_key_id: str = Field(alias="RAZORPAY_KEY_ID")
    razorpay_key_secret: SecretStr = Field(alias="RAZORPAY_KEY_SECRET")
    razorpay_webhook_secret: SecretStr = Field(alias="RAZORPAY_WEBHOOK_SECRET")
    
    # AI (Gemini MVP fallback mapped to OPENAI per env or vice versa. The env has GEMINI_API_KEY now.)
    gemini_api_key: SecretStr = Field(alias="GEMINI_API_KEY", default=SecretStr(""))
    gemini_default_model: str = Field(alias="GEMINI_DEFAULT_MODEL", default="gemini-1.5-pro-latest")
    
    # Resend
    resend_api_key: SecretStr = Field(alias="RESEND_API_KEY")
    resend_from_email: str = Field(alias="RESEND_FROM_EMAIL")
    
    # Sentry
    sentry_dsn: str = Field(alias="SENTRY_DSN")
    
    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
