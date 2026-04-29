from datetime import datetime

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None


class UserBase(BaseModel):
    email: str
    full_name: str
    phone_number: str | None = None
    city: str | None = None
    province: str | None = None
    skills: str | None = None
    interests: str | None = None
    availability: str | None = None
    linkedin: str | None = None
    is_active: bool = True
    is_superuser: bool = False
    role: str = "volunteer"
    is_approved: bool = True
    bio: str | None = None


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User


class AdminOverview(BaseModel):
    totalEvents: int
    totalActiveEvents: int
    totalPendingEvents: int
    totalCompletedEvents: int
    totalApplications: int
    totalVolunteers: int
    totalOrganizers: int
    pendingApprovals: int


class EventBase(BaseModel):
    name: str
    details: str
    location: str
    lat: str | None = None
    lng: str | None = None
    image: str
    candidates_required: int
    candidates_applied: int = 0
    skillset: str
    date: str
    organizer_id: int
    status: str = "active"


class EventCreate(EventBase):
    pass


class Event(EventBase):
    id: int
    posted_at: datetime | None = None

    class Config:
        from_attributes = True


class OrganizerApplicationRow(BaseModel):
    event_id: int
    event_name: str
    event_date: str
    posted_at: datetime | None
    volunteers_applied: int


class OrganizerApplicationSummary(BaseModel):
    events: list[OrganizerApplicationRow]


class OrganizerMyEvent(BaseModel):
    id: int
    name: str
    details: str
    location: str
    image: str
    candidates_required: int
    candidates_applied: int
    skillset: str
    date: str
    status: str
    posted_at: datetime | None = None

    class Config:
        from_attributes = True


class OrganizerMyEventsResponse(BaseModel):
    events: list[OrganizerMyEvent]


class ApplicantStatRow(BaseModel):
    volunteer_id: int
    full_name: str
    email: str
    phone_number: str | None
    city: str | None
    province: str | None
    skills: str | None
    resume_path: str | None
    profile_image_path: str | None
    bio: str | None
    linkedin: str | None
    skill_match_score: int  # 1–9
    application_status: str
    applied_at: str | None


class OrganizerEventApplicantStats(BaseModel):
    event_id: int
    event_name: str
    event_skillset: str
    applicants: list[ApplicantStatRow]


class MatchedEventSuggestion(BaseModel):
    id: int
    name: str
    details: str
    location: str
    image: str
    candidates_required: int
    candidates_applied: int
    skillset: str
    date: str
    organizer_id: int | None = None
    status: str
    match_score: float
    matched_keywords: list[str]

    class Config:
        from_attributes = True


class ProfileCheckResponse(BaseModel):
    extracted_text_preview: str
    skills_from_resume: list[str]
    skills_from_profile: list[str]
    combined_skills: list[str]
    suggested_events: list[MatchedEventSuggestion]


class BioRequest(BaseModel):
    bio_text: str


class AdminAIEvaluation(BaseModel):
    score: int
    recommendation: str
    summary: str
    method: str
    checks: dict = {}