# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🚀 Starting backend server..."' >> /app/start.sh && \
    echo 'echo "📊 Setting up database..."' >> /app/start.sh && \
    echo 'npx prisma db push --accept-data-loss' >> /app/start.sh && \
    echo 'echo "🌱 Seeding database..."' >> /app/start.sh && \
    echo 'npm run db:seed' >> /app/start.sh && \
    echo 'echo "✅ Database setup complete!"' >> /app/start.sh && \
    echo 'echo "🔥 Starting application..."' >> /app/start.sh && \
    echo 'npm run dev' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 5000

# Start the application with automatic database setup
CMD ["/app/start.sh"]
