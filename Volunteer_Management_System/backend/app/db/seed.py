from .session import SessionLocal
from ..models import User
from ..core import security


def create_default_admin() -> None:
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@gmail.com").first()
        if admin is None:
            admin = User(
                email="admin@gmail.com",
                hashed_password=security.get_password_hash("aliza123"),
                full_name="Admin User",
                phone_number=None,
                city=None,
                province=None,
                skills=None,
                interests=None,
                availability=None,
                linkedin=None,
                is_active=True,
                is_superuser=True,
                role="admin",
                is_approved=True,
            )
            db.add(admin)
            print("Default admin user created: admin@gmail.com")
        else:
            admin.hashed_password = security.get_password_hash("aliza123")
            print("Default admin password updated")
        db.commit()
        db.refresh(admin)
    finally:
        db.close()
