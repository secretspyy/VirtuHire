// src/api.js
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function startSession(jobRole, companyName) {
  const res = await fetch(`${API_BASE}/interview/start-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ job_role: jobRole, company_name: companyName }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function uploadAnswer(sessionId, questionIndex, questionText, blob) {
  const form = new FormData();
  form.append("session_id", sessionId);
  form.append("question_index", questionIndex);
  form.append("question_text", questionText || "");
  form.append("file", blob, `answer-${sessionId}-${questionIndex}.webm`);

  // We return the fetch promise so caller can decide to await or not
  return fetch(`${API_BASE}/interview/upload-answer`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      // Note: DO NOT set Content-Type for multipart/form-data, browser sets boundary
    },
    body: form,
  });
}

export async function finalizeSession(sessionId) {
  const res = await fetch(`${API_BASE}/interview/finalize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getSessionStatus(sessionId) {
  const res = await fetch(`${API_BASE}/interview/session/${sessionId}/status`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getSessionAnswers(sessionId) {
  const res = await fetch(`${API_BASE}/interview/session/${sessionId}/answers`, {
    method: "GET",
    headers: {
      ...authHeaders(),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// For n8n webhook (questions generation). Adjust URL to your n8n webhook.
export async function fetchQuestionsFromN8N(jobRole, companyName) {
  const N8N_WEBHOOK = process.env.REACT_APP_N8N_WEBHOOK || "http://localhost:5678/webhook/job-questions";
  const res = await fetch(N8N_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_role: jobRole, company_name: companyName }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // expects { questions: ["..."] }
}

export async function downloadReport(sessionId) {
  const res = await fetch(`${API_BASE}/interview/report/${sessionId}`, {
    method: "GET",
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(await res.text());
  
  // Handle file download
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${sessionId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
