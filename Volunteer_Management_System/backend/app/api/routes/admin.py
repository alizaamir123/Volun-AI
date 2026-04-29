from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ...api import deps
from ...schemas import AdminAIEvaluation, AdminOverview, Event, User
from ...services import ai_judge
from ...models import User as UserModel, Event as EventModel, EventApplication
from ..deps import get_current_admin_user

router = APIRouter()


@router.get("/analytics/overview", response_model=AdminOverview)
def get_admin_overview(
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
) -> AdminOverview:
    total_volunteers = db.query(UserModel).filter(UserModel.role == "volunteer", UserModel.is_active == True).count()
    total_organizers = db.query(UserModel).filter(
        UserModel.role == "organizer", UserModel.is_approved == True
    ).count()
    pending_approvals = db.query(UserModel).filter(
        UserModel.role == "organizer", UserModel.is_approved == False
    ).count()
    total_events = db.query(EventModel).count()
    total_active_events = db.query(EventModel).filter(EventModel.status == "active").count()
    total_pending_events = db.query(EventModel).filter(EventModel.status == "pending").count()
    total_completed_events = db.query(EventModel).filter(EventModel.status == "completed").count()
    total_applications = db.query(EventApplication).count()

    return AdminOverview(
        totalEvents=total_events,
        totalActiveEvents=total_active_events,
        totalPendingEvents=total_pending_events,
        totalCompletedEvents=total_completed_events,
        totalApplications=total_applications,
        totalVolunteers=total_volunteers,
        totalOrganizers=total_organizers,
        pendingApprovals=pending_approvals,
    )


@router.get("/analytics/detailed")
def get_detailed_analytics(
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
):
    """Get detailed analytics data for Excel-style reporting."""
    from datetime import datetime, timedelta
    import calendar

    # Organizers statistics
    total_organizers = db.query(UserModel).filter(UserModel.role == "organizer").count()
    approved_organizers = db.query(UserModel).filter(
        UserModel.role == "organizer", UserModel.is_approved == True, UserModel.is_active == True
    ).count()
    pending_organizers = db.query(UserModel).filter(
        UserModel.role == "organizer", UserModel.is_approved == False, UserModel.is_active == True
    ).count()
    rejected_organizers = db.query(UserModel).filter(
        UserModel.role == "organizer", UserModel.is_approved == False, UserModel.is_active == False
    ).count()

    # Events statistics
    total_events = db.query(EventModel).count()
    approved_events = db.query(EventModel).filter(EventModel.status == "active").count()
    rejected_events = db.query(EventModel).filter(EventModel.status == "rejected").count()
    pending_events = db.query(EventModel).filter(EventModel.status == "pending").count()
    completed_events = db.query(EventModel).filter(EventModel.status == "completed").count()

    # Active volunteers with details
    active_volunteers = db.query(UserModel).filter(
        UserModel.role == "volunteer", UserModel.is_active == True
    ).all()

    total_volunteers = len(active_volunteers)

    volunteer_data = []
    for volunteer in active_volunteers:
        volunteer_data.append({
            "id": volunteer.id,
            "name": volunteer.full_name,
            "email": volunteer.email,
            "phone": volunteer.phone_number,
            "city": volunteer.city,
            "province": volunteer.province,
            "skills": volunteer.skills,
            "interests": volunteer.interests,
            "availability": volunteer.availability,
            "linkedin": volunteer.linkedin,
        })

    # Monthly stats for the last 6 months
    monthly_stats = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        month_start = (now - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
        
        month_name = calendar.month_abbr[month_start.month]
        
        # Events created in this month
        events_created = db.query(EventModel).filter(
            EventModel.posted_at >= month_start,
            EventModel.posted_at <= month_end
        ).count()
        
        # Applications in this month
        applications_count = db.query(EventApplication).filter(
            EventApplication.created_at >= month_start,
            EventApplication.created_at <= month_end
        ).count()
        
        # For organizers and volunteers, use cumulative or dummy data since no created_at
        # Use total counts as approximation
        monthly_stats.append({
            "name": month_name,
            "events": events_created,
            "organizers": approved_organizers,  # cumulative
            "volunteers": total_volunteers,  # cumulative
            "applications": applications_count
        })

    # Organizer stats breakdown
    organizer_stats = [
        {"name": "Approved", "value": approved_organizers, "color": "#4caf50"},
        {"name": "Pending", "value": pending_organizers, "color": "#ff9800"},
        {"name": "Rejected", "value": rejected_organizers, "color": "#f44336"}
    ]

    # Top organizers by number of events
    top_organizers_query = db.query(
        UserModel.full_name,
        UserModel.email,
        func.count(EventModel.id).label("event_count")
    ).join(EventModel, UserModel.id == EventModel.organizer_id).filter(
        UserModel.role == "organizer",
        UserModel.is_approved == True
    ).group_by(UserModel.id).order_by(func.count(EventModel.id).desc()).limit(5).all()

    top_organizers = [
        {"name": org.full_name, "email": org.email, "events": org.event_count}
        for org in top_organizers_query
    ]

    return {
        "organizers": {
            "total": total_organizers,
            "approved": approved_organizers,
            "pending": pending_organizers,
            "rejected": rejected_organizers,
        },
        "events": {
            "total": total_events,
            "approved": approved_events,
            "rejected": rejected_events,
            "pending": pending_events,
            "completed": completed_events,
        },
        "volunteers": volunteer_data,
        "monthlyStats": monthly_stats,
        "organizerStats": organizer_stats,
        "topOrganizers": top_organizers,
    }


@router.get("/pending-organizers", response_model=list[User])
def get_pending_organizers(
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
) -> list[User]:
    return db.query(UserModel).filter(
        UserModel.role == "organizer", 
        UserModel.is_approved == False,
        UserModel.is_active == True,
    ).all()


@router.get("/organizers", response_model=list[User])
def get_all_organizers(
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
) -> list[User]:
    return db.query(UserModel).filter(UserModel.role == "organizer").all()


@router.post("/approve-organizer/{user_id}")
def approve_organizer(
    user_id: int,
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
):
    user = db.query(UserModel).filter(UserModel.id == user_id, UserModel.role == "organizer").first()
    if not user:
        raise HTTPException(status_code=404, detail="Organizer not found")
    
    # Run AI evaluation
    ai_result = ai_judge.evaluate_organizer(user)
    
    # Only approve if AI score is 7 or higher
    if ai_result["score"] < 7:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"AI verification failed: Score {ai_result['score']}/10 - {ai_result['summary']}"
        )
    
    user.is_approved = True
    db.commit()
    return {"message": "Organizer approved", "ai_score": ai_result["score"]}


@router.post("/reject-organizer/{user_id}")
def reject_organizer(
    user_id: int,
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
):
    user = db.query(UserModel).filter(UserModel.id == user_id, UserModel.role == "organizer").first()
    if not user:
        raise HTTPException(status_code=404, detail="Organizer not found")
    user.is_active = False
    user.is_approved = False
    db.commit()
    return {"message": "Organizer rejected"}


@router.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
):
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Remove any applications before deleting the event to avoid referential integrity errors.
    db.query(EventApplication).filter(EventApplication.event_id == event_id).delete(synchronize_session=False)
    db.delete(event)
    db.commit()
    return {"message": "Event deleted"}


@router.post("/events/{event_id}/approve")
def approve_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
):
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    organizer = db.query(UserModel).filter(UserModel.id == event.organizer_id).first()
    if not organizer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No organizer linked to this event",
        )

    ai_result = ai_judge.evaluate_event(event, organizer)
    if ai_result["score"] < 7:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"AI verification failed: Score {ai_result['score']}/10 - {ai_result['summary']}",
        )

    event.status = "active"
    db.commit()
    return {
        "message": "Event approved",
        "ai_score": ai_result["score"],
        "ai_summary": ai_result["summary"],
        "ai_recommendation": ai_result["recommendation"],
    }


@router.get("/events/pending", response_model=List[Event])
def get_pending_events(
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
):
    return db.query(EventModel).filter(EventModel.status == "pending").all()


@router.post("/events/{event_id}/toggle-status")
def toggle_event_status(
    event_id: int,
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
):
    event = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.status = "inactive" if event.status == "active" else "active"
    db.commit()
    return {"message": f"Event status changed to {event.status}"}


@router.post("/ai-evaluate/organizer/{user_id}", response_model=AdminAIEvaluation)
def ai_evaluate_organizer(
    user_id: int,
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
) -> AdminAIEvaluation:
    user = db.query(UserModel).filter(UserModel.id == user_id, UserModel.role == "organizer").first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organizer not found")
    data = ai_judge.evaluate_organizer(user)
    return AdminAIEvaluation(**data)


@router.post("/ai-evaluate/event/{event_id}", response_model=AdminAIEvaluation)
def ai_evaluate_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    _admin: UserModel = Depends(get_current_admin_user),
) -> AdminAIEvaluation:
    ev = db.query(EventModel).filter(EventModel.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    org = db.query(UserModel).filter(UserModel.id == ev.organizer_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No organizer linked to this event",
        )
    data = ai_judge.evaluate_event(ev, org)
    return AdminAIEvaluation(**data)
