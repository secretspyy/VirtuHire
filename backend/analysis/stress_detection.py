import soundfile as sf
import numpy as np
from scipy.signal import welch

def analyze_stress(audio_path: str) -> dict:
    """
    Analyze stress levels in speech based on audio features.
    Args:
        audio_path: Path to the audio file
    Returns:
        Dictionary containing stress analysis results
    """
    try:
        # Load the audio file
        audio_data, sample_rate = sf.read(audio_path)
        
        # Convert stereo to mono if necessary
        if len(audio_data.shape) > 1:
            audio_data = np.mean(audio_data, axis=1)
        
        # Calculate features
        # 1. Energy variability
        frame_length = int(0.02 * sample_rate)  # 20ms frames
        hop_length = int(0.01 * sample_rate)    # 10ms hop
        
        frames = []
        for i in range(0, len(audio_data) - frame_length, hop_length):
            frame = audio_data[i:i + frame_length]
            frames.append(np.sqrt(np.mean(frame**2)))
        
        energy_variance = float(np.var(frames))
        
        # 2. Pitch variability (using zero-crossing rate as simple proxy)
        zero_crossings = np.sum(np.abs(np.diff(np.signbit(audio_data))))
        pitch_variance = float(zero_crossings / len(audio_data))
        
        # Simple stress level classification based on both variances
        stress_score = (energy_variance + pitch_variance) / 2
        
        if stress_score < 0.3:
            level = "low"
        elif stress_score < 0.6:
            level = "medium"
        else:
            level = "high"
            
        return {
            "stress_level": level,
            "features": {
                "energy_variability": energy_variance,
                "zero_crossing_rate": pitch_variance
            }
        }
    except Exception as e:
        print(f"Error in analyze_stress: {str(e)}")
        return {
            "stress_level": "unknown",
            "features": {
                "energy_variability": 0.0,
                "zero_crossing_rate": 0.0
            }
        }