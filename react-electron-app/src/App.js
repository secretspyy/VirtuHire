// src/App.js
import React from 'react';
import AudioRecorder from './components/AudioRecorder';


// App.js
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-700 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 drop-shadow-lg tracking-wide text-center">
        VirtuHire — Virtual Interviewer
      </h1>
      <AudioRecorder />
    </div>
  );
}


export default App;
