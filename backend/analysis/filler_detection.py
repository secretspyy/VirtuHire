import whisper

def detect_filler_words(audio_path: str) -> dict:
    """
    Detects filler words in the audio file and returns statistics.
    Args:
        audio_path: Path to the audio file
    Returns:
        Dictionary containing filler word statistics
    """
    try:
        # List of common filler words
        filler_words = [
            "um", "uh", "like", "you know", "well", "sort of", "kind of",
            "basically", "literally", "actually", "so", "anyway", "right"
        ]
        
        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        text = result["text"].lower()
        
        results = {}
        for word in filler_words:
            count = text.count(word)
            if count > 0:
                results[word] = count
                
        return {
            "filler_words": results,
            "total_count": sum(results.values()),
            "transcription": text
        }
    except Exception as e:
        print(f"Error in detect_filler_words: {str(e)}")
        return {
            "filler_words": {},
            "total_count": 0,
            "transcription": "",
            "error": str(e)
        }