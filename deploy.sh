#!/bin/bash

echo "🚀 Real-Time Notification System Deployment Helper"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit - Ready for deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository found"
fi

# Check for required files
echo ""
echo "🔍 Checking deployment files..."

required_files=("railway.json" "render.yaml" "DEPLOYMENT_PLATFORMS.md" "frontend/vercel.json")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file found"
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "📦 Available deployment options:"
echo ""
echo "1. Railway (Recommended for full-stack)"
echo "   - Sign up: https://railway.app"
echo "   - Push to GitHub, then connect in Railway dashboard"
echo "   - Auto-deploys both frontend and backend"
echo ""
echo "2. Render.com (Good free tier)"
echo "   - Sign up: https://render.com"
echo "   - Use 'Blueprint' feature with render.yaml"
echo "   - Includes PostgreSQL and Redis"
echo ""
echo "3. Vercel (Frontend) + Railway (Backend)"
echo "   - Best performance for frontend"
echo "   - Run: cd frontend && vercel"
echo "   - Deploy backend separately on Railway"
echo ""

# Check Node.js version
echo "🔧 System Requirements:"
node_version=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js: $node_version"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
fi

npm_version=$(npm --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ npm: $npm_version"
else
    echo "❌ npm not found"
fi

echo ""
echo "🎯 Quick Start Commands:"
echo ""
echo "For Railway:"
echo "  git add . && git commit -m 'Deploy to Railway' && git push"
echo ""
echo "For Vercel (frontend only):"
echo "  cd frontend && npx vercel"
echo ""
echo "For local testing:"
echo "  docker-compose up --build"
echo ""
echo "📚 For detailed instructions, see: DEPLOYMENT_PLATFORMS.md"
echo ""
echo "🎉 Your app is ready for deployment!"
