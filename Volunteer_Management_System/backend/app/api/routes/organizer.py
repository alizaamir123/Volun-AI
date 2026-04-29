from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ... import models, schemas
from ...services import resume_match
from ..deps import get_current_user, get_db

router = APIRouter()


def _require_approved_organizer(current_user: models.User) -> None:
    if current_user.role != "organizer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organizers can access this resource",
        )
    if not current_user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your organizer account is not approved yet",
        )


@router.get("/application-summary", response_model=schemas.OrganizerApplicationSummary)
def application_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.OrganizerApplicationSummary:
    _require_approved_organizer(current_user)

    rows = (
        db.query(
            models.Event.id,
            models.Event.name,
            models.Event.date,
            models.Event.posted_at,
            func.count(models.EventApplication.id).label("cnt"),
        )
        .join(models.EventApplication, models.EventApplication.event_id == models.Event.id)
        .filter(models.Event.organizer_id == current_user.id)
        .group_by(
            models.Event.id,
            models.Event.name,
            models.Event.date,
            models.Event.posted_at,
        )
        .having(func.count(models.EventApplication.id) > 0)
        .all()
    )
    events = [
        schemas.OrganizerApplicationRow(
            event_id=r.id,
            event_name=r.name,
            event_date=r.date,
            posted_at=r.posted_at,
            volunteers_applied=int(r.cnt),
        )
        for r in rows
    ]
    return schemas.OrganizerApplicationSummary(events=events)


@router.get("/my-events", response_model=schemas.OrganizerMyEventsResponse)
def my_approved_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.OrganizerMyEventsResponse:
    """Events you created that the admin has approved (status = active)."""
    _require_approved_organizer(current_user)
    rows = (
        db.query(models.Event)
        .filter(
            models.Event.organizer_id == current_user.id,
            models.Event.status == "active",
        )
        .order_by(models.Event.posted_at.desc().nullslast(), models.Event.id.desc())
        .all()
    )
    return schemas.OrganizerMyEventsResponse(
        events=[schemas.OrganizerMyEvent.model_validate(ev) for ev in rows]
    )


@router.get("/dashboard-stats", response_model=dict)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict:
    """Dashboard statistics for the organizer including all events."""
    _require_approved_organizer(current_user)

    # Get all events for this organizer
    all_events = db.query(models.Event).filter(models.Event.organizer_id == current_user.id).all()

    # Calculate statistics
    total_events = len(all_events)
    active_events = len([e for e in all_events if e.status == "active"])
    pending_events = len([e for e in all_events if e.status == "pending"])

    # Get total applications across all events
    total_applications = (
        db.query(func.count(models.EventApplication.id))
        .join(models.Event, models.EventApplication.event_id == models.Event.id)
        .filter(models.Event.organizer_id == current_user.id)
        .scalar()
    ) or 0

    return {
        "total_events": total_events,
        "active_events": active_events,
        "pending_events": pending_events,
        "total_applications": total_applications,
    }


@router.get(
    "/events/{event_id}/applicant-stats",
    response_model=schemas.OrganizerEventApplicantStats,
)
def event_applicant_stats(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.OrganizerEventApplicantStats:
    """Applicants for an approved event you own, with skill fit 1–9 vs event skillset."""
    _require_approved_organizer(current_user)
    ev = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not ev or ev.organizer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if ev.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stats are only available for admin-approved (active) events.",
        )

    rows = (
        db.query(models.EventApplication, models.User)
        .join(models.User, models.User.id == models.EventApplication.volunteer_id)
        .filter(models.EventApplication.event_id == event_id)
        .order_by(models.EventApplication.created_at.asc())
        .all()
    )
    applicants: list[schemas.ApplicantStatRow] = []
    for app, volunteer in rows:
        if volunteer.role != "volunteer":
            continue
        score = resume_match.skill_match_score_1_9(volunteer, ev)
        applicants.append(
            schemas.ApplicantStatRow(
                volunteer_id=volunteer.id,
                full_name=volunteer.full_name,
                email=volunteer.email,
                phone_number=volunteer.phone_number,
                city=volunteer.city,
                province=volunteer.province,
                skills=volunteer.skills,
                resume_path=volunteer.resume_path,
                profile_image_path=volunteer.profile_image_path,
                bio=volunteer.bio,
                linkedin=volunteer.linkedin,
                skill_match_score=score,
                application_status=app.status,
                applied_at=app.created_at.isoformat() if app.created_at else None,
            )
        )
    return schemas.OrganizerEventApplicantStats(
        event_id=ev.id,
        event_name=ev.name,
        event_skillset=ev.skillset,
        applicants=applicants,
    )


@router.post("/events/{event_id}/applicants/{volunteer_id}/select")
def select_applicant(
    event_id: int,
    volunteer_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict:
    """Select/shortlist an applicant for an event."""
    _require_approved_organizer(current_user)
    
    # Verify event ownership
    ev = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not ev or ev.organizer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    
    # Find the application
    application = db.query(models.EventApplication).filter(
        models.EventApplication.event_id == event_id,
        models.EventApplication.volunteer_id == volunteer_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    
    # Update application status
    application.status = "shortlisted"
    
    # Create notification for the volunteer
    notification = models.Notification(
        user_id=volunteer_id,
        title="Application Shortlisted",
        message=f"Congratulations! Your application for '{ev.name}' has been shortlisted by the organizer.",
        type="success"
    )
    db.add(notification)
    
    db.commit()
    
    return {"message": "Applicant shortlisted successfully"}
