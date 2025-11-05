import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Ontology } from '../types';
import { SelectedNode } from '../App';
import TableNode from './nodes/TableNode';
import { ChevronUp, ChevronDown } from 'lucide-react';
import './LineageView.css';

const nodeTypes = {
  table: TableNode,
};

interface LineageViewProps {
  ontology: Ontology;
  selectedNode: SelectedNode | null;
  onSelectNode: (node: SelectedNode) => void;
  searchQuery: string;
}

export default function LineageView({
  ontology,
  selectedNode,
  onSelectNode,
}: LineageViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [depth, setDepth] = useState(1);
  const [direction, setDirection] = useState<'upstream' | 'downstream' | 'both'>('both');

  // Get relationships for a specific table
  const getTableRelationships = useCallback(
    (dbName: string, tableName: string, currentDepth: number, visited: Set<string>): Array<{ db: string; table: string; depth: number; direction: 'source' | 'target' }> => {
      if (currentDepth > depth) return [];
      
      const key = `${dbName}.${tableName}`;
      if (visited.has(key)) return [];
      visited.add(key);

      const related: Array<{ db: string; table: string; depth: number; direction: 'source' | 'target' }> = [];

      ontology.relationships.forEach(rel => {
        // Downstream: tables this table references
        if (
          (direction === 'downstream' || direction === 'both') &&
          rel.source_database === dbName &&
          rel.source_table === tableName
        ) {
          related.push({
            db: rel.target_database,
            table: rel.target_table,
            depth: currentDepth,
            direction: 'target',
          });
          
          if (currentDepth < depth) {
            const nested = getTableRelationships(
              rel.target_database,
              rel.target_table,
              currentDepth + 1,
              new Set(visited)
            );
            related.push(...nested);
          }
        }

        // Upstream: tables that reference this table
        if (
          (direction === 'upstream' || direction === 'both') &&
          rel.target_database === dbName &&
          rel.target_table === tableName
        ) {
          related.push({
            db: rel.source_database,
            table: rel.source_table,
            depth: currentDepth,
            direction: 'source',
          });
          
          if (currentDepth < depth) {
            const nested = getTableRelationships(
              rel.source_database,
              rel.source_table,
              currentDepth + 1,
              new Set(visited)
            );
            related.push(...nested);
          }
        }
      });

      return related;
    },
    [ontology, depth, direction]
  );

  const generateLineageLayout = useCallback(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];

    if (!selectedNode || selectedNode.type !== 'table') {
      return { nodes: nodeList, edges: edgeList };
    }

    const centerX = 800;
    const centerY = 400;
    const layerSpacing = 300;

    // Add center node
    const database = ontology.databases.find(db => db.name === selectedNode.database);
    const table = database?.tables.find(t => t.name === selectedNode.table);

    if (!table || !database) {
      return { nodes: nodeList, edges: edgeList };
    }

        nodeList.push({
          id: `table-${selectedNode.database}-${selectedNode.table}`,
          type: 'table',
          position: { x: centerX, y: centerY },
          data: {
            label: selectedNode.table || '',
            table,
            database: selectedNode.database,
            isSelected: true,
            onSelect: () => onSelectNode(selectedNode),
          },
        });

    // Get all related tables
    const related = getTableRelationships(
      selectedNode.database,
      selectedNode.table || '',
      1,
      new Set()
    );

    // Group by depth and direction
    const upstream: Map<number, Array<{ db: string; table: string }>> = new Map();
    const downstream: Map<number, Array<{ db: string; table: string }>> = new Map();

    related.forEach(rel => {
      const map = rel.direction === 'source' ? upstream : downstream;
      if (!map.has(rel.depth)) {
        map.set(rel.depth, []);
      }
      const key = `${rel.db}.${rel.table}`;
      const existing = map.get(rel.depth)!;
      if (!existing.some(item => `${item.db}.${item.table}` === key)) {
        existing.push({ db: rel.db, table: rel.table });
      }
    });

    // Position upstream nodes (left)
    upstream.forEach((tables, depthLevel) => {
      const x = centerX - layerSpacing * depthLevel;
      const ySpacing = 180;
      const startY = centerY - ((tables.length - 1) * ySpacing) / 2;

      tables.forEach((item, index) => {
        const y = startY + index * ySpacing;
        const db = ontology.databases.find(d => d.name === item.db);
        const tbl = db?.tables.find(t => t.name === item.table);

        if (tbl && db) {
          nodeList.push({
            id: `table-${item.db}-${item.table}`,
            type: 'table',
            position: { x, y },
            data: {
              label: item.table,
              table: tbl,
              database: item.db,
              isSelected: false,
              onSelect: () => onSelectNode({ type: 'table', database: item.db, table: item.table }),
            },
          });
        }
      });
    });

    // Position downstream nodes (right)
    downstream.forEach((tables, depthLevel) => {
      const x = centerX + layerSpacing * depthLevel;
      const ySpacing = 180;
      const startY = centerY - ((tables.length - 1) * ySpacing) / 2;

      tables.forEach((item, index) => {
        const y = startY + index * ySpacing;
        const db = ontology.databases.find(d => d.name === item.db);
        const tbl = db?.tables.find(t => t.name === item.table);

        if (tbl && db) {
          nodeList.push({
            id: `table-${item.db}-${item.table}`,
            type: 'table',
            position: { x, y },
            data: {
              label: item.table,
              table: tbl,
              database: item.db,
              isSelected: false,
              onSelect: () => onSelectNode({ type: 'table', database: item.db, table: item.table }),
            },
          });
        }
      });
    });

    // Add edges
    ontology.relationships.forEach((rel, index) => {
      const sourceId = `table-${rel.source_database}-${rel.source_table}`;
      const targetId = `table-${rel.target_database}-${rel.target_table}`;

      if (nodeList.some(n => n.id === sourceId) && nodeList.some(n => n.id === targetId)) {
        edgeList.push({
          id: `rel-${index}`,
          source: sourceId,
          target: targetId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--accent-blue)', strokeWidth: 2 },
          label: rel.source_column,
          labelStyle: { fill: 'var(--text-secondary)', fontSize: 10 },
          labelBgStyle: { fill: 'var(--bg-tertiary)' },
          markerEnd: 'arrow',
        });
      }
    });

    return { nodes: nodeList, edges: edgeList };
  }, [ontology, selectedNode, onSelectNode, getTableRelationships]);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateLineageLayout();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [generateLineageLayout, setNodes, setEdges]);

  const hasSelection = selectedNode?.type === 'table';

  return (
    <div className="lineage-view">
      <div className="lineage-controls">
        <div className="control-group">
          <label>Direction:</label>
          <div className="button-group">
            <button
              className={direction === 'upstream' ? 'active' : ''}
              onClick={() => setDirection('upstream')}
            >
              <ChevronUp size={16} />
              Upstream
            </button>
            <button
              className={direction === 'both' ? 'active' : ''}
              onClick={() => setDirection('both')}
            >
              Both
            </button>
            <button
              className={direction === 'downstream' ? 'active' : ''}
              onClick={() => setDirection('downstream')}
            >
              <ChevronDown size={16} />
              Downstream
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Depth:</label>
          <div className="button-group">
            {[1, 2, 3].map(d => (
              <button
                key={d}
                className={depth === d ? 'active' : ''}
                onClick={() => setDepth(d)}
              >
                {d} hop{d > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!hasSelection ? (
        <div className="lineage-placeholder">
          <p>Select a table from the sidebar or list view to view its lineage</p>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="rgba(148, 163, 184, 0.1)" gap={16} />
          <Controls
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-primary)',
              borderRadius: '10px',
            }}
          />
          <MiniMap
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-primary)',
              borderRadius: '10px',
            }}
            nodeColor={() => 'var(--node-table)'}
          />
        </ReactFlow>
      )}
    </div>
  );
}

