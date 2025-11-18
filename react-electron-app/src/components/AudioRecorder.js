// src/components/AudioRecorder.js

import React, { useState, useRef } from "react";
import AudioPlayer from "react-h5-audio-player";
import { useNavigate } from "react-router-dom";
import "react-h5-audio-player/lib/styles.css";

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [pauseAnalysis, setPauseAnalysis] = useState(null);
  const [fillerAnalysis, setFillerAnalysis] = useState(null);
  const [stressAnalysis, setStressAnalysis] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jobRole, setJobRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [started, setStarted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 🔹 Fetch interview questions from n8n
  const fetchQuestions = async () => {
    if (!jobRole || !companyName) {
      alert("Please enter both Job Role and Company Name");
      return;
    }
    setLoadingQuestions(true);

    try {
      const webhookUrl = "http://localhost:5678/webhook-test/job-questions";

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_role: jobRole.trim(),
          company_name: companyName.trim(),
        }),
      });

      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setStarted(true);
      } else {
        alert("No questions received. Check n8n response format.");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      alert("Failed to connect to n8n webhook");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // 🎙️ Recording Feature
  const startRecording = async () => {
    setIsRecording(true);
    setAnalysisDone(false);
    setAudioURL("");
    setPauseAnalysis(null);
    setFillerAnalysis(null);
    setStressAnalysis(null);
    setTranscription("");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = handleStop;
    mediaRecorderRef.current.start();

    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;
    source.connect(analyserRef.current);

    drawWaveform();
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.fftSize);
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#10B981";
      ctx.beginPath();

      let sliceWidth = WIDTH / analyser.fftSize;
      let x = 0;

      for (let i = 0; i < analyser.fftSize; i++) {
        let v = dataArray[i] / 128.0;
        let y = (v * HEIGHT) / 2;

        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(WIDTH, HEIGHT / 2);
      ctx.stroke();
    };
    draw();
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
    cancelAnimationFrame(animationIdRef.current);
    audioContextRef.current?.close();
  };

  const handleStop = () => {
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    setAudioURL(URL.createObjectURL(blob));
    audioChunksRef.current = [];
    sendAudioForAnalysis(blob);
  };

  // 🔹 Send audio to FastAPI backend
  const sendAudioForAnalysis = async (blob) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login expired. Please login again.");

    const formData = new FormData();
    formData.append("file", blob, "response.webm");

    try {
      const response = await fetch("http://localhost:8000/analyze-audio", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      setPauseAnalysis(result.pause_to_speech_analysis);
      setFillerAnalysis(result.filler_word_analysis);
      setStressAnalysis(result.stress_analysis);
      setTranscription(result.transcription);
      setAnalysisDone(true);

    } catch (error) {
      console.error("Analysis error:", error);
      alert("Audio upload failed.");
    }
  };

  // 🔹 Move to next question
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);

      // reset states
      setAudioURL("");
      setPauseAnalysis(null);
      setFillerAnalysis(null);
      setStressAnalysis(null);
      setTranscription("");
      setAnalysisDone(false);
    } else {
      alert("🎉 Interview Completed!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-10">
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-10 px-6">
        <h1 className="text-3xl font-bold text-emerald-400">VirtuHire Interview</h1>
        <button onClick={handleLogout} className="bg-red-600 px-6 py-2 rounded-lg">Logout</button>
      </div>

      {/* Setup screen */}
      {!started && (
        <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-2xl text-center border border-gray-700 shadow-lg">
          <h2 className="text-2xl font-bold text-emerald-400 mb-6">Interview Details</h2>

          <input
            className="w-full bg-gray-900 text-white p-3 rounded mb-4 border border-gray-700"
            placeholder="Job role (e.g. Data Scientist)"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
          />

          <input
            className="w-full bg-gray-900 text-white p-3 rounded mb-6 border border-gray-700"
            placeholder="Company name (e.g. Google)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <button
            onClick={fetchQuestions}
            disabled={loadingQuestions}
            className="bg-emerald-600 w-full py-3 rounded font-bold hover:bg-emerald-700"
          >
            {loadingQuestions ? "Please wait..." : "Start Interview"}
          </button>
        </div>
      )}

      {/* Interview Screen */}
      {started && (
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">

          <h2 className="text-xl font-bold mb-4 text-center text-emerald-400">
            Question {currentIndex + 1} / {questions.length}
          </h2>
          <p className="text-lg text-center text-gray-100 italic mb-6">{questions[currentIndex]}</p>

          {/* Recording controls */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className="bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-40"
            >
              Start Recording
            </button>

            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="bg-red-600 px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-40"
            >
              Stop Recording
            </button>
          </div>

          {/* Waveform */}
          {isRecording && (
            <canvas ref={canvasRef} width={600} height={100} className="w-full bg-black rounded-md border border-emerald-500 mb-6" />
          )}

          {/* Playback */}
          {audioURL && (
            <div className="mb-8">
              <AudioPlayer src={audioURL} />
            </div>
          )}

          {/* Analysis Results */}
          {analysisDone && (
            <>
              {pauseAnalysis && (
                <div className="mb-4 p-4 bg-gray-900 rounded border border-gray-700">
                  <h3 className="font-bold text-emerald-400 mb-2">Pause to Speech Analysis</h3>
                  <p>Total Duration: {pauseAnalysis.total_duration_ms} ms</p>
                  <p>Total Silence: {pauseAnalysis.total_silence_ms} ms</p>
                  <p>Total Speech: {pauseAnalysis.total_speech_ms} ms</p>
                  <p>Ratio: {pauseAnalysis.pause_to_speech_ratio}</p>
                </div>
              )}

              {fillerAnalysis && (
                <div className="mb-4 p-4 bg-gray-900 rounded border border-gray-700">
                  <h3 className="font-bold text-yellow-400 mb-2">Filler Words</h3>
                  {fillerAnalysis.filler_words?.length ? (
                    <ul>
                      {fillerAnalysis.filler_words.map((w, i) => <li key={i}>• {w}</li>)}
                    </ul>
                  ) : <p>No filler words detected.</p>}
                </div>
              )}

              {stressAnalysis && (
                <div className="mb-4 p-4 bg-gray-900 rounded border border-gray-700">
                  <h3 className="font-bold text-red-400 mb-2">Stress Analysis</h3>
                  <p>Pitch Variance: {stressAnalysis.pitch_variance}</p>
                  <p>Energy Variance: {stressAnalysis.energy_variance}</p>
                  <p>Stress Level: {stressAnalysis.stress_level}</p>
                </div>
              )}

              {transcription && (
                <div className="p-4 bg-gray-900 rounded border border-gray-700">
                  <h3 className="font-bold text-blue-400 mb-2">Transcription</h3>
                  <p>{transcription}</p>
                </div>
              )}
            </>
          )}

          {/* Next button */}
          <div className="text-center mt-6">
            <button
              disabled={!analysisDone}
              onClick={nextQuestion}
              className="bg-blue-600 px-8 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40"
            >
              Next Question →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
