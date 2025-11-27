#!/bin/bash
# start.sh

echo "🚀 Starting Dignitas..."

# Kill any existing processes on our ports
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Check for uv and pnpm
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Please install it: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it: npm install -g pnpm"
    exit 1
fi

# Start Graph Engine
echo "Starting Graph Engine on :8000..."
cd graph_engine
# Create venv with uv if not exists
if [ ! -d ".venv" ]; then
    uv venv
fi
source .venv/bin/activate
uv pip install -r requirements.txt --quiet

uvicorn main:app --host 0.0.0.0 --port 8000 &
GRAPH_PID=$!
cd ..

sleep 2

# Start API Gateway
echo "Starting API Gateway on :3000..."
cd api
pnpm install --silent
pnpm run dev &
API_PID=$!
cd ..

sleep 2

# Start Frontend
echo "Starting Frontend on :3001..."
cd frontend
pnpm install --silent
pnpm run dev -p 3001 &
FRONTEND_PID=$!
cd ..

echo "✅ Dignitas is running!"
echo "   Graph Engine: http://localhost:8000"
echo "   API Gateway:  http://localhost:3000"
echo "   Frontend:     http://localhost:3001"

# Trap SIGINT to kill all background processes
trap "kill $GRAPH_PID $API_PID $FRONTEND_PID" SIGINT

wait
