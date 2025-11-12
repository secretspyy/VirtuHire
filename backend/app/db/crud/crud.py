# crud.py
from sqlalchemy.orm import Session
import models, schemas, security

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user_in: schemas.UserCreate):
    hashed = security.get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email,
        hashed_password=hashed,
        full_name=user_in.full_name,
        username=user_in.username
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user

def update_user_profile(db: Session, user: models.User, **updates):
    for k, v in updates.items():
        if v is not None and hasattr(user, k):
            setattr(user, k, v)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
