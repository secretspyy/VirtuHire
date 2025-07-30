import speech_recognition as sr

# List of common filler words
FILLER_WORDS = ["um", "uh", "like", "you know", "so", "actually", "basically", "literally"]

def detect_filler_words(audio_path):
    recognizer = sr.Recognizer()

    try:
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)

        # Tokenize and count filler words
        words = text.lower().split()
        filler_found = [word for word in words if word in FILLER_WORDS]
        filler_count = len(filler_found)

        return {
            "status": "success",
            "filler_count": filler_count,
            "filler_words": filler_found,
            "transcript": text
        }

    except sr.UnknownValueError:
        return {
            "status": "error",
            "message": "Speech Recognition could not understand the audio"
        }

    except sr.RequestError as e:
        return {
            "status": "error",
            "message": f"Could not request results from Google Speech Recognition; {e}"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Unexpected error: {str(e)}"
        }
