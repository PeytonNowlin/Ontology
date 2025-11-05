"""FastAPI backend for serving ontology data."""

import os
import json
from typing import Optional
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .models import OntologyModel
from .config import get_app_config


app = FastAPI(
    title="Database Ontology Mapper API",
    description="API for database schema visualization",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
_ontology: Optional[OntologyModel] = None
_config = get_app_config()


def load_ontology() -> OntologyModel:
    """Load ontology from output file."""
    global _ontology
    
    if _ontology:
        return _ontology
    
    output_file = Path(_config.output_dir) / "ontology.json"
    
    if not output_file.exists():
        raise HTTPException(
            status_code=404,
            detail="Ontology not found. Please run extraction first."
        )
    
    try:
        with open(output_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            _ontology = OntologyModel(**data)
            return _ontology
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error loading ontology: {str(e)}"
        )




@app.get("/api/ontology")
async def get_ontology():
    """Get complete ontology data."""
    ontology = load_ontology()
    return ontology.to_dict()


@app.get("/api/databases")
async def get_databases():
    """Get list of databases."""
    ontology = load_ontology()
    return [
        {
            "name": db.name,
            "host": db.host,
            "port": db.port,
            "table_count": len(db.tables),
            "character_set": db.character_set,
            "collation": db.collation
        }
        for db in ontology.databases
    ]


@app.get("/api/databases/{database_name}")
async def get_database(database_name: str):
    """Get specific database details."""
    ontology = load_ontology()
    database = ontology.get_database(database_name)
    
    if not database:
        raise HTTPException(status_code=404, detail="Database not found")
    
    return database.model_dump()


@app.get("/api/databases/{database_name}/tables/{table_name}")
async def get_table(database_name: str, table_name: str):
    """Get specific table details."""
    ontology = load_ontology()
    table = ontology.get_table(database_name, table_name)
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    return table.model_dump()


@app.get("/api/relationships")
async def get_relationships():
    """Get all relationships."""
    ontology = load_ontology()
    return [rel.model_dump() for rel in ontology.relationships]


@app.get("/api/search")
async def search(q: str):
    """Search for tables, columns, or databases by name."""
    ontology = load_ontology()
    results = {
        "databases": [],
        "tables": [],
        "columns": []
    }
    
    query = q.lower()
    
    for db in ontology.databases:
        # Search databases
        if query in db.name.lower():
            results["databases"].append({
                "database": db.name,
                "host": db.host
            })
        
        # Search tables and columns
        for table in db.tables:
            if query in table.name.lower():
                results["tables"].append({
                    "database": db.name,
                    "table": table.name,
                    "type": table.table_type
                })
            
            for column in table.columns:
                if query in column.name.lower():
                    results["columns"].append({
                        "database": db.name,
                        "table": table.name,
                        "column": column.name,
                        "type": column.data_type
                    })
    
    return results


@app.get("/api/stats")
async def get_stats():
    """Get ontology statistics."""
    ontology = load_ontology()
    
    total_tables = sum(len(db.tables) for db in ontology.databases)
    total_columns = sum(
        len(table.columns) 
        for db in ontology.databases 
        for table in db.tables
    )
    
    return {
        "database_count": len(ontology.databases),
        "table_count": total_tables,
        "column_count": total_columns,
        "relationship_count": len(ontology.relationships),
        "metadata": ontology.metadata
    }


# Serve frontend static files
frontend_dir = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dir.exists():
    app.mount("/assets", StaticFiles(directory=frontend_dir / "assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend application."""
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404)
        
        index_file = frontend_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        raise HTTPException(status_code=404)
else:
    # If frontend not built, show API status at root
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "Database Ontology Mapper API",
            "status": "running",
            "note": "Frontend not built. Run 'cd frontend && npm run build' to build the UI."
        }

