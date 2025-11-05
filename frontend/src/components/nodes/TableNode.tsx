import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Table, Key } from 'lucide-react';
import './TableNode.css';

interface TableNodeProps {
  data: {
    label: string;
    table: any;
    database: string;
    isSelected: boolean;
    onSelect: () => void;
  };
}

export default memo(function TableNode({ data }: TableNodeProps) {
  const primaryKeys = data.table.primary_key_columns || [];
  const foreignKeys = data.table.foreign_keys || [];

  return (
    <div
      className={`custom-node table-node ${data.isSelected ? 'selected' : ''}`}
      onClick={data.onSelect}
    >
      <Handle type="target" position={Position.Top} className="custom-handle" />
      
      <div className="node-header">
        <Table size={16} className="node-icon" />
        <div className="node-title">{data.label}</div>
      </div>
      
      <div className="node-content">
        <div className="table-stats">
          <div className="table-stat-item">
            <span className="stat-value">{data.table.columns.length}</span>
            <span className="stat-label">cols</span>
          </div>
          {primaryKeys.length > 0 && (
            <div className="table-stat-item">
              <Key size={12} />
              <span className="stat-label">{primaryKeys.length} PK</span>
            </div>
          )}
          {foreignKeys.length > 0 && (
            <div className="table-stat-item">
              <span className="stat-label">{foreignKeys.length} FK</span>
            </div>
          )}
        </div>
        
        {data.table.row_count !== null && data.table.row_count !== undefined && (
          <div className="row-count">
            {data.table.row_count.toLocaleString()} rows
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
});

