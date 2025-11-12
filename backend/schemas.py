from pydantic import BaseModel, EmailStr
from typing import Optional, Any

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    username: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: Optional[str]
    full_name: Optional[str]
    is_active: bool
    profile_pic: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
