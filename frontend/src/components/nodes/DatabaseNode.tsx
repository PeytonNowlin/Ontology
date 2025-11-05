import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Database } from 'lucide-react';
import './DatabaseNode.css';

interface DatabaseNodeProps {
  data: {
    label: string;
    database: any;
    isSelected: boolean;
    onSelect: () => void;
  };
}

export default memo(function DatabaseNode({ data }: DatabaseNodeProps) {
  return (
    <div
      className={`custom-node database-node ${data.isSelected ? 'selected' : ''}`}
      onClick={data.onSelect}
    >
      <div className="node-header">
        <Database size={20} className="node-icon" />
        <div className="node-title">{data.label}</div>
      </div>
      <div className="node-content">
        <div className="node-stat">
          <span className="stat-value">{data.database.tables.length}</span>
          <span className="stat-label">tables</span>
        </div>
        <div className="node-info">
          <span className="info-label">{data.database.host}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="custom-handle" />
    </div>
  );
});

