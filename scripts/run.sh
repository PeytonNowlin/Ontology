#!/bin/bash
# Quick run script for Database Ontology Mapper

set -e

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Check if ontology exists
if [ ! -f output/ontology.json ]; then
    echo "Ontology not found. Running extraction..."
    python -m src.main extract
fi

# Start server
echo "Starting Database Ontology Mapper..."
python -m src.main serve

