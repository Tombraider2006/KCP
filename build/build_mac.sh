#!/bin/bash

# Klipper Control Panel - Electron macOS Builder
echo "========================================"
echo "   Klipper Control Panel - Electron Builder"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &>/dev/null; then
    echo "❌ Node.js is not installed!"
    echo "📥 Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &>/dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    exit 1
fi

# Build for macOS
echo "🔨 Building for macOS..."
npm run build:mac

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 The application is in the 'dist-electron' directory"
else
    echo "❌ Build failed!"
    exit 1
fi