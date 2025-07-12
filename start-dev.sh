#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Personal Blog (Frontend + Backend)${NC}"
echo ""

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 0
    else
        return 1
    fi
}

# Kill existing processes on our ports
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start Backend
echo -e "${GREEN}📦 Starting Backend API (Port 5000)...${NC}"
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo -e "${GREEN}🌐 Starting Frontend (Port 3000)...${NC}"
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✅ Both services are starting...${NC}"
echo -e "${BLUE}📊 Backend API: http://localhost:5000${NC}"
echo -e "${BLUE}🌐 Frontend: http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit
}

# Set trap to cleanup on script termination
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
