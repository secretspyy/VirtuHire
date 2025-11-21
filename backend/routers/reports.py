# backend/routers/reports.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from routers.auth import get_current_user
import models
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

router = APIRouter(prefix="/interview", tags=["Interview Reports"])

PDF_DIR = "reports"
os.makedirs(PDF_DIR, exist_ok=True)

@router.get("/report/{session_id}")
def download_report(
    session_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(models.InterviewSession).filter_by(
        id=session_id, user_id=current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    file_path = os.path.join(PDF_DIR, f"report_{session_id}.pdf")

    # PDF Generate
    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 50, "VirtuHire - Interview Report")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 100, f"Session ID: {session.id}")
    c.drawString(50, height - 120, f"Job Role: {session.job_role}")
    c.drawString(50, height - 140, f"Company: {session.company_name}")
    c.drawString(50, height - 160, f"Total Questions: {session.total_questions}")
    
    c.drawString(50, height - 200, "=== Final Metrics ===")
    c.drawString(50, height - 220, f"Pause Ratio: {session.final_pause_ratio}")
    c.drawString(50, height - 240, f"Filler Rate: {session.final_filler_rate}")
    c.drawString(50, height - 260, f"Stress Score: {session.final_stress_score}")

    c.showPage()
    c.save()

    return FileResponse(
        file_path,
        filename=f"VirtuHire_Report_{session_id}.pdf",
        media_type="application/pdf"
    )
