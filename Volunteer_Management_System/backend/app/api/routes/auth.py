from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ... import models, schemas
from ...api import deps
from ...core import security
from ...core.settings import settings

router = APIRouter()


@router.post("/access-token", response_model=schemas.LoginResponse)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    if user.role == "organizer" and not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your organizer account is pending approval"
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return schemas.LoginResponse(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        token_type="bearer",
        user=user,
    )


@router.post("/register/volunteer", response_model=schemas.LoginResponse)
def register_volunteer(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new volunteer user.
    """
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = models.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        city=user_in.city,
        province=user_in.province,
        skills=user_in.skills,
        interests=user_in.interests,
        availability=user_in.availability,
        linkedin=user_in.linkedin,
        role="volunteer",
        is_approved=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return schemas.LoginResponse(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        token_type="bearer",
        user=user,
    )


@router.post("/register/organizer", response_model=schemas.LoginResponse)
def register_organizer(
    *,
    db: Session = Depends(deps.get_db),
    full_name: str = Form(...),
    cnic_number: str = Form(...),
    organization_name: str = Form(...),
    official_email: str = Form(...),
    password: str = Form(...),
    phone_number: str | None = Form(None),
    linkedin_profile: str | None = Form(None),
    address: str | None = Form(None),
    city: str | None = Form(None),
    province: str | None = Form(None),
    skills: str | None = Form(None),
    availability: str | None = Form(None),
    cnic_front: UploadFile = File(...),
    cnic_back: UploadFile = File(...),
) -> Any:
    user = db.query(models.User).filter(models.User.email == official_email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = models.User(
        email=official_email,
        hashed_password=security.get_password_hash(password),
        full_name=full_name,
        phone_number=phone_number,
        city=city,
        province=province,
        skills=skills,
        interests=None,
        availability=availability,
        linkedin=linkedin_profile,
        role="organizer",
        is_approved=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return schemas.LoginResponse(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        token_type="bearer",
        user=user,
    )