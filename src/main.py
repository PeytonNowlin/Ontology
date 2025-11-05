"""Main CLI entry point for database ontology mapper."""

import json
import click
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.progress import Progress

from .config import load_database_configs, get_app_config
from .extractor import OntologyExtractor

console = Console()


@click.group()
def cli():
    """Database Ontology Mapper - Discover and visualize database schemas."""
    pass


@cli.command()
@click.option('--output', '-o', default=None, help='Output directory for ontology data')
def extract(output):
    """Extract schema information from configured databases."""
    console.print("[bold blue]Database Ontology Mapper[/bold blue]")
    console.print("=" * 60)
    
    # Load configuration
    db_configs = load_database_configs()
    app_config = get_app_config()
    
    if not db_configs:
        console.print("[red]Error: No database configurations found.[/red]")
        console.print("Please create a .env file with database configurations.")
        console.print("See env.example for the required format.")
        return
    
    console.print(f"\n[green]Found {len(db_configs)} database(s) configured[/green]")
    
    # Display database list
    table = Table(title="Configured Databases")
    table.add_column("ID", style="cyan")
    table.add_column("Name", style="magenta")
    table.add_column("Host", style="green")
    table.add_column("Port", style="yellow")
    
    for config in db_configs:
        table.add_row(
            str(config.id),
            config.name,
            config.host,
            str(config.port)
        )
    
    console.print(table)
    console.print()
    
    # Extract ontology
    with Progress() as progress:
        task = progress.add_task("[cyan]Extracting schemas...", total=len(db_configs))
        
        extractor = OntologyExtractor(db_configs)
        ontology = extractor.extract_ontology()
        
        progress.update(task, completed=len(db_configs))
    
    # Save to file
    output_dir = Path(output) if output else Path(app_config.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / "ontology.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(ontology.to_dict(), f, indent=2, default=str)
    
    console.print(f"\n[green]✓ Ontology saved to {output_file}[/green]")
    
    # Display statistics
    stats_table = Table(title="Extraction Summary")
    stats_table.add_column("Metric", style="cyan")
    stats_table.add_column("Count", style="green", justify="right")
    
    total_tables = sum(len(db.tables) for db in ontology.databases)
    total_columns = sum(
        len(table.columns) 
        for db in ontology.databases 
        for table in db.tables
    )
    
    stats_table.add_row("Databases", str(len(ontology.databases)))
    stats_table.add_row("Tables", str(total_tables))
    stats_table.add_row("Columns", str(total_columns))
    stats_table.add_row("Relationships", str(len(ontology.relationships)))
    
    console.print()
    console.print(stats_table)


@cli.command()
@click.option('--host', '-h', default='0.0.0.0', help='API host')
@click.option('--port', '-p', default=8000, help='API port')
@click.option('--reload', is_flag=True, help='Enable auto-reload')
def serve(host, port, reload):
    """Start the web server for visualization."""
    import uvicorn
    
    console.print("[bold blue]Starting Database Ontology Mapper Server[/bold blue]")
    console.print(f"Server will be available at: [cyan]http://{host}:{port}[/cyan]")
    console.print("Press Ctrl+C to stop the server")
    console.print()
    
    uvicorn.run(
        "src.api:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )


@cli.command()
def list_databases():
    """List all available databases on configured servers."""
    from sqlalchemy import create_engine, text
    
    console.print("[bold blue]Available Databases on Configured Servers[/bold blue]")
    console.print("=" * 60)
    console.print()
    
    db_configs = load_database_configs()
    
    if not db_configs:
        console.print("[red]Error: No database configurations found.[/red]")
        return
    
    # Group by host
    hosts = {}
    for config in db_configs:
        host_key = f"{config.host}:{config.port}"
        if host_key not in hosts:
            hosts[host_key] = []
        hosts[host_key].append(config)
    
    for host_key, configs in hosts.items():
        console.print(f"[cyan]Server: {host_key}[/cyan]")
        
        # Try each config until one works
        connected = False
        for config in configs:
            try:
                console.print(f"Attempting connection with user: {config.user}")
                
                # Connect to server (to 'information_schema' which always exists)
                temp_config = config.model_copy()
                temp_config.name = 'information_schema'
                engine = create_engine(temp_config.get_connection_string(), pool_pre_ping=True)
                
                with engine.connect() as conn:
                    result = conn.execute(text("SHOW DATABASES"))
                    databases = [row[0] for row in result]
                
                engine.dispose()
                
                # Display in a table
                table = Table(title=f"Databases on {host_key}")
                table.add_column("Database Name", style="green")
                table.add_column("In Config?", style="yellow")
                
                configured_names = {c.name for c in configs}
                
                for db_name in sorted(databases):
                    # Skip system databases
                    if db_name in ['information_schema', 'mysql', 'performance_schema', 'sys']:
                        continue
                    
                    in_config = "✓" if db_name in configured_names else ""
                    table.add_row(db_name, in_config)
                
                console.print(table)
                console.print()
                connected = True
                break  # Success, no need to try other configs
                
            except Exception as e:
                console.print(f"[yellow]Failed with user {config.user}: {e}[/yellow]")
                continue
        
        if not connected:
            console.print(f"[red]Could not connect to {host_key} with any configured credentials[/red]")
            console.print()


@cli.command()
@click.option('--input', '-i', default=None, help='Input ontology JSON file')
def stats(input):
    """Display ontology statistics."""
    app_config = get_app_config()
    
    input_file = Path(input) if input else Path(app_config.output_dir) / "ontology.json"
    
    if not input_file.exists():
        console.print(f"[red]Error: Ontology file not found: {input_file}[/red]")
        console.print("Please run 'extract' command first.")
        return
    
    # Load ontology
    with open(input_file, 'r', encoding='utf-8') as f:
        from .models import OntologyModel
        data = json.load(f)
        ontology = OntologyModel(**data)
    
    console.print("[bold blue]Ontology Statistics[/bold blue]")
    console.print("=" * 60)
    console.print()
    
    # Overall stats
    stats_table = Table(title="Overall Statistics")
    stats_table.add_column("Metric", style="cyan")
    stats_table.add_column("Value", style="green", justify="right")
    
    total_tables = sum(len(db.tables) for db in ontology.databases)
    total_columns = sum(
        len(table.columns) 
        for db in ontology.databases 
        for table in db.tables
    )
    
    stats_table.add_row("Databases", str(len(ontology.databases)))
    stats_table.add_row("Tables", str(total_tables))
    stats_table.add_row("Columns", str(total_columns))
    stats_table.add_row("Relationships", str(len(ontology.relationships)))
    
    console.print(stats_table)
    console.print()
    
    # Per-database stats
    db_table = Table(title="Database Details")
    db_table.add_column("Database", style="cyan")
    db_table.add_column("Host", style="magenta")
    db_table.add_column("Tables", style="green", justify="right")
    db_table.add_column("Columns", style="yellow", justify="right")
    
    for db in ontology.databases:
        column_count = sum(len(table.columns) for table in db.tables)
        db_table.add_row(
            db.name,
            db.host,
            str(len(db.tables)),
            str(column_count)
        )
    
    console.print(db_table)


if __name__ == '__main__':
    cli()

