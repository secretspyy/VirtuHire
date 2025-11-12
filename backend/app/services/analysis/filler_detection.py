# filler_detection.py
import re
from collections import Counter
from rapidfuzz import fuzz

# expand filler list (multiword too)
FILLER_WORDS = [
    "um", "uh", "like", "you know", "so", "actually",
    "basically", "literally", "hmm", "er", "ah", "huh", "i mean", "well"
]

def detect_filler_words(transcript: str, fuzzy_threshold: int = 85):
    """
    Returns:
      {
        "filler_words": [list repeated by occurrences],
        "count": N,
        "frequency": {word: count}
      }
    Uses both exact matches and fuzzy match for small ASR errors.
    """
    if not transcript:
        return {"filler_words": [], "count": 0, "frequency": {}}

    text = transcript.lower()
    tokens = re.findall(r"\w+|\w+'\w+|\w+-\w+", text)  # simple tokeniser

    freq = Counter()

    # Exact & phrase matching
    for filler in FILLER_WORDS:
        pattern = r'\b' + re.escape(filler) + r'\b'
        matches = re.findall(pattern, text)
        if matches:
            freq[filler] += len(matches)

    # Fuzzy match tokens for single-word fillers (to catch ASR typos)
    for token in tokens:
        for filler in [w for w in FILLER_WORDS if len(w.split())==1]:
            score = fuzz.ratio(token, filler)
            if score >= fuzzy_threshold:
                freq[filler] += 1

    fillers_list = []
    for w, c in freq.items():
        fillers_list += [w] * c

    return {
        "filler_words": fillers_list,
        "count": int(sum(freq.values())),
        "frequency": dict(freq)
    }
