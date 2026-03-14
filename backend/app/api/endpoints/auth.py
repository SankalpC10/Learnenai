"""
Auth API Endpoints
"""
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user, AuthenticatedUser
from app.core.database import get_supabase

router = APIRouter()


@router.get("/me")
async def get_me(user: AuthenticatedUser = Depends(get_current_user)):
    sb = get_supabase()
    profile = sb.table("profiles").select("*").eq("id", user.id).execute()
    return {
        "id": user.id,
        "email": user.email,
        "profile": profile.data[0] if profile.data else None,
    }
