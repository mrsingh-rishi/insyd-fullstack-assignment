# Real-Time Notification System - System Design

## 1. Overview

This document outlines the architecture for a real-time notification system for a social platform. The system notifies users when people they follow post content (blogs, jobs, messages) in real-time.

## 2. High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - User Interface│    │ - REST API      │    │ - Users         │
│ - WebSocket     │    │ - WebSocket     │    │ - Follows       │
│   Client        │    │   Server        │    │ - Content       │
│ - Notifications │    │ - Notification  │    │ - Notifications │
│   Display       │    │   Logic         │    │                 │
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

## 3. Technology Stack

### Frontend
- **Next.js 14** with TypeScript
- **Socket.IO Client** for real-time communication
- **React Hooks** for state management
- **Tailwind CSS** for basic styling (optional)

### Backend
- **Node.js** with TypeScript
- **Express.js** for REST API
- **Socket.IO** for WebSocket connections
- **Prisma ORM** for database operations
- **Bull Queue** with Redis for job processing

### Database
- **PostgreSQL** for persistent data storage
- **Redis** for caching and message queuing

### Infrastructure
- **Docker** and **Docker Compose** for containerization
- **Environment-based configuration**

## 4. Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Follows table (many-to-many relationship)
CREATE TABLE follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id),
  following_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- Content table
CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- 'blog', 'job', 'message'
  title VARCHAR(200) NOT NULL,
  body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id), -- recipient
  content_id INTEGER REFERENCES content(id),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. Core Components

### 5.1 Notification Service Architecture

```
Content Creation → Notification Generator → Queue → Delivery Service → WebSocket
```

#### Notification Generator
- Identifies followers when content is created
- Creates notification records in database
- Queues notification delivery jobs

#### Queue System (Redis)
- **Why Redis over Kafka?**
  - **Simplicity**: Redis is simpler to set up and manage for this scale
  - **Low Latency**: Redis provides sub-millisecond latency for real-time notifications
  - **Built-in Data Structures**: Lists, sets, and pub/sub capabilities
  - **Memory-based**: Faster for frequent read/write operations
  - **Smaller Footprint**: Less resource intensive than Kafka

#### Delivery Service
- Processes queued notifications
- Manages WebSocket connections
- Handles offline user scenarios

## 6. Why Redis Queue Over Other Solutions?

### Redis vs Kafka

| Feature | Redis | Kafka |
|---------|-------|-------|
| **Setup Complexity** | Simple | Complex (Zookeeper, multiple brokers) |
| **Latency** | Sub-millisecond | Low but higher than Redis |
| **Throughput** | High for small messages | Very high for large throughput |
| **Persistence** | Optional | Persistent by default |
| **Resource Usage** | Lower | Higher (more suited for enterprise) |
| **Use Case Fit** | Perfect for real-time notifications | Better for high-volume data streaming |

### Redis vs RabbitMQ

| Feature | Redis | RabbitMQ |
|---------|-------|----------|
| **Data Types** | Rich data structures | Message-focused |
| **Performance** | Faster for simple queuing | More features, slightly slower |
| **Caching** | Built-in caching capabilities | Requires separate cache |
| **Simplicity** | Simpler setup | More configuration options |

## 7. System Flow

### 7.1 User Registration/Follow Flow
```
1. User creates account → Stored in users table
2. User follows another user → Stored in follows table
3. WebSocket connection established → Stored in memory
```

### 7.2 Content Creation Flow
```
1. User posts content → Stored in content table
2. System finds followers → Query follows table
3. Create notifications → Bulk insert to notifications table
4. Queue delivery jobs → Push to Redis queue
5. Process jobs → Send via WebSocket to online users
```

### 7.3 Real-time Delivery Flow
```
1. Notification job processed
2. Check if user is online (WebSocket connection exists)
3. If online: Send immediately via WebSocket
4. If offline: Mark for later delivery
5. Update notification as delivered
```

## 8. Scalability Considerations

### Current Architecture (MVP)
- Single backend instance
- Single Redis instance
- Single PostgreSQL instance
- Suitable for ~1000 concurrent users

### Future Scaling Options
- **Horizontal Backend Scaling**: Multiple backend instances with load balancer
- **Redis Clustering**: Redis cluster for high availability
- **Database Sharding**: Partition data across multiple databases
- **WebSocket Management**: Dedicated WebSocket service with session storage

## 9. Performance Optimizations

### Database Optimizations
- **Indexes** on frequently queried columns (user_id, created_at)
- **Connection Pooling** to limit database connections
- **Query Optimization** using Prisma's optimized queries

### Caching Strategy
- **User Data**: Cache user information in Redis
- **Follow Relationships**: Cache active follow relationships
- **Online Users**: Track online users in Redis sets

### Queue Management
- **Job Prioritization**: Priority queues for different notification types
- **Batch Processing**: Group notifications for the same user
- **Dead Letter Queue**: Handle failed notification deliveries

## 10. Monitoring and Observability

### Key Metrics
- **WebSocket Connections**: Active connection count
- **Queue Depth**: Number of pending notifications
- **Delivery Rate**: Notifications delivered per second
- **Error Rate**: Failed delivery percentage

### Logging Strategy
- **Structured Logging**: JSON format for easy parsing
- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Key Events**: User actions, notification creation, delivery status

## 11. Security Considerations

### WebSocket Security
- **Connection Validation**: Verify user identity on connection
- **Rate Limiting**: Prevent spam and abuse
- **Message Validation**: Sanitize all incoming data

### Database Security
- **Parameterized Queries**: Prevent SQL injection
- **Connection Security**: SSL/TLS for database connections
- **Access Control**: Principle of least privilege

## 12. Development Phases

### Phase 1: MVP (Current Scope)
- Basic user management
- Follow system
- Content creation
- Real-time notifications
- Docker setup

### Phase 2: Enhancements
- Authentication system
- Notification preferences
- Push notifications (mobile)
- Admin dashboard

### Phase 3: Production Ready
- Load balancing
- Monitoring and alerting
- Backup and recovery
- Performance optimization

## 13. Testing Strategy

### Unit Tests
- Individual service functions
- Database operations
- WebSocket message handling

### Integration Tests
- End-to-end notification flow
- Database and Redis integration
- WebSocket connection management

### Load Tests
- Concurrent user connections
- Notification delivery under load
- Database performance under stress

## 14. Deployment Architecture

```
Docker Compose Setup:
├── frontend (Next.js)
├── backend (Node.js)
├── database (PostgreSQL)
├── redis (Redis)
└── nginx (Load Balancer - future)
```

This architecture provides a solid foundation for a real-time notification system that can handle the core requirements while being scalable and maintainable.
