#!/bin/bash

# TaraNidhi Complete Tool — Quick Start Script
# This script sets everything up and starts the application

set -e  # Exit on error

echo "🚀 TaraNidhi Complete Tool — Starting..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✓ Node.js $(node --version) found"

# Navigate to project root
cd "$(dirname "$0")" || exit 1

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
echo "✓ Frontend dependencies installed"

echo ""
echo "📦 Installing backend dependencies..."
cd ../worker
npm install
echo "✓ Backend dependencies installed"

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="
echo ""
echo "🎯 To start testing:"
echo ""
echo "1. In a NEW TERMINAL, start the backend:"
echo "   cd /home/claude/occultviision/worker"
echo "   npm run dev"
echo ""
echo "2. Then open in browser:"
echo "   http://localhost:8787"
echo ""
echo "3. Test the application:"
echo "   - Click on Panchang elements (Tithi, Nakshatra, etc)"
echo "   - Check colors: Royal Indigo (#4B0082), Emerald (#50C878), Golden (#FFD700)"
echo "   - Test all 5 tabs (Amanta, Date, Today, Calendar, Chart)"
echo "   - Resize to mobile (400px) to test responsive design"
echo ""
echo "📖 For detailed guide, read: COMPLETE_DEPLOYMENT_GUIDE.md"
echo ""
echo "Happy testing! 🚀"
