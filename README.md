# Security Log Dashboard

A full-stack security log dashboard with React + Vite frontend and FastAPI backend.

## Project Structure

```
security-log-dashboard/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── backend/           # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   ├── venv/
│   └── .env
└── .gitignore
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. The virtual environment is already created. Activate it:
```bash
source venv/bin/activate
```

3. Dependencies are already installed. To reinstall:
```bash
pip install -r requirements.txt
```

4. Update the `.env` file with your Anthropic API key:
```
ANTHROPIC_API_KEY=your-actual-api-key-here
```

5. Run the FastAPI server:
```bash
python main.py
```

The backend will be available at `http://localhost:8000`
- Health check endpoint: `http://localhost:8000/health`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Dependencies are already installed. To reinstall:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS (v4 with @tailwindcss/postcss)
- Framer Motion (animations)
- Recharts (data visualization)
- React Icons
- Axios (HTTP client)

### Backend
- FastAPI
- Uvicorn (ASGI server)
- Pandas (data processing)
- Anthropic SDK (Claude API)
- Python Dotenv (environment variables)

## Development

Both servers support hot reload:
- Frontend: Changes to React components will automatically refresh
- Backend: Uvicorn watches for file changes and reloads automatically

## API Endpoints

- `GET /health` - Health check endpoint returning `{"status": "ok"}`

## Environment Variables

Create a `.env` file in the `backend` directory:
```
ANTHROPIC_API_KEY=your-key-here
```
