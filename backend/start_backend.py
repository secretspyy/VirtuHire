import os
import uvicorn
import sys

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)  # ensures current directory is on the Python path

    uvicorn.run("main:app", host="127.0.0.1", port=8000)

