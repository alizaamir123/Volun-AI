from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...models import Event as EventModel
from ...schemas import Event, EventCreate
from ..deps import get_db

router = APIRouter()


@router.get("/", response_model=List[Event])
def get_events(db: Session = Depends(get_db)):
    events = db.query(EventModel).all()
    return events


@router.post("/", response_model=Event)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = EventModel(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event