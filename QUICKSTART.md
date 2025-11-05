# Quick Start Guide

Get up and running with Database Ontology Mapper in 5 minutes!

## Step 1: Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
npm run build
cd ..
```

## Step 2: Configure Databases

Create a `.env` file:

```bash
cp env.example .env
```

Edit `.env` with your database credentials:

```env
DB_1_HOST=localhost
DB_1_PORT=3306
DB_1_NAME=mydb
DB_1_USER=readonly_user
DB_1_PASSWORD=password123
```

## Step 3: Extract Schema

```bash
python -m src.main extract
```

Expected output:
```
Database Ontology Mapper
============================================================

Found 1 database(s) configured

Configured Databases
┏━━━━┳━━━━━━━━┳━━━━━━━━━━━┳━━━━━━┓
║ ID ║ Name   ║ Host      ║ Port ║
┡━━━━╇━━━━━━━━╇━━━━━━━━━━━╇━━━━━━┩
│ 1  │ mydb   │ localhost │ 3306 │
└────┴────────┴───────────┴──────┘

Extracting schema from mydb@localhost...
  ✓ Extracted 15 tables

✓ Ontology saved to output/ontology.json
```

## Step 4: Start the Server

```bash
python -m src.main serve
```

## Step 5: Open in Browser

Navigate to: **http://localhost:8000**

## What's Next?

- Explore the schema in the interactive graph
- Search for specific tables or columns
- Click on nodes to view detailed information
- Switch between Schema and Relationships views
- Export your findings

## Common Issues

### Can't connect to database?
- Check your credentials in `.env`
- Ensure the database is accessible from your machine
- Verify the user has SELECT permissions

### No data showing?
- Make sure you ran `extract` command first
- Check that `output/ontology.json` exists
- Look for error messages in the console

### Frontend not loading?
- Rebuild: `cd frontend && npm run build`
- Check the API is running on port 8000
- Try clearing your browser cache

## Need Help?

See the full [README.md](README.md) for detailed documentation.

