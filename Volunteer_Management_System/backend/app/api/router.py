from fastapi import APIRouter

from .routes import auth, admin, events, organizer, volunteers

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(organizer.router, prefix="/organizer", tags=["organizer"])
api_router.include_router(volunteers.router, prefix="/volunteers", tags=["volunteers"])