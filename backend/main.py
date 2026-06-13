from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from log_parser import parse_log_file
import uvicorn
import os
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()

app = FastAPI(title="Security Log Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class AnalysisData(BaseModel):
    total_events: int
    threats: int
    warnings: int
    clean_events: int
    events: list


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


@app.post("/summarise")
async def summarise_threats(data: AnalysisData):
    """
    Generate AI-powered threat summary using Claude.

    Args:
        data: Analysis result data

    Returns:
        AI-generated threat summary
    """
    try:
        if not os.getenv("ANTHROPIC_API_KEY"):
            raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

        threat_events = [e for e in data.events if e.get('severity') in ['CRITICAL', 'HIGH']]

        prompt = f"""Analysis Summary:
- Total Events: {data.total_events}
- Threats Detected: {data.threats}
- Warnings: {data.warnings}
- Clean Events: {data.clean_events}

Critical Threat Events:
"""
        for event in threat_events[:10]:
            prompt += f"\n- [{event.get('severity')}] {event.get('message')} (IP: {event.get('source_ip')})"

        message = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            system="You are a cybersecurity analyst. Analyse the provided security log data and give a concise 3-4 sentence threat summary. Mention the most critical threats, affected IPs, and recommended immediate actions.",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        summary = message.content[0].text

        return {"summary": summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
