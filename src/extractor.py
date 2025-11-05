"""Database schema extraction using INFORMATION_SCHEMA queries."""

import pymysql
from typing import List, Optional
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from .config import DatabaseConfig
from .models import (
    DatabaseModel, TableModel, ColumnModel, 
    IndexModel, ForeignKeyModel, OntologyModel, RelationshipModel
)


class SchemaExtractor:
    """Extracts schema information from MySQL/MariaDB databases."""
    
    def __init__(self, config: DatabaseConfig):
        """Initialize extractor with database configuration."""
        self.config = config
        self.engine = None
    
    def connect(self) -> bool:
        """
        Establish database connection and verify read-only access.
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            self.engine = create_engine(
                self.config.get_connection_string(),
                pool_pre_ping=True,
                pool_recycle=3600
            )
            
            # Test connection
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                result.fetchone()
            
            return True
        except SQLAlchemyError as e:
            print(f"Failed to connect to {self.config.get_display_name()}: {e}")
            return False
    
    def disconnect(self):
        """Close database connection."""
        if self.engine:
            self.engine.dispose()
            self.engine = None
    
    def extract_columns(self, table_name: str) -> List[ColumnModel]:
        """Extract column information for a table."""
        query = text("""
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                COLUMN_DEFAULT,
                CHARACTER_MAXIMUM_LENGTH,
                NUMERIC_PRECISION,
                NUMERIC_SCALE,
                COLUMN_KEY,
                EXTRA,
                COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = :schema
            AND TABLE_NAME = :table_name
            ORDER BY ORDINAL_POSITION
        """)
        
        columns = []
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema": self.config.name, "table_name": table_name})
            for row in result:
                column = ColumnModel(
                    name=row[0],
                    data_type=row[1],
                    is_nullable=(row[2] == 'YES'),
                    default_value=row[3],
                    character_maximum_length=row[4],
                    numeric_precision=row[5],
                    numeric_scale=row[6],
                    column_key=row[7] if row[7] else None,
                    extra=row[8] if row[8] else None,
                    column_comment=row[9] if row[9] else None
                )
                columns.append(column)
        
        return columns
    
    def extract_indexes(self, table_name: str) -> List[IndexModel]:
        """Extract index information for a table."""
        query = text("""
            SELECT 
                INDEX_NAME,
                GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX SEPARATOR ',') as COLUMNS,
                MAX(NON_UNIQUE) as NON_UNIQUE,
                INDEX_TYPE
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = :schema
            AND TABLE_NAME = :table_name
            GROUP BY INDEX_NAME, INDEX_TYPE
        """)
        
        indexes = []
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema": self.config.name, "table_name": table_name})
            for row in result:
                # Skip primary key (it's handled separately)
                if row[0] == 'PRIMARY':
                    continue
                
                index = IndexModel(
                    name=row[0],
                    column_names=row[1].split(','),
                    is_unique=(row[2] == 0),
                    index_type=row[3]
                )
                indexes.append(index)
        
        return indexes
    
    def extract_foreign_keys(self, table_name: str) -> List[ForeignKeyModel]:
        """Extract foreign key information for a table."""
        query = text("""
            SELECT 
                kcu.CONSTRAINT_NAME,
                kcu.COLUMN_NAME,
                kcu.REFERENCED_TABLE_SCHEMA,
                kcu.REFERENCED_TABLE_NAME,
                kcu.REFERENCED_COLUMN_NAME,
                COALESCE(rc.UPDATE_RULE, 'NO ACTION') as UPDATE_RULE,
                COALESCE(rc.DELETE_RULE, 'NO ACTION') as DELETE_RULE
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
            LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
                ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
                AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
            WHERE kcu.TABLE_SCHEMA = :schema
            AND kcu.TABLE_NAME = :table_name
            AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY kcu.ORDINAL_POSITION
        """)
        
        foreign_keys = []
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema": self.config.name, "table_name": table_name})
            for row in result:
                fk = ForeignKeyModel(
                    constraint_name=row[0],
                    column_name=row[1],
                    referenced_table_schema=row[2],
                    referenced_table_name=row[3],
                    referenced_column_name=row[4],
                    update_rule=row[5],
                    delete_rule=row[6]
                )
                foreign_keys.append(fk)
        
        return foreign_keys
    
    def extract_primary_key_columns(self, table_name: str) -> List[str]:
        """Extract primary key column names for a table."""
        query = text("""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = :schema
            AND TABLE_NAME = :table_name
            AND INDEX_NAME = 'PRIMARY'
            ORDER BY SEQ_IN_INDEX
        """)
        
        pk_columns = []
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema": self.config.name, "table_name": table_name})
            for row in result:
                pk_columns.append(row[0])
        
        return pk_columns
    
    def extract_tables(self) -> List[TableModel]:
        """Extract all tables and views from the database."""
        query = text("""
            SELECT 
                TABLE_NAME,
                TABLE_TYPE,
                ENGINE,
                TABLE_ROWS,
                DATA_LENGTH,
                INDEX_LENGTH,
                TABLE_COMMENT
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = :schema
            ORDER BY TABLE_NAME
        """)
        
        tables = []
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema": self.config.name})
            for row in result:
                table_name = row[0]
                
                # Extract detailed information for this table
                columns = self.extract_columns(table_name)
                indexes = self.extract_indexes(table_name)
                foreign_keys = self.extract_foreign_keys(table_name)
                primary_key_columns = self.extract_primary_key_columns(table_name)
                
                table = TableModel(
                    name=table_name,
                    table_type=row[1],
                    engine=row[2],
                    row_count=row[3],
                    data_length=row[4],
                    index_length=row[5],
                    table_comment=row[6] if row[6] else None,
                    columns=columns,
                    indexes=indexes,
                    foreign_keys=foreign_keys,
                    primary_key_columns=primary_key_columns
                )
                tables.append(table)
        
        return tables
    
    def extract_database_info(self) -> DatabaseModel:
        """Extract complete database schema information."""
        # Get database character set and collation
        query = text("""
            SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
            FROM INFORMATION_SCHEMA.SCHEMATA
            WHERE SCHEMA_NAME = :schema
        """)
        
        character_set = None
        collation = None
        
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema": self.config.name})
            row = result.fetchone()
            if row:
                character_set = row[0]
                collation = row[1]
        
        # Extract all tables
        tables = self.extract_tables()
        
        database = DatabaseModel(
            name=self.config.name,
            host=self.config.host,
            port=self.config.port,
            tables=tables,
            character_set=character_set,
            collation=collation
        )
        
        return database


class OntologyExtractor:
    """Orchestrates schema extraction from multiple databases."""
    
    def __init__(self, database_configs: List[DatabaseConfig]):
        """Initialize with list of database configurations."""
        self.database_configs = database_configs
    
    def extract_ontology(self) -> OntologyModel:
        """
        Extract complete ontology from all configured databases.
        
        Returns:
            OntologyModel containing all databases and relationships
        """
        ontology = OntologyModel(
            metadata={
                "extraction_date": datetime.now().isoformat(),
                "database_count": len(self.database_configs)
            }
        )
        
        # Extract schema from each database
        for config in self.database_configs:
            print(f"Extracting schema from {config.get_display_name()}...")
            
            extractor = SchemaExtractor(config)
            if not extractor.connect():
                print(f"Skipping {config.get_display_name()} due to connection failure")
                continue
            
            try:
                database = extractor.extract_database_info()
                ontology.databases.append(database)
                print(f"  ✓ Extracted {len(database.tables)} tables")
            except Exception as e:
                print(f"Error extracting schema from {config.get_display_name()}: {e}")
            finally:
                extractor.disconnect()
        
        # Build relationships from foreign keys
        self._build_relationships(ontology)
        
        return ontology
    
    def _build_relationships(self, ontology: OntologyModel):
        """Build relationship list from foreign keys."""
        for database in ontology.databases:
            for table in database.tables:
                for fk in table.foreign_keys:
                    relationship = RelationshipModel(
                        source_database=database.name,
                        source_table=table.name,
                        source_column=fk.column_name,
                        target_database=fk.referenced_table_schema,
                        target_table=fk.referenced_table_name,
                        target_column=fk.referenced_column_name,
                        constraint_name=fk.constraint_name,
                        relationship_type="foreign_key"
                    )
                    ontology.relationships.append(relationship)

