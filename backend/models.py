from sqlalchemy import Column, Integer, String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255))
    full_name = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    profile_pic = Column(String(255), nullable=True)

    analyses = relationship("AudioAnalysis", back_populates="owner")

class AudioAnalysis(Base):
    __tablename__ = "audio_analyses"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String(255))
    transcription = Column(String(5000))
    pause_to_speech_analysis = Column(JSON)
    filler_word_analysis = Column(JSON)
    stress_analysis = Column(JSON)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="analyses")
