<div align="center">

# Database Ontology Mapper

**Enterprise-grade automated schema discovery and topological mapping for relational database architectures.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Website](https://img.shields.io/badge/Website-nowlinautomation.com-orange?logo=google-chrome&logoColor=white)](https://nowlinautomation.com)

[System Overview](#system-overview) • [Core Capabilities](#core-capabilities) • [Architecture & Tech Stack](#architecture--tech-stack) • [Deployment & Execution](#deployment--execution) • [API Integration](#api-integration) • [Developer](#developer) • [License](#license)

</div>

---

## System Overview

Database Ontology Mapper is a full-stack platform engineered to automatically extract, model, and visualize the semantic layer of complex relational databases. Built for enterprise environments, it establishes a read-only connection to existing data infrastructure to generate intuitive, interactive topological maps of schema architectures.

The system facilitates rapid knowledge transfer, architectural auditing, and data governance by transforming disparate database schemas into a centralized, explorable ontology graph.

### Target Applications
- **Architectural Auditing:** Conduct comprehensive reviews of database relationships and data lineage across multi-database environments.
- **Automated Documentation:** Replace static schema documents with a living, automatically generated visual ontology.
- **Enterprise Onboarding:** Accelerate developer and analyst understanding of complex, legacy database structures.
- **Secure Discovery:** Utilize strictly read-only connections to ensure safe exploration without risk to production workloads.

## Core Capabilities

### Schema Discovery Engine
- **Automated Extraction:** Programmatically identify and catalog tables, columns, primary keys, and indices from MySQL/MariaDB instances.
- **Topological Mapping:** Automatically detect and map foreign key constraints to establish complex relationship graphs.
- **Multi-Tenant Support:** Concurrently interface with and aggregate schemas from multiple disparate database environments.

### Visualization & Interface
- **Interactive Graph Rendering:** High-performance, zoomable, and pannable node-edge visualizations of data structures.
- **Adaptive Layouts:** Toggle between hierarchical schema representations and relationship-centric topologies.
- **Advanced Global Search:** Instantly query across the entire ontology for specific databases, tables, or column entities.

### Integration & Extensibility
- **RESTful Architecture:** Exposes a robust API for programmatic access to the extracted ontology data.
- **Container-Ready:** Architected for seamless deployment via Docker in continuous integration pipelines.

## Architecture & Tech Stack

The platform utilizes a decoupled architecture, separating the computationally intensive extraction engine from the client-side rendering application.

### Backend Infrastructure
- **FastAPI:** High-performance asynchronous API framework.
- **SQLAlchemy:** Enterprise-grade database toolkit utilized for connection pooling and metadata extraction.
- **Pydantic:** Strict data validation and settings management using Python type hinting.
- **Click:** Command-line interface orchestration for administrative operations.

### Frontend Application
- **React 18 & TypeScript:** Strongly typed, component-based user interface framework.
- **ReactFlow:** Specialized library for rendering complex node-based graphs and interactive diagrams.
- **Framer Motion:** Declarative animation library for fluid state transitions.
- **Vite:** Next-generation frontend build tooling for optimized asset delivery.

## Deployment & Execution

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Target MySQL/MariaDB database with explicitly granted read-only access.

### 1. Repository Initialization

Clone the repository and configure the backend virtual environment:

```bash
git clone https://github.com/yourusername/Ontology.git
cd Ontology

python -m venv venv
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

pip install -r requirements.txt
```

Initialize the frontend environment:

```bash
cd frontend
npm install
npm run build
cd ..
```

### 2. Environment Configuration

Define the target database endpoints by modifying the environment configuration:

```bash
cp env.example .env
```

Edit the `.env` file with the appropriate connection parameters:

```env
# Target Database Node 1
DB_1_HOST=localhost
DB_1_PORT=3306
DB_1_NAME=database1
DB_1_USER=readonly_user
DB_1_PASSWORD=your_password

# Target Database Node 2
DB_2_HOST=db2.example.com
DB_2_PORT=3306
DB_2_NAME=database2
DB_2_USER=readonly_user
DB_2_PASSWORD=your_password

# Application Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
OUTPUT_DIR=output
```

*Security Note: It is strictly recommended to execute the extraction using an isolated user with `SELECT` permissions restricted solely to the target schema and `information_schema`.*

### 3. Execution Pipeline

Execute the schema extraction process:

```bash
python -m src.main extract
```
*This process connects to the specified endpoints, constructs the relationship graph, and serializes the ontology to `output/ontology.json`.*

Initialize the application server:

```bash
python -m src.main serve
```

The application interface will be accessible via **http://localhost:8000**.

## API Integration

The application exposes a standard REST API for direct access to the semantic model:

- `GET /api/ontology` - Retrieve the complete aggregated schema topology.
- `GET /api/databases` - Enumerate all discovered database instances.
- `GET /api/databases/{name}` - Retrieve specific database metadata.
- `GET /api/databases/{db}/tables/{table}` - Retrieve schema definition for a specific table.
- `GET /api/relationships` - Retrieve the global edge list of foreign key references.
- `GET /api/search?q={query}` - Execute a global textual search across all entities.
- `GET /api/stats` - Retrieve aggregate ontology metrics.

## Development

The project structure is organized to cleanly separate concerns between extraction, API serving, and client rendering:

```text
Ontology/
├── src/
│   ├── api.py              # FastAPI service definitions
│   ├── config.py           # Environment and state configuration
│   ├── extractor.py        # Core schema discovery and mapping logic
│   ├── models.py           # Pydantic data schemas
│   └── main.py             # CLI application entrypoint
├── frontend/               # React/Vite SPA application
├── requirements.txt        # Python dependency manifest
└── .env.example            # Environment configuration template
```

To run the frontend in development mode with hot-module replacement (HMR):

```bash
cd frontend
npm run dev
```

## Contributing

We welcome contributions to the Database Ontology Mapper. Please follow standard pull request workflows. All code submissions must pass existing CI checks and adhere to the project's typing and style guidelines.

## Developer

**Peyton Nowlin**

- Contact: [Peyton@nowlinautomation.com](mailto:Peyton@nowlinautomation.com)
- Web: [nowlinautomation.com](https://nowlinautomation.com)

## License

This software is distributed under the **MIT License**. Refer to the [LICENSE](LICENSE) file for the complete terms of distribution and usage.

### Acknowledgments

- Interface conceptualization inspired by enterprise data integration platforms such as Palantir Foundry.
- Graph rendering engine powered by ReactFlow.
