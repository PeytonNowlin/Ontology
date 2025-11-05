"""Data models for database ontology."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ColumnModel(BaseModel):
    """Represents a database column."""
    
    name: str
    data_type: str
    is_nullable: bool
    default_value: Optional[str] = None
    character_maximum_length: Optional[int] = None
    numeric_precision: Optional[int] = None
    numeric_scale: Optional[int] = None
    column_key: Optional[str] = None  # PRI, UNI, MUL
    extra: Optional[str] = None  # auto_increment, etc.
    column_comment: Optional[str] = None


class IndexModel(BaseModel):
    """Represents a database index."""
    
    name: str
    column_names: List[str]
    is_unique: bool
    index_type: str  # BTREE, HASH, etc.


class ForeignKeyModel(BaseModel):
    """Represents a foreign key relationship."""
    
    constraint_name: str
    column_name: str
    referenced_table_schema: str
    referenced_table_name: str
    referenced_column_name: str
    update_rule: Optional[str] = None
    delete_rule: Optional[str] = None


class TableModel(BaseModel):
    """Represents a database table."""
    
    name: str
    table_type: str  # BASE TABLE, VIEW
    engine: Optional[str] = None
    row_count: Optional[int] = None
    data_length: Optional[int] = None
    index_length: Optional[int] = None
    table_comment: Optional[str] = None
    columns: List[ColumnModel] = Field(default_factory=list)
    indexes: List[IndexModel] = Field(default_factory=list)
    foreign_keys: List[ForeignKeyModel] = Field(default_factory=list)
    primary_key_columns: List[str] = Field(default_factory=list)


class DatabaseModel(BaseModel):
    """Represents a database instance."""
    
    name: str
    host: str
    port: int
    tables: List[TableModel] = Field(default_factory=list)
    character_set: Optional[str] = None
    collation: Optional[str] = None


class RelationshipModel(BaseModel):
    """Represents a relationship between tables."""
    
    source_database: str
    source_table: str
    source_column: str
    target_database: str
    target_table: str
    target_column: str
    constraint_name: str
    relationship_type: str = "foreign_key"


class OntologyModel(BaseModel):
    """Complete ontology containing all databases and relationships."""
    
    databases: List[DatabaseModel] = Field(default_factory=list)
    relationships: List[RelationshipModel] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return self.model_dump()
    
    def get_database(self, name: str) -> Optional[DatabaseModel]:
        """Get database by name."""
        for db in self.databases:
            if db.name == name:
                return db
        return None
    
    def get_table(self, database_name: str, table_name: str) -> Optional[TableModel]:
        """Get table by database and table name."""
        db = self.get_database(database_name)
        if db:
            for table in db.tables:
                if table.name == table_name:
                    return table
        return None

