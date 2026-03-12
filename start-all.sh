#!/bin/zsh

echo "🚀 Starting University ERP + Teams Chatbot (All Services)"

# Terminal 1: MongoDB
echo "🐘 Starting MongoDB..."
mongod --fork --dbpath ./data --logpath ./mongodb.log &
sleep 3

# Terminal 2: Backend 
echo "⚙️  Starting Backend (http://localhost:8080)..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!

echo "🌐 Frontend (http://localhost:5173)..."
cd ../frontend
npm run dev &

echo ""
echo "✅ ALL SERVICES RUNNING!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8080"
echo "📊 MongoDB: localhost:27017"
echo ""
echo "🧪 Test Flow:"
echo "curl -X POST http://localhost:8080/api/messages -H 'Content-Type: application/json' -d '{\"rawText\":\"CSE exam March 15\",\"fromUser\":\"Admin\"}'"
echo ""
echo "💡 Open http://localhost:5173/messages → Approve → See Teams simulation!"
echo ""
echo "Stop all: pkill -f 'mvn spring-boot' && pkill mongod"
echo ""
wait

