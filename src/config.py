"""Configuration management for database connections."""

import os
import re
from typing import List, Dict
from urllib.parse import quote_plus
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv


class DatabaseConfig(BaseModel):
    """Configuration for a single database connection."""
    
    id: int
    host: str
    port: int = 3306
    name: str
    user: str
    password: str
    
    def get_connection_string(self) -> str:
        """Get SQLAlchemy connection string with URL-encoded credentials."""
        encoded_user = quote_plus(self.user)
        encoded_password = quote_plus(self.password)
        return f"mysql+pymysql://{encoded_user}:{encoded_password}@{self.host}:{self.port}/{self.name}"
    
    def get_display_name(self) -> str:
        """Get display name for this database."""
        return f"{self.name}@{self.host}"


class AppConfig(BaseSettings):
    """Application configuration."""
    
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    output_dir: str = Field(default="output", alias="OUTPUT_DIR")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields like DB_* variables


def load_database_configs() -> List[DatabaseConfig]:
    """
    Load database configurations from environment variables.
    
    Looks for variables in the format:
    DB_{N}_HOST, DB_{N}_PORT, DB_{N}_NAME, DB_{N}_USER, DB_{N}_PASSWORD
    
    Returns:
        List of DatabaseConfig objects
    """
    load_dotenv()
    
    configs: Dict[int, Dict[str, str]] = {}
    pattern = re.compile(r'^DB_(\d+)_(.+)$')
    
    # Parse environment variables
    for key, value in os.environ.items():
        match = pattern.match(key)
        if match:
            db_id = int(match.group(1))
            field_name = match.group(2).lower()
            
            if db_id not in configs:
                configs[db_id] = {}
            
            configs[db_id][field_name] = value
    
    # Convert to DatabaseConfig objects
    database_configs = []
    for db_id in sorted(configs.keys()):
        config_dict = configs[db_id]
        
        # Validate required fields
        required_fields = ['host', 'name', 'user', 'password']
        missing_fields = [f for f in required_fields if f not in config_dict]
        
        if missing_fields:
            print(f"Warning: Database {db_id} is missing required fields: {missing_fields}")
            continue
        
        try:
            db_config = DatabaseConfig(
                id=db_id,
                host=config_dict['host'],
                port=int(config_dict.get('port', 3306)),
                name=config_dict['name'],
                user=config_dict['user'],
                password=config_dict['password']
            )
            database_configs.append(db_config)
        except Exception as e:
            print(f"Error loading database {db_id} configuration: {e}")
    
    return database_configs


def get_app_config() -> AppConfig:
    """Get application configuration."""
    load_dotenv()
    return AppConfig()

