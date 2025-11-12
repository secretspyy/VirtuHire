# stress_detection.py
import numpy as np
import librosa

def analyze_stress(wav_path: str):
    """
    Compute pitch (pyin), jitter-like metric, shimmer-like metric (approx),
    MFCC and spectral centroid variability. Combine into a simple heuristic score.
    Returns native python types.
    """
    try:
        y, sr = librosa.load(wav_path, sr=None, mono=True)

        # --- Energy / RMS stats
        rms = librosa.feature.rms(y=y)
        avg_rms = float(np.mean(rms)) if rms.size else 0.0
        rms_std = float(np.std(rms)) if rms.size else 0.0

        # --- Pitch (F0) using pyin (more robust)
        try:
            f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=50, fmax=400, sr=sr)
            # f0 is an array with nan where unvoiced
            f0_clean = f0[~np.isnan(f0)]
        except Exception:
            # fallback to piptrack
            pitches, mags = librosa.piptrack(y=y, sr=sr)
            f0_clean = []
            for i in range(pitches.shape[1]):
                idx = np.argmax(mags[:, i])
                pitch = pitches[idx, i]
                if pitch > 0:
                    f0_clean.append(pitch)
            f0_clean = np.array(f0_clean) if len(f0_clean) else np.array([])

        pitch_std = float(np.std(f0_clean)) if f0_clean.size else 0.0
        pitch_mean = float(np.mean(f0_clean)) if f0_clean.size else 0.0

        # --- Approx jitter (local variability of pitch)
        jitter = 0.0
        if f0_clean.size > 1:
            diffs = np.abs(np.diff(f0_clean))
            jitter = float(np.mean(diffs) / (np.mean(f0_clean)+1e-9))

        # --- Approx shimmer (amplitude variation)
        # using short-term RMS variability as proxy
        shimmer = float(rms_std / (avg_rms + 1e-9))

        # --- Spectral features (centroid, bandwidth)
        cent = librosa.feature.spectral_centroid(y=y, sr=sr)
        cent_std = float(np.std(cent)) if cent.size else 0.0

        # --- MFCC variance (emotion related)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_var = float(np.mean(np.var(mfcc, axis=1))) if mfcc.size else 0.0

        # --- Heuristic scoring (tweak weights experimentally)
        # Higher pitch_std, jitter, shimmer, mfcc_var => higher stress
        score = (pitch_std / 50.0) + (jitter * 5.0) + (shimmer * 5.0) + (mfcc_var * 0.1)
        score = float(round(score, 3))

        if score < 0.5:
            level = "Low Stress"
        elif score < 1.2:
            level = "Moderate Stress"
        else:
            level = "High Stress"

        return {
            "stress_score": score,
            "stress_level": level,
            "pitch_std": float(round(pitch_std, 3)),
            "pitch_mean": float(round(pitch_mean, 3)),
            "jitter": float(round(jitter, 6)),
            "shimmer": float(round(shimmer, 6)),
            "mfcc_var": float(round(mfcc_var, 6)),
            "avg_rms": float(round(avg_rms, 6)),
            "spectral_centroid_std": float(round(cent_std, 3))
        }
    except Exception as e:
        return {"error": str(e)}
