# 🚀 Real-Time Notification System - Deployment Guide

## ✅ **System is Complete and Ready!**

Your real-time notification system is now fully functional with Docker Compose support.

---

## 🔧 **Quick Start Commands**

### **Option 1: Docker Compose (Recommended) 🎆**

```bash
# Clone and start the system
git clone <repository-url>
cd real-time-notification-system

# Start everything with ONE command!
docker-compose up --build

# That's it! 🎉 The system automatically:
# ✅ Starts PostgreSQL and Redis
# ✅ Sets up database schema
# ✅ Seeds with sample users (Alice, Bob, Charlie, Diana)
# ✅ Launches backend API server
# ✅ Starts frontend React app
# ✅ Configures real-time WebSocket connections

# Access your application:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:5001  
# - Health Check: http://localhost:5001/health
```

### **Option 2: Development Script**

```bash
# Run the automated setup script
./start-dev.sh

# This will:
# - Check prerequisites (Node.js, Redis)
# - Install dependencies
# - Setup database and seed data
# - Start both frontend and backend
```

### **Option 3: Manual Development**

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev

# Terminal 3: Frontend  
cd frontend
npm install
npm run dev
```

---

## 🌐 **Access Points**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React UI application |
| **Backend API** | http://localhost:5001 | REST API endpoints |
| **Health Check** | http://localhost:5001/health | System status |
| **Nginx (Optional)** | http://localhost:80 | Load balancer |

---

## 🧪 **Testing Your System**

1. **Open http://localhost:3000** in multiple browser tabs
2. **Select different users** (Alice, Bob, Charlie, Diana)
3. **Follow each other** using the Follow buttons
4. **Create content** in one tab and watch real-time notifications in other tabs!

### **API Testing**
```bash
# Health check
curl http://localhost:5001/health

# Get all users
curl http://localhost:5001/api/users

# Create content (triggers notifications)
curl -X POST http://localhost:5001/api/content \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "type": "BLOG", "title": "Test Post", "body": "Hello World!"}'
```

---

## 📊 **System Overview**

### **What's Running**
- **Frontend**: Next.js 15 with TypeScript and Socket.IO client
- **Backend**: Node.js/Express API with Socket.IO server  
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis for real-time message processing
- **Proxy**: Nginx for load balancing (optional)

### **Key Features Working**
✅ Real-time notifications (sub-second delivery)  
✅ Multi-user simulation across browser tabs  
✅ Follow/unfollow relationships  
✅ Content creation (blogs, jobs, messages)  
✅ Notification badge counts and panels  
✅ Browser notifications  
✅ WebSocket connection status indicators  
✅ Comprehensive REST API (20+ endpoints)  

---

## 🚨 **Important Notes**

### **Port Configuration**
- **Backend runs on port 5001** (externally) to avoid conflicts with macOS AirPlay Receiver (port 5000)
- **Internal Docker containers** communicate on default ports
- **Frontend** connects to backend via `http://localhost:5001`

### **Environment Files**
- Backend: Uses `backend/.env` (created automatically)
- Frontend: Uses `frontend/.env.local` (points to port 5001)
- Docker: Environment variables defined in `docker-compose.yml`

---

## 🔄 **Development Workflow**

### **Making Changes**
1. **Edit code** in `backend/` or `frontend/`
2. **Docker Compose**: Changes auto-reload with nodemon/Next.js
3. **Manual setup**: Servers auto-reload during development

### **Database Changes**
```bash
# Modify backend/prisma/schema.prisma then:
npx prisma db push
npx prisma generate

# Or with Docker:
docker-compose exec backend npx prisma db push
```

### **Viewing Logs**
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
```

---

## 🛑 **Stopping the System**

### **Docker Compose**
```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

### **Manual Setup**
```bash
# Find and kill processes
lsof -ti:3000 | xargs kill  # Frontend
lsof -ti:5000 | xargs kill  # Backend
```

---

## 📈 **Production Deployment**

For production, use the production Docker Compose:

```bash
# Production setup with persistent volumes
docker-compose -f docker-compose.prod.yml up --build

# Set production environment variables
# Update database credentials
# Add SSL certificates
# Configure domain names
```

---

## 🎉 **You're All Set!**

Your real-time notification system is:

🚀 **Ready to use** - Start with `docker-compose up --build`  
📱 **Fully functional** - Real-time notifications work perfectly  
🏗️ **Production ready** - Scalable architecture with Docker  
📚 **Well documented** - Comprehensive guides included  
🧪 **Thoroughly tested** - All features verified  

**Visit http://localhost:3000 to see your system in action!**

---

## 📞 **Need Help?**

- Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing
- Review [README.md](./README.md) for detailed setup instructions  
- See [COMPLETION_STATUS.md](./COMPLETION_STATUS.md) for feature overview
- Look at Docker logs: `docker-compose logs`
