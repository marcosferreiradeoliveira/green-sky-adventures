#!/bin/bash

# Firebase App Hosting Deployment Script
# This script helps deploy your app to Firebase App Hosting

echo "🚀 Starting Firebase App Hosting deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production file not found!"
    echo "📝 Please create .env.production with your Firebase configuration:"
    echo "   Copy .env.example to .env.production and fill in your values"
    exit 1
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Deploy to Firebase App Hosting
echo "🚀 Deploying to Firebase App Hosting..."
firebase apphosting:backends:deploy --config apphosting.prod.yaml

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi

