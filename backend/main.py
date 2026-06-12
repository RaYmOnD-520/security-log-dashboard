from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from log_parser import parse_log_file
import uvicorn

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
    """Health check endpoint"""
    return {"status": "ok"}


@app.post("/analyse")
async def analyse_log(file: UploadFile = File(...)):
    """
    Analyse uploaded log file for security threats.

    Args:
        file: Uploaded log file

    Returns:
        Analysis results with threats, warnings, and event details
    """
    try:
        content = await file.read()

        try:
            text_content = content.decode('utf-8')
        except UnicodeDecodeError:
            text_content = content.decode('latin-1')

        analysis_result = parse_log_file(text_content)

        return analysis_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing log file: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
