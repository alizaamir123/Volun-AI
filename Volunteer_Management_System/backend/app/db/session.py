from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

from ..core.settings import settings
from ..models import Base

# SQLite engine configuration - connect_args needed for SQLite
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables
Base.metadata.create_all(bind=engine)


def _ensure_sqlite_user_columns() -> None:
    if "sqlite" not in settings.DATABASE_URL:
        return
    insp = inspect(engine)
    if "users" not in insp.get_table_names():
        return
    existing = {c["name"] for c in insp.get_columns("users")}
    with engine.begin() as conn:
        if "resume_path" not in existing:
            conn.execute(text("ALTER TABLE users ADD COLUMN resume_path VARCHAR(500)"))
        if "profile_image_path" not in existing:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_image_path VARCHAR(500)"))
        if "bio" not in existing:
            conn.execute(text("ALTER TABLE users ADD COLUMN bio TEXT"))


_ensure_sqlite_user_columns()


def _ensure_sqlite_events_and_applications() -> None:
    if "sqlite" not in settings.DATABASE_URL:
        return
    insp = inspect(engine)
    tables = insp.get_table_names()
    if "events" in tables:
        cols = {c["name"] for c in insp.get_columns("events")}
        with engine.begin() as conn:
            if "posted_at" not in cols:
                conn.execute(text("ALTER TABLE events ADD COLUMN posted_at DATETIME"))
                conn.execute(text("UPDATE events SET posted_at = CURRENT_TIMESTAMP WHERE posted_at IS NULL"))
            if "lat" not in cols:
                conn.execute(text("ALTER TABLE events ADD COLUMN lat VARCHAR(20)"))
            if "lng" not in cols:
                conn.execute(text("ALTER TABLE events ADD COLUMN lng VARCHAR(20)"))
    
    # Handle event_applications table migrations
    if "event_applications" in tables:
        cols = {c["name"] for c in insp.get_columns("event_applications")}
        with engine.begin() as conn:
            if "status" not in cols:
                conn.execute(text("ALTER TABLE event_applications ADD COLUMN status VARCHAR(50)"))
                conn.execute(text("UPDATE event_applications SET status = 'applied' WHERE status IS NULL"))
            if "updated_at" not in cols:
                conn.execute(text("ALTER TABLE event_applications ADD COLUMN updated_at DATETIME"))
                conn.execute(text("UPDATE event_applications SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL"))
    
    # New table is created by metadata.create_all when models are loaded
    Base.metadata.create_all(bind=engine)


_ensure_sqlite_events_and_applications()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()