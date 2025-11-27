#!/bin/bash
# start.sh

echo "🚀 Starting Dignitas..."

# Start Graph Engine
echo "Starting Graph Engine on :8000..."
cd graph_engine
# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

uvicorn main:app --host 0.0.0.0 --port 8000 &
GRAPH_PID=$!
cd ..

sleep 2

# Start API Gateway
echo "Starting API Gateway on :3000..."
cd api
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev &
API_PID=$!
cd ..

sleep 2

# Start Frontend
echo "Starting Frontend on :3001..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
# Next.js usually runs on 3000, but our API is on 3000.
# We need to run Next.js on a different port, e.g., 3001 or 5173.
# Let's use 3001.
npm run dev -- -p 3001 &
FRONTEND_PID=$!
cd ..

echo "✅ Dignitas is running!"
echo "   Graph Engine: http://localhost:8000"
echo "   API Gateway:  http://localhost:3000"
echo "   Frontend:     http://localhost:3001"

# Trap SIGINT to kill all background processes
trap "kill $GRAPH_PID $API_PID $FRONTEND_PID" SIGINT

wait
