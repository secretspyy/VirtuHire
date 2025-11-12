from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import os
from database import get_db
import models
from routers.auth import get_current_user, security

router = APIRouter(prefix="/profile", tags=["Profile"])
UPLOAD_DIR = "uploads/profile_pics"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/me")
async def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/update")
async def update_profile(
    full_name: str = Form(...),
    username: str = Form(...),
    email: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    user.full_name = full_name
    user.username = username
    user.email = email
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated", "user": user}

@router.post("/upload-photo")
async def upload_profile_pic(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    file_path = os.path.join(UPLOAD_DIR, f"user_{current_user.id}.png")
    with open(file_path, "wb") as f:
        f.write(await file.read())

    current_user.profile_pic = file_path
    db.commit()
    return {"message": "Profile picture uploaded", "file_path": file_path}
