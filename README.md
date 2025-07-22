# Real-Time Notification System

A comprehensive real-time notification system built with **Next.js (TypeScript)** frontend and **Node.js (TypeScript)** backend, featuring **Socket.IO** for real-time communication, **PostgreSQL** for data persistence, and **Redis** for message queuing.

## 🚀 Features

- **Real-time Notifications**: Instant delivery via WebSocket connections
- **Multi-user Support**: Users can follow each other and receive notifications
- **Content Types**: Support for blogs, job postings, and messages
- **Queue System**: Redis-based notification queue for scalable delivery
- **Responsive UI**: Clean and intuitive user interface
- **Docker Support**: Full containerization for easy deployment
- **TypeScript**: Type-safe development across the entire stack

## 🏗️ Architecture

### High-Level Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - React UI      │    │ - REST API      │    │ - Users         │
│ - Socket.IO     │    │ - WebSocket     │    │ - Follows       │
│   Client        │    │   Server        │    │ - Content       │
│ - Notifications │    │ - Queue Jobs    │    │ - Notifications │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Redis Queue   │
                       │                 │
                       │ - Message Queue │
                       │ - Pub/Sub       │
                       │ - Caching       │
                       └─────────────────┘
```

### Core Components

1. **Frontend (Next.js + TypeScript)**
   - React-based user interface
   - Socket.IO client for real-time communication
   - Context API for state management
   - API client for backend communication

2. **Backend (Node.js + TypeScript)**
   - Express.js REST API
   - Socket.IO server for WebSocket connections
   - Prisma ORM for database operations
   - Redis queue for notification processing

3. **Database (PostgreSQL)**
   - User management
   - Follow relationships
   - Content storage
   - Notification history

4. **Message Queue (Redis)**
   - Notification delivery queue
   - Real-time user tracking
   - Caching layer

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Git**

## 🛠️ Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-time-notification-system
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Option 2: Manual Setup

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd real-time-notification-system
   ```

2. **Start PostgreSQL and Redis**
   ```bash
   # Using Docker for databases only
   docker run --name postgres -e POSTGRES_DB=notifications -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
   docker run --name redis -p 6379:6379 -d redis
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run dev
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 🎯 Usage

### 1. Create Users
The system comes with seed data, but you can create new users via the API:

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "email": "alice@example.com"}'
```

### 2. Follow Users
```bash
curl -X POST http://localhost:5000/api/follows \
  -H "Content-Type: application/json" \
  -d '{"followerId": 1, "followingId": 2}'
```

### 3. Create Content
```bash
curl -X POST http://localhost:5000/api/content \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "type": "BLOG", "title": "My First Blog Post", "body": "This is amazing!"}'
```

### 4. Real-time Notifications
- Open the frontend at http://localhost:3000
- Select a user from the dropdown
- Follow other users and create content
- Watch real-time notifications appear instantly!

## 🔧 API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID

### Follows
- `POST /api/follows` - Follow a user
- `DELETE /api/follows` - Unfollow a user
- `GET /api/follows/user/:id/followers` - Get user's followers
- `GET /api/follows/user/:id/following` - Get users being followed

### Content
- `GET /api/content` - Get all content
- `POST /api/content` - Create new content
- `GET /api/content/user/:id/feed` - Get user's feed

### Notifications
- `GET /api/notifications/user/:id` - Get user's notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/user/:id/read-all` - Mark all as read

## 🧪 Testing the System

1. **Open multiple browser tabs** to simulate different users
2. **Select different users** in each tab
3. **Follow users** across different tabs
4. **Create content** as one user and watch notifications appear in followers' tabs
5. **Test different content types**: Blog posts, job postings, messages

## 📁 Project Structure

```
real-time-notification-system/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── Dockerfile
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Server entry point
│   ├── prisma/             # Database schema
│   └── Dockerfile
├── docker-compose.yml      # Multi-service orchestration
├── SYSTEM_DESIGN.md       # Detailed architecture docs
└── README.md              # This file
```

## 🔄 Development Workflow

1. **Make changes** to frontend or backend code
2. **Commit frequently** with descriptive messages
3. **Test the notification flow** after each change
4. **Use Docker Compose** for consistent development environment

### Git Workflow
```bash
git add .
git commit -m "feat: add new notification feature"
git push
```

## 🚀 Deployment

### Production Considerations
- Set environment variables for production
- Use production databases (not Docker containers)
- Implement proper logging and monitoring
- Add authentication and authorization
- Configure CORS for your domain
- Set up SSL/TLS certificates

### Environment Variables
Create `.env` files for each service:

**Backend (.env)**
```
DATABASE_URL="postgresql://user:password@localhost:5432/notifications"
REDIS_URL="redis://localhost:6379"
NODE_ENV=production
PORT=5000
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's running on ports
   lsof -i :3000
   lsof -i :5000
   lsof -i :5432
   lsof -i :6379
   ```

2. **Database connection issues**
   ```bash
   # Reset database
   docker-compose down -v
   docker-compose up --build
   ```

3. **WebSocket connection problems**
   - Check browser console for errors
   - Verify backend is running
   - Ensure CORS is properly configured

4. **Redis connection issues**
   ```bash
   # Check Redis is running
   docker ps | grep redis
   # Test Redis connection
   docker exec -it redis redis-cli ping
   ```

## 📈 Performance Considerations

- **Database**: Add indexes for frequently queried columns
- **Redis**: Use connection pooling for better performance
- **WebSocket**: Implement connection limits and rate limiting
- **Frontend**: Implement virtual scrolling for large notification lists

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Push notifications for mobile/desktop
- [ ] Notification preferences and settings
- [ ] Email notification fallback
- [ ] Admin dashboard for monitoring
- [ ] Message templates and personalization
- [ ] Notification analytics and insights

## 📚 Learn More

- [System Design Document](./SYSTEM_DESIGN.md) - Detailed architecture explanation
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎉 Happy coding!** If you have any questions or need help, please open an issue or reach out to the team.
