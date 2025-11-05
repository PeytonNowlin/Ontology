import { Home, ChevronRight, Database, Table, Columns } from 'lucide-react';
import { SelectedNode } from '../App';
import './Breadcrumbs.css';

interface BreadcrumbsProps {
  selectedNode: SelectedNode | null;
  onSelectNode: (node: SelectedNode | null) => void;
}

export default function Breadcrumbs({ selectedNode, onSelectNode }: BreadcrumbsProps) {
  if (!selectedNode) return null;

  return (
    <div className="breadcrumbs">
      <button className="breadcrumb-item" onClick={() => onSelectNode(null)}>
        <Home size={14} />
        <span>Home</span>
      </button>
      
      <ChevronRight size={14} className="breadcrumb-separator" />
      
      <button
        className="breadcrumb-item"
        onClick={() => onSelectNode({ type: 'database', database: selectedNode.database })}
      >
        <Database size={14} />
        <span>{selectedNode.database}</span>
      </button>
      
      {selectedNode.table && (
        <>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <button
            className="breadcrumb-item"
            onClick={() => onSelectNode({ type: 'table', database: selectedNode.database, table: selectedNode.table })}
          >
            <Table size={14} />
            <span>{selectedNode.table}</span>
          </button>
        </>
      )}
      
      {selectedNode.column && (
        <>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <div className="breadcrumb-item active">
            <Columns size={14} />
            <span>{selectedNode.column}</span>
          </div>
        </>
      )}
    </div>
  );
}

