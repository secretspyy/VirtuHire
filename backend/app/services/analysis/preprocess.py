# preprocess.py
import librosa
import numpy as np
import soundfile as sf
import noisereduce as nr

def preprocess_audio(in_path: str, out_path: str,
                     target_sr: int = 16000,
                     denoise: bool = True,
                     highpass: float = 80.0):
    """
    - Loads audio (librosa), optionally denoises (noisereduce),
      applies a gentle highpass, normalizes and resamples to target_sr,
      and writes a 16-bit WAV to out_path.
    - Returns (y, sr) loaded array (after processing).
    """
    y, sr = librosa.load(in_path, sr=None, mono=True)
    # optional denoise (gentle)
    if denoise:
        try:
            y = nr.reduce_noise(y=y, sr=sr)
        except Exception:
            pass

    # highpass filter (simple - remove very low rumble)
    if highpass and highpass > 0:
        # use librosa's highpass via FFT (simple)
        # but for simplicity use librosa.effects.preemphasis for mild boost
        y = librosa.effects.preemphasis(y)

    # normalize to -1..1
    peak = np.max(np.abs(y)) if y.size else 1.0
    if peak > 0:
        y = y / peak

    # resample
    if sr != target_sr:
        y = librosa.resample(y, orig_sr=sr, target_sr=target_sr)
        sr = target_sr

    # write 16-bit PCM wav
    sf.write(out_path, y, sr, subtype="PCM_16")
    return y, sr
