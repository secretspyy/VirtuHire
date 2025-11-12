import soundfile as sf
import numpy as np

def get_pause_to_speech_ratio(audio_path: str) -> dict:
    """
    Calculate speech and pause statistics from audio.
    Args:
        audio_path: Path to the audio file
    Returns:
        Dictionary containing pause and speech statistics
    """
    try:
        # Load the audio file
        audio_data, sample_rate = sf.read(audio_path)
        
        # Convert stereo to mono if necessary
        if len(audio_data.shape) > 1:
            audio_data = np.mean(audio_data, axis=1)
        
        # Calculate RMS energy
        frame_length = int(0.02 * sample_rate)  # 20ms frames
        hop_length = int(0.01 * sample_rate)    # 10ms hop
        
        frames = []
        for i in range(0, len(audio_data) - frame_length, hop_length):
            frame = audio_data[i:i + frame_length]
            frames.append(np.sqrt(np.mean(frame**2)))
        
        # Simple energy threshold for speech/pause
        threshold = np.mean(frames) * 0.1
        pause_frames = sum(1 for frame in frames if frame < threshold)
        speech_frames = len(frames) - pause_frames
        
        # Convert frame counts to milliseconds
        ms_per_frame = hop_length * 1000 / sample_rate
        total_duration_ms = len(frames) * ms_per_frame
        total_silence_ms = pause_frames * ms_per_frame
        total_speech_ms = speech_frames * ms_per_frame
        
        # Calculate ratio
        ratio = pause_frames / (speech_frames + 1e-6)  # Avoid division by zero
        
        return {
            "total_duration_ms": total_duration_ms,
            "total_silence_ms": total_silence_ms,
            "total_speech_ms": total_speech_ms,
            "pause_to_speech_ratio": ratio
        }
    except Exception as e:
        print(f"Error in get_pause_to_speech_ratio: {str(e)}")
        return {
            "total_duration_ms": 0,
            "total_silence_ms": 0,
            "total_speech_ms": 0,
            "pause_to_speech_ratio": 0
        }