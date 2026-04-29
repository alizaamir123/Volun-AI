import re
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ... import models, schemas
from ...services import resume_match
from ...services.ai_judge import gemini_correct_bio
from ..deps import get_current_user, get_db

router = APIRouter()

UPLOAD_ROOT = Path(__file__).resolve().parent.parent.parent.parent / "uploads" / "resumes"
ALLOWED_RESUME_SUFFIXES = {".pdf", ".doc", ".docx"}


@router.get("/cv-status")
def cv_status(current_user: models.User = Depends(get_current_user)) -> dict:
    """Whether a resume file is stored (required before profile check)."""
    r = current_user.resume_path
    return {
        "has_cv": bool(r),
        "is_pdf": bool(r and str(r).lower().endswith(".pdf")),
    }


@router.post("/upload-cv")
def upload_cv(
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict[str, str]:
    if current_user.role != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can upload a CV",
        )
    name = resume.filename or "resume"
    suffix = Path(name).suffix.lower()
    if suffix not in ALLOWED_RESUME_SUFFIXES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOC, or DOCX files are allowed",
        )
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    safe_stem = "".join(c for c in Path(name).stem if c.isalnum() or c in "._- ")[:80] or "resume"
    dest = UPLOAD_ROOT / f"{current_user.id}_{safe_stem}{suffix}"
    data = resume.file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be 5MB or smaller",
        )
    dest.write_bytes(data)
    current_user.resume_path = str(dest)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"message": "CV uploaded successfully", "path": str(dest)}


@router.get("/my-applications")
def my_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict[str, list[int]]:
    if current_user.role != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can view applications",
        )
    rows = (
        db.query(models.EventApplication.event_id)
        .filter(models.EventApplication.volunteer_id == current_user.id)
        .all()
    )
    return {"event_ids": [r[0] for r in rows]}


@router.post("/applications/{event_id}")
def apply_to_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict[str, str | int]:
    if current_user.role != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can apply to events",
        )
    if not current_user.resume_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload your resume before applying to events.",
        )

    ev = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if ev.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Applications are only open for active events.",
        )

    existing = (
        db.query(models.EventApplication)
        .filter(
            models.EventApplication.volunteer_id == current_user.id,
            models.EventApplication.event_id == event_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this event.",
        )

    db.add(
        models.EventApplication(
            volunteer_id=current_user.id,
            event_id=event_id,
        )
    )
    ev.candidates_applied = (ev.candidates_applied or 0) + 1
    db.add(ev)
    db.commit()
    return {"message": "Applied", "event_id": event_id}


@router.post("/check-profile", response_model=schemas.ProfileCheckResponse)
def check_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> schemas.ProfileCheckResponse:
    if current_user.role != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can use profile check",
        )
    if not current_user.resume_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Upload your CV first.",
        )
    resume_path = Path(current_user.resume_path)
    if not resume_path.exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume file is missing on the server. Please upload a CV again.",
        )
    if resume_path.suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile analysis uses PDF text extraction. Please upload a PDF resume.",
        )

    pdf_text = resume_match.extract_pdf_text(resume_path)
    preview = pdf_text[: resume_match.TEXT_PREVIEW_MAX]
    if len(pdf_text) > resume_match.TEXT_PREVIEW_MAX:
        preview += "\n…"

    combined = resume_match.combined_skill_tokens(pdf_text, current_user.skills)
    from_resume = sorted(resume_match.tokenize(pdf_text))[:80]
    from_profile = [
        p.strip()
        for p in re.split(r"[,;\n]+", current_user.skills or "")
        if len(p.strip()) > 2
    ][:40]

    all_events = db.query(models.Event).all()
    ranked = resume_match.rank_active_events(combined, list(all_events))

    suggested: list[schemas.MatchedEventSuggestion] = []
    for ev, score, keys in ranked:
        suggested.append(
            schemas.MatchedEventSuggestion(
                id=ev.id,
                name=ev.name,
                details=ev.details,
                location=ev.location,
                image=ev.image,
                candidates_required=ev.candidates_required,
                candidates_applied=ev.candidates_applied,
                skillset=ev.skillset,
                date=ev.date,
                organizer_id=ev.organizer_id,
                status=ev.status,
                match_score=score,
                matched_keywords=keys[:25],
            )
        )

    return schemas.ProfileCheckResponse(
        extracted_text_preview=preview,
        skills_from_resume=from_resume,
        skills_from_profile=from_profile,
        combined_skills=sorted(combined)[:120],
        suggested_events=suggested,
    )


@router.get("/my-bio")
def get_my_bio(
    current_user: models.User = Depends(get_current_user),
) -> dict[str, str | None]:
    if current_user.role != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can view bio",
        )
    return {"bio": current_user.bio}


@router.post("/add-bio")
def add_bio(
    bio_request: schemas.BioRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict[str, str]:
    if current_user.role != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers can add bio",
        )
    corrected_bio = gemini_correct_bio(bio_request.bio_text)
    current_user.bio = corrected_bio
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"message": "Bio added successfully", "corrected_bio": corrected_bio}


@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> list[dict]:
    """Get notifications for the current user."""
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> dict:
    """Mark a notification as read."""
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}
