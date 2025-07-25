// src/components/AudioRecorder.js
import React, { useState, useRef } from 'react';

function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [pauseAnalysis, setPauseAnalysis] = useState(null);


  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };
    mediaRecorderRef.current.onstop = handleStop;
    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current.stop();
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
      console.log('Analysis Result:', result);

      setPauseAnalysis(result.pause_to_speech_analysis || null);
    } catch (err) {
      console.error('Error uploading audio:', err);
    }
  };


  return (
    <div>
      <h2>Record Your Answer</h2>
      <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
      <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>

      {audioURL && (
        <div>
          <h3>Playback</h3>
          <audio src={audioURL} controls />
        </div>
      )}

      {pauseAnalysis && (
        <div>
          <h3>Pause-to-Speech Analysis</h3>
          <ul>
            <li><strong>Total Duration:</strong> {pauseAnalysis.total_duration_ms} ms</li>
            <li><strong>Total Silence:</strong> {pauseAnalysis.total_silence_ms} ms</li>
            <li><strong>Total Speech:</strong> {pauseAnalysis.total_speech_ms} ms</li>
            <li><strong>Pause-to-Speech Ratio:</strong> {pauseAnalysis.pause_to_speech_ratio}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
