import { useMemo, useState } from 'react';
import { Database, Table2, Columns, TrendingUp, Link } from 'lucide-react';
import { Ontology } from '../types';
import { SelectedNode } from '../App';
import './ListView.css';

interface ListViewProps {
  ontology: Ontology;
  selectedNode: SelectedNode | null;
  onSelectNode: (node: SelectedNode) => void;
  searchQuery: string;
}

type SortField = 'name' | 'database' | 'rows' | 'columns' | 'relationships';
type SortDirection = 'asc' | 'desc';

interface TableRow {
  database: string;
  tableName: string;
  tableType: string;
  rowCount: number;
  columnCount: number;
  relationshipCount: number;
  hasFK: boolean;
}

export default function ListView({
  ontology,
  selectedNode,
  onSelectNode,
}: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const tableRows = useMemo(() => {
    const rows: TableRow[] = [];
    
    ontology.databases.forEach(db => {
      db.tables.forEach(table => {
        const relationshipCount = ontology.relationships.filter(
          rel =>
            (rel.source_database === db.name && rel.source_table === table.name) ||
            (rel.target_database === db.name && rel.target_table === table.name)
        ).length;

        rows.push({
          database: db.name,
          tableName: table.name,
          tableType: table.table_type,
          rowCount: table.row_count || 0,
          columnCount: table.columns.length,
          relationshipCount,
          hasFK: table.foreign_keys.length > 0,
        });
      });
    });

    // Sort rows
    rows.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.tableName.localeCompare(b.tableName);
          break;
        case 'database':
          comparison = a.database.localeCompare(b.database);
          break;
        case 'rows':
          comparison = a.rowCount - b.rowCount;
          break;
        case 'columns':
          comparison = a.columnCount - b.columnCount;
          break;
        case 'relationships':
          comparison = a.relationshipCount - b.relationshipCount;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return rows;
  }, [ontology, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderHeader = () => (
    <div className="list-header">
      <button
        className={`list-header-cell sortable ${sortField === 'name' ? 'active' : ''}`}
        onClick={() => handleSort('name')}
        style={{ flex: '2' }}
      >
        <Table2 size={16} />
        <span>Table Name</span>
        {sortField === 'name' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </button>
      
      <button
        className={`list-header-cell sortable ${sortField === 'database' ? 'active' : ''}`}
        onClick={() => handleSort('database')}
        style={{ flex: '1.5' }}
      >
        <Database size={16} />
        <span>Database</span>
        {sortField === 'database' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </button>
      
      <div className="list-header-cell" style={{ flex: '1' }}>
        <span>Type</span>
      </div>
      
      <button
        className={`list-header-cell sortable ${sortField === 'rows' ? 'active' : ''}`}
        onClick={() => handleSort('rows')}
        style={{ flex: '0.8' }}
      >
        <TrendingUp size={16} />
        <span>Rows</span>
        {sortField === 'rows' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </button>
      
      <button
        className={`list-header-cell sortable ${sortField === 'columns' ? 'active' : ''}`}
        onClick={() => handleSort('columns')}
        style={{ flex: '0.8' }}
      >
        <Columns size={16} />
        <span>Columns</span>
        {sortField === 'columns' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </button>
      
      <button
        className={`list-header-cell sortable ${sortField === 'relationships' ? 'active' : ''}`}
        onClick={() => handleSort('relationships')}
        style={{ flex: '0.8' }}
      >
        <Link size={16} />
        <span>Relations</span>
        {sortField === 'relationships' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </div>
  );

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = tableRows[index];
    const isSelected =
      selectedNode?.type === 'table' &&
      selectedNode.database === row.database &&
      selectedNode.table === row.tableName;

    return (
      <div
        className={`list-row ${isSelected ? 'selected' : ''}`}
        style={style}
        onClick={() => onSelectNode({ type: 'table', database: row.database, table: row.tableName })}
      >
        <div className="list-cell" style={{ flex: '2' }}>
          <Table2 size={14} className="cell-icon" />
          <span className="cell-text primary">{row.tableName}</span>
        </div>
        
        <div className="list-cell" style={{ flex: '1.5' }}>
          <Database size={14} className="cell-icon database-icon" />
          <span className="cell-text">{row.database}</span>
        </div>
        
        <div className="list-cell" style={{ flex: '1' }}>
          <span className="cell-badge">{row.tableType}</span>
        </div>
        
        <div className="list-cell" style={{ flex: '0.8' }}>
          <span className="cell-text number">{row.rowCount.toLocaleString()}</span>
        </div>
        
        <div className="list-cell" style={{ flex: '0.8' }}>
          <span className="cell-text number">{row.columnCount}</span>
        </div>
        
        <div className="list-cell" style={{ flex: '0.8' }}>
          <span className="cell-text number">
            {row.relationshipCount}
            {row.hasFK && <span className="fk-indicator" title="Has Foreign Keys">FK</span>}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="list-view">
      <div className="list-view-header">
        <h2>All Tables</h2>
        <span className="table-count">{tableRows.length} tables</span>
      </div>
      
      {renderHeader()}
      
      <div className="list-view-body">
        {tableRows.map((row, index) => (
          <Row key={`${row.database}-${row.tableName}`} index={index} style={{ position: 'relative' }} />
        ))}
      </div>
    </div>
  );
}

