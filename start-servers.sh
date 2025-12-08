#!/bin/bash
# Start all AQUA servers

echo "Starting AQUA Hackathon servers..."

# 1. Start Docker Desktop
echo "1. Starting Docker Desktop..."
open -a Docker
sleep 10

# 2. Start Audio API container
echo "2. Starting Audio API (Docker)..."
docker run -d --platform linux/amd64 -p 8080:8080 kevinricar24/api-core-ai:latest 2>/dev/null || echo "Audio API already running or Docker not ready"

# 3. Start JSON Server
echo "3. Starting JSON Server..."
cd "$(dirname "$0")/project-resources/JSON Server/json-server"
npx json-server db.json --port 3000 &
JSON_PID=$!

# 4. Start Frontend
echo "4. Starting Frontend..."
cd "$(dirname "$0")/project-implementation/aqua-frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "All servers started!"
echo "- Frontend:   http://localhost:5173"
echo "- JSON API:   http://localhost:3000"
echo "- Audio API:  http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait and cleanup on exit
trap "kill $JSON_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT
wait
