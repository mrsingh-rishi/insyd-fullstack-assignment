# Real-Time Notification System - Testing Guide

## 🧪 Complete Testing Walkthrough

This guide will walk you through testing all features of the real-time notification system.

### Prerequisites

1. **Start the system** using one of these methods:
   ```bash
   # Option 1: Quick start script
   ./start-dev.sh
   
   # Option 2: Docker Compose
   docker-compose up --build
   
   # Option 3: Manual setup
   # Terminal 1: Start Redis
   redis-server
   
   # Terminal 2: Start Backend
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed
   npm run dev
   
   # Terminal 3: Start Frontend
   cd frontend
   npm install
   npm run dev
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Health Check: http://localhost:5001/health

---

## 📱 Frontend Testing

### 1. User Interface Testing

1. **Open the application** at http://localhost:3000
2. **Verify the interface loads** with:
   - Header with app title and connection status
   - User selection panel on the left
   - Content feed on the right
   - Green "Connected" indicator (WebSocket status)

### 2. Multi-User Simulation

1. **Open 3 browser tabs** to simulate different users
2. **In Tab 1**: Select user "Alice"
3. **In Tab 2**: Select user "Bob"  
4. **In Tab 3**: Select user "Charlie"

### 3. Follow Relationships Testing

1. **In Alice's tab**: Click "Follow" on Bob and Charlie
2. **In Bob's tab**: Click "Follow" on Alice
3. **In Charlie's tab**: Click "Follow" on Alice
4. **Verify**: Follow buttons should show feedback

### 4. Real-Time Notifications Testing

#### Test Case 1: Blog Post Notification
1. **In Bob's tab**: 
   - Select content type: "📝 Blog Post"
   - Title: "My First Blog Post"
   - Body: "This is an amazing blog post about real-time notifications!"
   - Click "Create Content"

2. **Expected Results**:
   - Content appears immediately in Bob's feed
   - **Alice's tab** shows notification badge (red number)
   - Browser notification appears for Alice (if permissions granted)
   - Real-time notification appears in Alice's notification panel

#### Test Case 2: Job Posting Notification
1. **In Alice's tab**:
   - Select content type: "💼 Job Posting"
   - Title: "Senior Developer Position"
   - Body: "We're hiring a senior developer for an exciting project!"
   - Click "Create Content"

2. **Expected Results**:
   - Both Bob and Charlie receive real-time notifications
   - Content appears in their feeds
   - Notification badges update

#### Test Case 3: Message Notification
1. **In Charlie's tab**:
   - Select content type: "💬 Message"
   - Title: "Hello Team!"
   - Body: "Just wanted to say hello to everyone!"
   - Click "Create Content"

2. **Expected Results**:
   - Alice receives notification (she follows Charlie)
   - Bob does not receive notification (he doesn't follow Charlie)

### 5. Notification Panel Testing

1. **Click "Notifications" button** in any tab
2. **Verify the panel shows**:
   - List of all notifications for that user
   - Correct icons for each content type
   - Unread notifications highlighted in blue
   - "Mark all read" button functionality
   - Notification count updates

3. **Test "Mark all read"**:
   - Click "Mark all read"
   - Verify badge count resets to 0
   - Verify notifications no longer highlighted

---

## 🔧 API Testing

### Using curl commands:

#### 1. Health Check
```bash
curl http://localhost:5001/health
```

#### 2. Get All Users
```bash
curl http://localhost:5001/api/users
```

#### 3. Create New User
```bash
curl -X POST http://localhost:5001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com"}'
```

#### 4. Follow User
```bash
curl -X POST http://localhost:5001/api/follows \
  -H "Content-Type: application/json" \
  -d '{"followerId": 1, "followingId": 2}'
```

#### 5. Create Content (triggers notifications)
```bash
curl -X POST http://localhost:5001/api/content \
  -H "Content-Type: application/json" \
  -d '{"userId": 2, "type": "BLOG", "title": "API Test Post", "body": "Testing via API"}'
```

#### 6. Get User Notifications
```bash
curl http://localhost:5001/api/notifications/user/1
```

#### 7. Get User Feed
```bash
curl http://localhost:5001/api/content/user/1/feed
```

---

## 🧩 WebSocket Testing

### Using Browser Console:

1. **Open browser dev tools** on the frontend
2. **Check console logs** for WebSocket connection messages:
   ```
   Connected to server
   User 1 authenticated with socket abc123
   ```

3. **Test real-time communication**:
   - Create content in one tab
   - Watch console logs in other tabs for "Received notification" messages

---

## ⚡ Performance Testing

### 1. Multiple Connection Test
1. **Open 10+ browser tabs**
2. **Select different users** in each tab
3. **Create content** from one tab
4. **Verify all relevant tabs** receive notifications simultaneously

### 2. Rapid Content Creation
1. **Create multiple pieces of content** quickly in succession
2. **Verify all notifications** are delivered correctly
3. **Check notification ordering** (newest first)

### 3. Browser Notification Test
1. **Grant notification permissions** when prompted
2. **Switch to different browser tab/window**
3. **Create content** that should notify you
4. **Verify browser notification** appears even when tab is not active

---

## 🐛 Error Handling Testing

### 1. Network Disconnection
1. **Disconnect your internet** or disable network
2. **Verify connection status** turns red ("Disconnected")
3. **Reconnect internet**
4. **Verify automatic reconnection** (status turns green)

### 2. Invalid Data
1. **Try creating content** without a title
2. **Verify validation** prevents submission
3. **Check error handling** in browser console

### 3. Database Issues
1. **Stop the backend server**
2. **Try performing actions** in frontend
3. **Verify graceful error handling**

---

## 📊 Feature Verification Checklist

### ✅ Core Features
- [ ] User selection and authentication
- [ ] Real-time WebSocket connections  
- [ ] Follow/unfollow relationships
- [ ] Content creation (Blog, Job, Message)
- [ ] Real-time notification delivery
- [ ] Notification badge counts
- [ ] Browser notifications
- [ ] Notification panel UI
- [ ] Mark notifications as read
- [ ] Content feed display

### ✅ Technical Features
- [ ] PostgreSQL data persistence
- [ ] Redis message queuing
- [ ] Socket.IO real-time communication
- [ ] RESTful API endpoints
- [ ] TypeScript type safety
- [ ] Responsive UI design
- [ ] Error handling and validation
- [ ] Database migrations and seeding

### ✅ System Features
- [ ] Docker containerization
- [ ] Environment configuration
- [ ] Health monitoring
- [ ] Connection status indicators
- [ ] Multi-user simulation
- [ ] Cross-tab communication

---

## 🎯 Advanced Testing Scenarios

### Scenario 1: Content Creator with Many Followers
1. Create 5+ users via API
2. Have all users follow one "content creator"
3. Content creator posts new content
4. Verify all followers receive notifications simultaneously

### Scenario 2: Heavy Notification Load
1. Create rapid content from multiple users
2. Monitor notification delivery performance  
3. Check Redis queue processing
4. Verify no notifications are lost

### Scenario 3: Offline User Handling
1. User creates content while another user is offline
2. Offline user reconnects
3. Verify they receive stored notifications

---

## 🚨 Troubleshooting Common Issues

### Issue: WebSocket Not Connecting
**Solutions:**
- Check backend server is running on port 5001
- Verify CORS settings allow frontend origin
- Check browser console for error messages

### Issue: Notifications Not Appearing
**Solutions:**
- Verify users have follow relationships
- Check Redis server is running
- Monitor backend console for processing logs

### Issue: Database Errors
**Solutions:**
- Run `npx prisma db push` to sync schema
- Check DATABASE_URL environment variable
- Verify Prisma client is generated

### Issue: Frontend Build Errors
**Solutions:**
- Run `npm install` in frontend directory
- Check Node.js version (18+ required)
- Clear node_modules and reinstall

---

## 📈 Success Metrics

A successful test run should demonstrate:

1. **Real-time delivery**: Notifications appear within 1-2 seconds
2. **Zero message loss**: All expected notifications are delivered
3. **Proper filtering**: Only followers receive notifications
4. **UI responsiveness**: Interface updates immediately
5. **Error resilience**: System handles edge cases gracefully
6. **Multi-user support**: Works with multiple concurrent users
7. **Data persistence**: Notifications stored and retrievable

---

## 🎉 Congratulations!

If all tests pass, you have successfully verified a complete real-time notification system with:

- **Frontend**: React/Next.js with real-time UI
- **Backend**: Node.js/Express API with WebSocket support
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis for message processing
- **Real-time**: Socket.IO for instant communication

The system is production-ready with proper error handling, data persistence, and scalable architecture!
