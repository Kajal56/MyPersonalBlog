#!/bin/bash

echo "========================================"
echo "Personal Blog - Server Restart Script"
echo "========================================"
echo ""

# Step 1: Kill Node processes
echo "[1/4] Killing all Node.js processes..."
if command -v pkill > /dev/null; then
    pkill -f node > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✓ Node.js processes terminated"
    else
        echo "ℹ No Node.js processes were running"
    fi
else
    echo "ℹ pkill not available, skipping process cleanup"
fi

# Step 2: Wait for cleanup
echo ""
echo "[2/4] Waiting for processes to fully terminate..."
sleep 2

# Step 3: Start Backend
echo ""
echo "[3/4] Starting Backend Server (Port 5000)..."
cd backend
nohup node server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend server started (PID: $BACKEND_PID)"
cd ..
sleep 3

# Step 4: Start Frontend
echo ""
echo "[4/4] Starting Frontend Server (Port 3000)..."
cd frontend
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend server started (PID: $FRONTEND_PID)"
cd ..

echo ""
echo "========================================"
echo "✓ Server restart complete!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:5000 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Logs:"
echo "  Backend:  backend.log"
echo "  Frontend: frontend.log"
echo ""
echo "To stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
