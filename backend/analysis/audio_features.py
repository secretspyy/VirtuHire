# backend/analysis/audio_features.py

from pydub import AudioSegment, silence
import os

def get_pause_to_speech_ratio(wav_path, silence_thresh=-40, min_silence_len=700):
    """
    Returns the pause-to-speech ratio of a .wav file.

    Args:
        wav_path: Path to the .wav file
        silence_thresh: Silence threshold (in dB)
        min_silence_len: Minimum silence to be considered a pause (in ms)

    Returns:
        A dictionary with total duration, silence, speech, and pause-to-speech ratio
    """
    audio = AudioSegment.from_wav(wav_path)
    total_duration = len(audio)  # in ms

    # Detect silent chunks
    silent_chunks = silence.detect_silence(
        audio,
        min_silence_len=min_silence_len,
        silence_thresh=silence_thresh
    )

    # Total silence in ms
    total_silence = sum([end - start for start, end in silent_chunks])
    total_speech = total_duration - total_silence

    ratio = total_silence / total_speech if total_speech > 0 else 0

    return {
        "total_duration_ms": total_duration,
        "total_silence_ms": total_silence,
        "total_speech_ms": total_speech,
        "pause_to_speech_ratio": round(ratio, 2)
    }
