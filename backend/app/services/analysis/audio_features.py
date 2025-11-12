from pydub import AudioSegment, silence

def get_pause_to_speech_ratio(file_path: str):
    try:
        audio = AudioSegment.from_file(file_path, format="wav")
        total_duration_ms = len(audio)

        # Detect silence chunks (pause segments)
        silence_chunks = silence.detect_silence(
            audio, 
            min_silence_len=500,  # at least 0.5s silence
            silence_thresh=audio.dBFS - 14  # threshold below avg dBFS
        )

        total_silence_ms = sum(end - start for start, end in silence_chunks)
        total_speech_ms = total_duration_ms - total_silence_ms
        ratio = total_silence_ms / total_speech_ms if total_speech_ms > 0 else 0

        return {
            "total_duration_ms": int(total_duration_ms),
            "total_silence_ms": int(total_silence_ms),
            "total_speech_ms": int(total_speech_ms),
            "pause_to_speech_ratio": float(ratio)
        }
    except Exception as e:
        return {"error": f"Pause-to-speech analysis failed: {str(e)}"}
