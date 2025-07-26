import React, { useState, useRef } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [pauseAnalysis, setPauseAnalysis] = useState(null);
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);

  const startRecording = async () => {
    setIsRecording(true);
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
    analyserRef.current.fftSize = 64;
    source.connect(analyserRef.current);

    visualize();
  };

  const visualize = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;

    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#22c55e";
      ctx.beginPath();

      let sliceWidth = WIDTH / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = (v * HEIGHT) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
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
    audioContextRef.current && audioContextRef.current.close();
  };

  const handleStop = () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(audioBlob);
    setAudioURL(url);
    uploadAudio(audioBlob);
    audioChunksRef.current = [];
  };

  const uploadAudio = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    try {
      const response = await fetch('http://localhost:8000/analyze-audio', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setPauseAnalysis(result.pause_to_speech_analysis || null);
    } catch (err) {
      console.error('Error uploading audio:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 px-6 py-8 rounded-3xl bg-gradient-to-br from-gray-800/60 to-gray-900/70 backdrop-blur-xl shadow-2xl border border-gray-700 text-white">
      <h2 className="text-3xl font-bold mb-8 text-center tracking-tight">
        🎙️ VirtuHire Voice Interview
      </h2>

      <div className="flex justify-center gap-5 mb-6">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`px-6 py-2 rounded-full font-semibold shadow-md transition duration-300
            ${isRecording
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 hover:scale-105'
            }`}
        >
          Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`px-6 py-2 rounded-full font-semibold shadow-md transition duration-300
            ${!isRecording
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 hover:scale-105'
            }`}
        >
          Stop Recording
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={80}
        className={`w-full mb-8 rounded-xl bg-black/80 shadow-lg border border-green-600
          ${isRecording ? 'animate-pulse' : ''}`}
      />

      {audioURL && (
        <div className="mb-10 flex justify-center">
          <div className="w-full max-w-lg rounded-3xl bg-gradient-to-br from-gray-800/60 to-gray-900/70 backdrop-blur-md p-6 border border-gray-700 shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
            <h3 className="text-2xl font-bold mb-5 text-emerald-400 flex items-center gap-3">
              <span className="text-3xl">🎧</span> Playback
            </h3>
            <AudioPlayer
              src={audioURL}
              autoPlay={false}
              className="rounded-xl"
              style={{
                background: '#111827',
                borderRadius: '1rem',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
                color: '#10b981',
              }}
            />
          </div>
        </div>
      )}



      {pauseAnalysis && (
        <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700 backdrop-blur-md shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-center text-green-400">
            📊 Pause-to-Speech Analysis
          </h3>
          <ul className="space-y-2 text-sm text-gray-200">
            <li><span className="font-semibold">Total Duration:</span> {pauseAnalysis.total_duration_ms} ms</li>
            <li><span className="font-semibold">Total Silence:</span> {pauseAnalysis.total_silence_ms} ms</li>
            <li><span className="font-semibold">Total Speech:</span> {pauseAnalysis.total_speech_ms} ms</li>
            <li><span className="font-semibold">Pause-to-Speech Ratio:</span> {pauseAnalysis.pause_to_speech_ratio}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
