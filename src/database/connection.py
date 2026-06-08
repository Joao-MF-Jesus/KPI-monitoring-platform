from pathlib import Path
from urllib.parse import quote_plus
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DB_DRIVER = os.getenv("DB_DRIVER", "sqlite").lower()

if DB_DRIVER == "postgresql":
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        DB_USER = os.getenv("DB_USER")
        DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD", ""))
        DB_HOST = os.getenv("DB_HOST")
        DB_PORT = os.getenv("DB_PORT")
        DB_NAME = os.getenv("DB_NAME")

        DATABASE_URL = (
            f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}"
            f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )
else:
    ROOT_DIR = Path(__file__).resolve().parents[2]
    DATABASE_URL = f"sqlite:///{ROOT_DIR / 'kpi_monitoring.db'}"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
