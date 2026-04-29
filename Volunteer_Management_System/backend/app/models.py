from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    full_name = Column(String(255))
    phone_number = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    province = Column(String(100), nullable=True)
    skills = Column(Text, nullable=True)
    interests = Column(Text, nullable=True)
    availability = Column(Text, nullable=True)
    linkedin = Column(String(500), nullable=True)
    resume_path = Column(String(500), nullable=True)
    profile_image_path = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String(50), default="volunteer")  # volunteer, organizer, admin
    is_approved = Column(Boolean, default=True)  # True for volunteers/admins, False for pending organizers


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    details = Column(Text)
    location = Column(String(255))
    lat = Column(String(20), nullable=True)  # Latitude coordinate
    lng = Column(String(20), nullable=True)  # Longitude coordinate
    image = Column(String(500))  # URL to image
    candidates_required = Column(Integer)
    candidates_applied = Column(Integer, default=0)
    skillset = Column(String(255))
    date = Column(String(50))  # e.g., "2024-12-01"
    organizer_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String(50), default="active")  # active, completed, cancelled

    posted_at = Column(DateTime, default=datetime.utcnow, nullable=True)

    organizer = relationship("User", back_populates="events")
    applications = relationship("EventApplication", back_populates="event")


class EventApplication(Base):
    __tablename__ = "event_applications"
    __table_args__ = (
        UniqueConstraint("volunteer_id", "event_id", name="uq_event_application_volunteer_event"),
    )

    id = Column(Integer, primary_key=True, index=True)
    volunteer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    status = Column(String(50), default="applied")  # applied, shortlisted, selected, rejected
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    volunteer = relationship("User", back_populates="event_applications")
    event = relationship("Event", back_populates="applications")


# Add back_populates to User
User.events = relationship("Event", back_populates="organizer")
User.event_applications = relationship("EventApplication", back_populates="volunteer")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # info, success, warning, error
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")


# Add back_populates to User
User.notifications = relationship("Notification", back_populates="user")