export interface Column {
  name: string;
  data_type: string;
  is_nullable: boolean;
  default_value?: string | null;
  character_maximum_length?: number | null;
  numeric_precision?: number | null;
  numeric_scale?: number | null;
  column_key?: string | null;
  extra?: string | null;
  column_comment?: string | null;
}

export interface Index {
  name: string;
  column_names: string[];
  is_unique: boolean;
  index_type: string;
}

export interface ForeignKey {
  constraint_name: string;
  column_name: string;
  referenced_table_schema: string;
  referenced_table_name: string;
  referenced_column_name: string;
  update_rule?: string | null;
  delete_rule?: string | null;
}

export interface Table {
  name: string;
  table_type: string;
  engine?: string | null;
  row_count?: number | null;
  data_length?: number | null;
  index_length?: number | null;
  table_comment?: string | null;
  columns: Column[];
  indexes: Index[];
  foreign_keys: ForeignKey[];
  primary_key_columns: string[];
}

export interface Database {
  name: string;
  host: string;
  port: number;
  tables: Table[];
  character_set?: string | null;
  collation?: string | null;
}

export interface Relationship {
  source_database: string;
  source_table: string;
  source_column: string;
  target_database: string;
  target_table: string;
  target_column: string;
  constraint_name: string;
  relationship_type: string;
}

export interface Ontology {
  databases: Database[];
  relationships: Relationship[];
  metadata: {
    extraction_date?: string;
    database_count?: number;
    [key: string]: any;
  };
}

export interface Stats {
  database_count: number;
  table_count: number;
  column_count: number;
  relationship_count: number;
  metadata: any;
}

export interface SearchResults {
  databases: Array<{ database: string; host: string }>;
  tables: Array<{ database: string; table: string; type: string }>;
  columns: Array<{ database: string; table: string; column: string; type: string }>;
}

export type ViewMode = 'list' | 'tree' | 'graph' | 'lineage';

export interface FilterState {
  databases: string[];
  tableTypes: string[];
  hasRelationships: boolean | null;
  rowCountMin: number | null;
  rowCountMax: number | null;
  columnCountMin: number | null;
  columnCountMax: number | null;
}

