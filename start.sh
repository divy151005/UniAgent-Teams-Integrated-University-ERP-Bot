#!/bin/bash
echo "🎓 Starting University ERP Agent System"
echo "======================================="

# Start backend
echo "📦 Starting Spring Boot backend (port 8080)..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "   Waiting for backend to start..."
sleep 20

# Start frontend
echo "⚛️  Starting React frontend (port 5173)..."
cd ../frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ System running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8080/api"
echo "   H2 Console: http://localhost:8080/h2-console"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopped.'; exit" SIGINT
wait
