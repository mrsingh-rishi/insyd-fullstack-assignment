#!/bin/bash
echo "🚀 Building backend for Render.com..."

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build TypeScript
npm run build

echo "✅ Backend build complete!"
