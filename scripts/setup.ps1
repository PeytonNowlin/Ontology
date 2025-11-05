# Setup script for Database Ontology Mapper (Windows PowerShell)

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Database Ontology Mapper - Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.8 or higher." -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16 or higher." -ForegroundColor Red
    exit 1
}

# Create virtual environment
Write-Host ""
Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
python -m venv venv
Write-Host "✓ Virtual environment created" -ForegroundColor Green

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate.ps1

# Install Python dependencies
Write-Host ""
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt
Write-Host "✓ Python dependencies installed" -ForegroundColor Green

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

# Build frontend
Write-Host ""
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build
Write-Host "✓ Frontend built successfully" -ForegroundColor Green

Set-Location ..

# Create .env if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host ""
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "✓ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Please edit .env file with your database credentials" -ForegroundColor Yellow
}

# Create output directory
New-Item -ItemType Directory -Force -Path output | Out-Null

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "✓ Setup complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Edit .env file with your database credentials"
Write-Host "2. Run: .\venv\Scripts\Activate.ps1"
Write-Host "3. Run: python -m src.main extract"
Write-Host "4. Run: python -m src.main serve"
Write-Host "5. Open: http://localhost:8000"
Write-Host ""

