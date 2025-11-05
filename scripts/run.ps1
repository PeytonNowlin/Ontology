# Quick run script for Database Ontology Mapper (Windows PowerShell)

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Check if ontology exists
if (-not (Test-Path output\ontology.json)) {
    Write-Host "Ontology not found. Running extraction..." -ForegroundColor Yellow
    python -m src.main extract
}

# Start server
Write-Host "Starting Database Ontology Mapper..." -ForegroundColor Cyan
python -m src.main serve

