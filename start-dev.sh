#!/bin/bash

echo "🚀 Starting Real-time Notification System - Development Mode"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js v18 or higher."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi

if ! command_exists redis-server; then
    echo "⚠️  Redis not found. Starting local Redis with Docker..."
    if command_exists docker; then
        docker run -d --name redis-notification -p 6379:6379 redis:alpine || echo "Redis container already running"
    else
        echo "❌ Neither Redis nor Docker found. Please install Redis or Docker."
        exit 1
    fi
else
    echo "✅ Redis found"
fi

echo "✅ Prerequisites check complete"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."

echo "Backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "Frontend dependencies..."
cd ../frontend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo "✅ Dependencies installed"
echo ""

# Generate Prisma client and run migrations
echo "🗄️ Setting up database..."
cd backend

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma db push

echo "Seeding database with initial data..."
npm run db:seed

cd ..

echo "✅ Database setup complete"
echo ""

# Create frontend environment file if it doesn't exist
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/.env.local.example frontend/.env.local
    echo "✅ Frontend .env.local created"
fi

echo ""
echo "🎉 Setup complete! Starting development servers..."
echo ""
echo "📚 Available endpoints:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000 (local dev)"
echo "   Backend API: http://localhost:5001 (Docker)"
echo "   Health Check: http://localhost:5000/health"
echo ""
echo "🔧 To start manually:"
echo "   Backend: cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""

# Ask user if they want to start servers automatically
read -p "Start development servers now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting servers..."
    
    # Start backend in background
    cd backend
    npm run dev &
    BACKEND_PID=$!
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend in background
    cd ../frontend
    npm run dev &
    FRONTEND_PID=$!
    
    cd ..
    
    echo ""
    echo "✅ Servers started!"
    echo "   Backend PID: $BACKEND_PID"
    echo "   Frontend PID: $FRONTEND_PID"
    echo ""
    echo "🛑 To stop servers:"
    echo "   kill $BACKEND_PID $FRONTEND_PID"
    echo "   Or press Ctrl+C"
    
    # Keep script running
    wait
else
    echo "👍 Setup complete! Start the servers manually when ready."
fi
