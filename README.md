<div align="center">

# 🗂️ Database Ontology Mapper

**Automatically discover, visualize, and explore database schemas with an elegant, interactive interface**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation) • [License](#-license)

</div>

---

## 📖 About

Database Ontology Mapper is a full-stack application that automatically extracts and visualizes database schemas from multiple MySQL/MariaDB databases. It provides an intuitive, Palantir-inspired interface for exploring complex database structures, making it perfect for:

- 📚 **Documentation** - Automatically generate visual documentation of your database architecture
- 🔍 **Discovery** - Understand unfamiliar database schemas quickly
- 🏗️ **Architecture Review** - Analyze relationships and data flow across multiple databases
- 🎓 **Onboarding** - Help new team members understand database structures
- 🔐 **Auditing** - Review database designs with read-only access

## ✨ Features

### Core Functionality
- 🔍 **Automatic Schema Discovery** - Extract tables, columns, keys, and relationships from MySQL/MariaDB databases
- 🌐 **Multi-Database Support** - Connect to and visualize multiple databases simultaneously
- 🔗 **Relationship Mapping** - Automatically detect and visualize foreign key relationships
- 🔐 **Read-Only Access** - Safe schema extraction using read-only database connections

### User Interface
- 🎨 **Modern UI Design** - Beautiful dark theme with glassmorphism effects inspired by Palantir
- 📊 **Interactive Graph Visualization** - Explore schemas with zoom, pan, and interactive nodes using ReactFlow
- 🔎 **Smart Search** - Find databases, tables, and columns instantly
- 📱 **Responsive Design** - Professional interface with smooth animations via Framer Motion
- 🎯 **Multiple View Modes** - Switch between hierarchical schema view and relationship-focused layouts

### Developer Experience
- 🚀 **REST API** - Programmatic access to all ontology data
- 🛠️ **CLI Interface** - Command-line tools for schema extraction and server management
- 🔄 **Hot Reload** - Development mode with auto-refresh
- 🐳 **Docker Support** - Containerized deployment options

## 🛠️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, high-performance web framework for building APIs
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - Database toolkit and ORM for schema extraction
- **[Pydantic](https://docs.pydantic.dev/)** - Data validation using Python type annotations
- **[Click](https://click.palletsprojects.com/)** - Command-line interface creation

### Frontend
- **[React 18](https://reactjs.org/)** - UI component library with hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[ReactFlow](https://reactflow.dev/)** - Interactive graph visualization library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library for React
- **[Vite](https://vitejs.dev/)** - Next-generation frontend build tool

### Development & Deployment
- **Python 3.8+** with virtual environment
- **Node.js 16+** with npm
- **Docker** (optional) for containerized deployment
- MySQL/MariaDB compatible

## 🚀 Quick Start

Get up and running in under 5 minutes!

### 1️⃣ Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/Ontology.git
cd Ontology

# Backend setup
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install
npm run build
cd ..
```

### 2️⃣ Configure Databases

```bash
# Copy environment template
cp env.example .env

# Edit .env with your database credentials
```

### 3️⃣ Extract and Visualize

```bash
# Extract schema information
python -m src.main extract

# Start the server
python -m src.main serve

# Open http://localhost:8000 in your browser
```

**That's it!** 🎉 You should now see your database schemas visualized in the browser.

---

## 📚 Documentation

## Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL/MariaDB databases with read-only access

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Ontology
```

2. Create and activate a virtual environment:
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Configure database connections:
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your database credentials
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Build the frontend:
```bash
npm run build
```

## Configuration

Edit the `.env` file to configure your database connections:

```env
# Database 1
DB_1_HOST=localhost
DB_1_PORT=3306
DB_1_NAME=database1
DB_1_USER=readonly_user
DB_1_PASSWORD=your_password

# Database 2
DB_2_HOST=db2.example.com
DB_2_PORT=3306
DB_2_NAME=database2
DB_2_USER=readonly_user
DB_2_PASSWORD=your_password

# Add more databases as needed (DB_3, DB_4, etc.)

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Output Configuration
OUTPUT_DIR=output
```

### Creating Read-Only Users

It's recommended to use read-only database users for security:

```sql
-- MySQL/MariaDB
CREATE USER 'readonly_user'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT ON database_name.* TO 'readonly_user'@'%';
GRANT SELECT ON information_schema.* TO 'readonly_user'@'%';
FLUSH PRIVILEGES;
```

## Usage

### 1. Extract Schema Information

First, extract schema information from your configured databases:

```bash
python -m src.main extract
```

This will:
- Connect to all configured databases
- Extract schema information (tables, columns, keys, relationships)
- Save the ontology data to `output/ontology.json`

Options:
```bash
# Specify custom output directory
python -m src.main extract --output /path/to/output
```

### 2. Start the Web Server

Launch the visualization server:

```bash
python -m src.main serve
```

Options:
```bash
# Custom host and port
python -m src.main serve --host 0.0.0.0 --port 8000

# Enable auto-reload for development
python -m src.main serve --reload
```

### 3. View the Ontology

Open your browser and navigate to:
```
http://localhost:8000
```

### Additional Commands

View ontology statistics:
```bash
python -m src.main stats
```

## UI Features

### Top Bar
- **Search** - Find databases, tables, and columns
- **Stats** - View database, table, and relationship counts
- **View Modes** - Switch between Schema and Relationships views

### Left Sidebar
- **Schema Explorer** - Browse databases, tables, and columns in a tree view
- **Expandable Nodes** - Click to expand/collapse database and table nodes
- **Badge Counts** - See table and column counts at a glance

### Graph View
- **Interactive Nodes** - Click nodes to view details
- **Zoom & Pan** - Explore large schemas with smooth navigation
- **MiniMap** - Overview of the entire graph
- **Schema View** - Hierarchical layout showing databases and tables
- **Relationships View** - Circular layout emphasizing foreign key relationships

### Detail Panel
- **Database Details** - Host, port, table count, character set
- **Table Details** - Columns, primary keys, foreign keys, indexes
- **Column Details** - Data type, nullable, default value, constraints
- **Relationship Info** - Foreign key references and rules

## API Endpoints

The backend provides a REST API for programmatic access:

- `GET /api/ontology` - Complete ontology data
- `GET /api/databases` - List all databases
- `GET /api/databases/{name}` - Get specific database
- `GET /api/databases/{db}/tables/{table}` - Get specific table
- `GET /api/relationships` - All relationships
- `GET /api/search?q={query}` - Search databases, tables, columns
- `GET /api/stats` - Ontology statistics

## Development

### Frontend Development

For frontend development with hot reload:

```bash
cd frontend
npm run dev
```

This starts a development server at `http://localhost:5173` with proxy to the backend.

### Project Structure

```
Ontology/
├── src/
│   ├── __init__.py
│   ├── api.py              # FastAPI backend
│   ├── config.py           # Configuration management
│   ├── extractor.py        # Schema extraction logic
│   ├── models.py           # Pydantic data models
│   └── main.py             # CLI entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api.ts          # API client
│   │   ├── types.ts        # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.ts
├── requirements.txt
├── .env.example
└── README.md
```

## Troubleshooting

### "No ontology data available" error
- Make sure you've run `python -m src.main extract` first
- Check that the `output/ontology.json` file exists
- Verify database credentials in `.env` are correct

### Connection failures
- Verify database host and port are accessible
- Check that read-only user has proper permissions
- Ensure firewall rules allow connections

### Frontend not loading
- Rebuild the frontend: `cd frontend && npm run build`
- Check that the API server is running
- Clear browser cache

## 🤝 Contributing

Contributions are welcome and appreciated! Whether you're fixing bugs, adding features, or improving documentation, your help makes this project better.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for full details.

### MIT License Summary

```
Copyright (c) 2024 Database Ontology Mapper

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

**In plain English:** You can freely use, modify, and distribute this software for any purpose, including commercial applications, as long as you include the original copyright notice.

---

## 🙏 Acknowledgments

- **UI Design** - Inspired by [Palantir Foundry](https://www.palantir.com/platforms/foundry/) data visualization tools
- **Graph Visualization** - Powered by [ReactFlow](https://reactflow.dev/)
- **Icons** - [Lucide React](https://lucide.dev/) icon library
- **Built With** - React, TypeScript, FastAPI, SQLAlchemy


