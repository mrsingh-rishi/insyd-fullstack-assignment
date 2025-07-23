#!/bin/bash
echo "🚀 Starting backend on Render.com..."

# Push database schema
npx prisma db push

# Seed database with sample data
npm run db:seed

# Start the production server
npm start
