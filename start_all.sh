#!/bin/bash

echo "🚀 Starting Attendance System..."

# Kill existing processes
echo "🧹 Cleaning up ports..."
lsof -ti:8080 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
pkill -9 "Chromium" 2>/dev/null
pkill -9 "Google Chrome" 2>/dev/null

# Start Backend
echo "☕ Starting Backend (Spring Boot)..."
cd attendance-backend
mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start WhatsApp Service
echo "💬 Starting WhatsApp Service (Python)..."
cd whatsapp-service
source venv/bin/activate
python simple_service.py > ../whatsapp.log 2>&1 &
WHATSAPP_PID=$!
cd ..

# Start Frontend
echo "⚛️ Starting Frontend (Vite)..."
cd attendance-frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo "   - Backend: PID $BACKEND_PID (Logs: backend.log)"
echo "   - WhatsApp: PID $WHATSAPP_PID (Logs: whatsapp.log)"
echo "   - Frontend: PID $FRONTEND_PID (Logs: frontend.log)"
echo ""
echo "🌐 Access Dashboard: http://localhost:3000/dashboard"
echo "📱 WhatsApp Service: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services."

# Wait for user input
wait
