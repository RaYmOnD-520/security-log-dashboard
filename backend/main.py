from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from log_parser import parse_log_file

load_dotenv()

app = FastAPI(title="Security Log Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/analyse")
async def analyse_logs(file: UploadFile = File(...)):
    """Analyse uploaded log file for security threats."""
    try:
        # Validate file type
        if not file.filename.endswith(('.log', '.txt')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only .log and .txt files are supported."
            )

        # Read file content
        content = await file.read()
        content_str = content.decode('utf-8')

        # Parse the log file
        result = parse_log_file(content_str)

        return result

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Unable to decode file. Please ensure it's a valid text file."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing log file: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
