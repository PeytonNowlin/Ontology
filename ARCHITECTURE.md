# Architecture Documentation

## System Overview

The Database Ontology Mapper is a full-stack application designed to automatically discover and visualize database schemas from MySQL/MariaDB databases using read-only connections.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                    (React + TypeScript)                      │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ TopBar   │  │ Sidebar  │  │GraphView │  │  Detail  │   │
│  │          │  │          │  │(ReactFlow│  │  Panel   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     FastAPI Server                           │
│                   (Python Backend)                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   API Endpoints                       │  │
│  │  /api/ontology  /api/databases  /api/search         │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────────┐ │
│  │              OntologyExtractor                        │ │
│  │         (Schema Discovery Engine)                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌─────────┐     ┌─────────┐     ┌─────────┐
    │MySQL DB1│     │MySQL DB2│     │MySQL DB3│
    │(Read    │     │(Read    │     │(Read    │
    │ Only)   │     │ Only)   │     │ Only)   │
    └─────────┘     └─────────┘     └─────────┘
```

## Component Details

### Frontend Layer

#### Technology Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **ReactFlow** - Graph visualization
- **Framer Motion** - Animations
- **Vite** - Build tool

#### Components

1. **App.tsx**
   - Main application container
   - State management for ontology data
   - Routing logic

2. **TopBar**
   - Search functionality
   - View mode toggle (Schema/Relationships)
   - Statistics display

3. **Sidebar**
   - Tree view of databases/tables/columns
   - Expandable/collapsible nodes
   - Search filtering

4. **GraphView**
   - Interactive graph visualization
   - Two layout modes:
     - Schema View: Hierarchical layout
     - Relationships View: Circular layout with FK edges
   - ReactFlow integration

5. **DetailPanel**
   - Detailed entity information
   - Slide-in animation
   - Context-specific content

6. **Custom Nodes**
   - DatabaseNode: Database entity display
   - TableNode: Table entity display

### Backend Layer

#### Technology Stack
- **FastAPI** - Web framework
- **SQLAlchemy** - Database connections
- **Pydantic** - Data validation
- **Click** - CLI interface
- **Rich** - Terminal formatting

#### Modules

1. **main.py**
   - CLI entry point
   - Commands: extract, serve, stats

2. **api.py**
   - FastAPI application
   - REST endpoints
   - CORS configuration
   - Static file serving

3. **extractor.py**
   - Schema extraction logic
   - INFORMATION_SCHEMA queries
   - Connection management

4. **models.py**
   - Pydantic data models
   - Type definitions
   - Serialization logic

5. **config.py**
   - Environment configuration
   - Database connection strings
   - Multi-database support

## Data Flow

### Extraction Flow

```
1. User runs: python -m src.main extract
   │
   ├─> Load database configs from .env
   │
   ├─> For each database:
   │   ├─> Connect with read-only credentials
   │   ├─> Query INFORMATION_SCHEMA
   │   │   ├─> Extract tables
   │   │   ├─> Extract columns
   │   │   ├─> Extract indexes
   │   │   ├─> Extract foreign keys
   │   │   └─> Extract primary keys
   │   └─> Disconnect
   │
   ├─> Build relationship graph
   │
   └─> Save to output/ontology.json
```

### Visualization Flow

```
1. User starts: python -m src.main serve
   │
   ├─> FastAPI server starts on port 8000
   │
2. User opens: http://localhost:8000
   │
   ├─> Frontend loads from static files
   │
   ├─> API call: GET /api/ontology
   │   ├─> Load ontology.json
   │   └─> Return JSON data
   │
   ├─> Generate graph layout
   │   ├─> Create nodes for databases/tables
   │   ├─> Create edges for relationships
   │   └─> Calculate positions
   │
   └─> Render interactive graph
```

## Database Schema Discovery

### INFORMATION_SCHEMA Queries

The system uses MySQL's INFORMATION_SCHEMA to extract metadata:

1. **Tables**: `INFORMATION_SCHEMA.TABLES`
   - Table names, types, engines, row counts

2. **Columns**: `INFORMATION_SCHEMA.COLUMNS`
   - Column names, data types, constraints

3. **Foreign Keys**: `INFORMATION_SCHEMA.KEY_COLUMN_USAGE`
   - FK constraints and references

4. **Indexes**: `INFORMATION_SCHEMA.STATISTICS`
   - Index types, columns, uniqueness

5. **Database Info**: `INFORMATION_SCHEMA.SCHEMATA`
   - Character sets, collations

## Security Considerations

### Read-Only Access
- System designed to use read-only database users
- No write operations performed
- Safe for production databases

### Credentials Management
- Environment variables for configuration
- .env file not committed to git
- Docker secrets support

### Network Security
- HTTPS support via reverse proxy
- CORS configuration for API
- Database connection encryption (TLS)

## Performance Optimizations

### Backend
- Connection pooling with SQLAlchemy
- Batch queries for schema extraction
- Caching of ontology data
- Async API endpoints

### Frontend
- Code splitting with Vite
- Lazy loading of components
- Memoization of expensive computations
- Virtualization for large lists

### Database
- SELECT-only queries
- Efficient INFORMATION_SCHEMA queries
- Connection reuse
- Timeout configurations

## Scalability

### Horizontal Scaling
- Stateless API server
- Multiple instances behind load balancer
- Shared ontology storage (file or database)

### Large Schemas
- Pagination support in API
- Incremental loading in UI
- Search/filter to reduce visible nodes
- Level-of-detail rendering

## Extension Points

### Adding Database Support
1. Create new extractor class
2. Implement schema query methods
3. Register in configuration

### Custom Visualizations
1. Add new view mode in frontend
2. Implement layout algorithm
3. Add UI controls

### Additional Metadata
1. Extend Pydantic models
2. Add extraction queries
3. Update UI components

## Deployment Options

### Local Development
```bash
python -m src.main serve --reload
cd frontend && npm run dev
```

### Production
```bash
# Build frontend
cd frontend && npm run build

# Run with production server
python -m src.main serve
```

### Docker
```bash
docker-compose up -d
```

### Kubernetes
- StatefulSet for API server
- ConfigMap for .env
- Secret for credentials
- Service for load balancing
- Ingress for HTTPS

## Monitoring & Observability

### Logging
- Python logging module
- Request/response logs
- Error tracking
- Performance metrics

### Health Checks
- `/api/stats` endpoint
- Database connectivity
- Ontology file availability

### Metrics
- Request counts
- Response times
- Database query times
- Error rates

## Future Enhancements

1. **Real-time Updates**
   - WebSocket support
   - Live schema changes
   - Collaborative viewing

2. **Advanced Analysis**
   - Data lineage tracking
   - Impact analysis
   - Query optimization suggestions

3. **Multi-Database Support**
   - PostgreSQL
   - Microsoft SQL Server
   - Oracle

4. **Export Formats**
   - PDF reports
   - Markdown documentation
   - GraphML/GEXF

5. **Integration**
   - Slack/Teams notifications
   - CI/CD pipeline integration
   - Data catalog integration

