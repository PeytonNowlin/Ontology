#!/bin/bash
# Setup script for Database Ontology Mapper

set -e

echo "==================================="
echo "Database Ontology Mapper - Setup"
echo "==================================="
echo ""

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✓ Python $PYTHON_VERSION found"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Node.js $NODE_VERSION found"

# Create virtual environment
echo ""
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo "✓ Virtual environment created"

# Install Python dependencies
echo ""
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✓ Python dependencies installed"

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
echo "✓ Frontend dependencies installed"

# Build frontend
echo ""
echo "Building frontend..."
npm run build
echo "✓ Frontend built successfully"

cd ..

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file from template..."
    cp env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  Please edit .env file with your database credentials"
fi

# Create output directory
mkdir -p output

echo ""
echo "==================================="
echo "✓ Setup complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Run: source venv/bin/activate (or venv\\Scripts\\activate on Windows)"
echo "3. Run: python -m src.main extract"
echo "4. Run: python -m src.main serve"
echo "5. Open: http://localhost:8000"
echo ""

