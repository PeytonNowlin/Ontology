import { useCallback, useEffect, useState } from 'react';
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
import DatabaseNode from './nodes/DatabaseNode';
import TableNode from './nodes/TableNode';
import { Maximize2, Minimize2 } from 'lucide-react';
import './GraphView.css';

const nodeTypes = {
  database: DatabaseNode,
  table: TableNode,
};

interface GraphViewProps {
  ontology: Ontology;
  selectedNode: SelectedNode | null;
  onSelectNode: (node: SelectedNode) => void;
  searchQuery: string;
}

export default function GraphView({
  ontology,
  selectedNode,
  onSelectNode,
  searchQuery,
}: GraphViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(new Set());
  const [focusedTable, setFocusedTable] = useState<string | null>(null);
  const [showAllNodes, setShowAllNodes] = useState(false);

  const toggleDatabaseExpansion = useCallback((dbName: string) => {
    setExpandedDatabases(prev => {
      const next = new Set(prev);
      if (next.has(dbName)) {
        next.delete(dbName);
      } else {
        next.add(dbName);
      }
      return next;
    });
    setFocusedTable(null);
  }, []);

  const generateCollapsedLayout = useCallback(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];
    
    const dbSpacing = 400;
    const startX = 200;

    ontology.databases.forEach((db, dbIndex) => {
      const dbX = startX + dbIndex * dbSpacing;
      const dbY = 200;
      const isExpanded = expandedDatabases.has(db.name) || showAllNodes;

      // Add database node
      nodeList.push({
        id: `db-${db.name}`,
        type: 'database',
        position: { x: dbX, y: dbY },
        data: {
          label: db.name,
          database: db,
          isSelected: selectedNode?.type === 'database' && selectedNode.database === db.name,
          onSelect: () => {
            onSelectNode({ type: 'database', database: db.name });
            toggleDatabaseExpansion(db.name);
          },
          isExpanded,
        },
      });

      // Add table nodes only if database is expanded
      if (isExpanded) {
        const tableSpacing = 220;
        const tablesPerRow = Math.min(5, Math.ceil(Math.sqrt(db.tables.length)));

        db.tables.forEach((table, tableIndex) => {
          const row = Math.floor(tableIndex / tablesPerRow);
          const col = tableIndex % tablesPerRow;
          const tableX = dbX - ((tablesPerRow - 1) * tableSpacing) / 2 + col * tableSpacing;
          const tableY = dbY + 200 + row * 160;

          const isSelected =
            selectedNode?.type === 'table' &&
            selectedNode.database === db.name &&
            selectedNode.table === table.name;

          const isFocused = focusedTable === `${db.name}.${table.name}`;

          nodeList.push({
            id: `table-${db.name}-${table.name}`,
            type: 'table',
            position: { x: tableX, y: tableY },
            data: {
              label: table.name,
              table,
              database: db.name,
              isSelected,
              isFocused,
              onSelect: () => {
                onSelectNode({ type: 'table', database: db.name, table: table.name });
                setFocusedTable(`${db.name}.${table.name}`);
              },
            },
          });

          // Add edge from database to table
          edgeList.push({
            id: `edge-db-${db.name}-table-${table.name}`,
            source: `db-${db.name}`,
            target: `table-${db.name}-${table.name}`,
            type: 'smoothstep',
            animated: false,
            style: { stroke: 'rgba(148, 163, 184, 0.2)', strokeWidth: 1 },
          });
        });
      }
    });

    // Add relationship edges for focused table
    if (focusedTable && !showAllNodes) {
      const [dbName, tableName] = focusedTable.split('.');
      ontology.relationships.forEach((rel, index) => {
        const isSourceMatch = rel.source_database === dbName && rel.source_table === tableName;
        const isTargetMatch = rel.target_database === dbName && rel.target_table === tableName;

        if (isSourceMatch || isTargetMatch) {
          const sourceId = `table-${rel.source_database}-${rel.source_table}`;
          const targetId = `table-${rel.target_database}-${rel.target_table}`;

          // Check if both nodes exist
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
            });
          }
        }
      });
    }

    // Add all relationship edges if showing all nodes
    if (showAllNodes) {
      ontology.relationships.forEach((rel, index) => {
        const sourceId = `table-${rel.source_database}-${rel.source_table}`;
        const targetId = `table-${rel.target_database}-${rel.target_table}`;

        if (nodeList.some(n => n.id === sourceId) && nodeList.some(n => n.id === targetId)) {
          edgeList.push({
            id: `rel-${index}`,
            source: sourceId,
            target: targetId,
            type: 'smoothstep',
            animated: false,
            style: { stroke: 'var(--accent-blue)', strokeWidth: 1.5 },
            label: rel.source_column,
            labelStyle: { fill: 'var(--text-secondary)', fontSize: 9 },
            labelBgStyle: { fill: 'var(--bg-tertiary)' },
          });
        }
      });
    }

    return { nodes: nodeList, edges: edgeList };
  }, [ontology, selectedNode, onSelectNode, expandedDatabases, focusedTable, showAllNodes, toggleDatabaseExpansion]);


  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = generateCollapsedLayout();

    // Filter by search query
    let filteredNodes = newNodes;
    let filteredEdges = newEdges;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredNodes = newNodes.filter(node => {
        if (node.data.label.toLowerCase().includes(query)) return true;
        if (node.data.database?.toLowerCase().includes(query)) return true;
        return false;
      });

      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredEdges = newEdges.filter(
        edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
      );
    }

    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [generateCollapsedLayout, searchQuery, setNodes, setEdges]);

  return (
    <div className="graph-view">
      <div className="graph-controls">
        <button
          className="expand-toggle-button"
          onClick={() => setShowAllNodes(!showAllNodes)}
          title={showAllNodes ? 'Collapse All' : 'Expand All'}
        >
          {showAllNodes ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          <span>{showAllNodes ? 'Collapse All' : 'Expand All'}</span>
        </button>
        {!showAllNodes && expandedDatabases.size > 0 && (
          <div className="expand-info">
            {expandedDatabases.size} database{expandedDatabases.size !== 1 ? 's' : ''} expanded
          </div>
        )}
      </div>
      
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
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
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
          nodeColor={(node) => {
            if (node.type === 'database') return 'var(--node-database)';
            if (node.type === 'table') return 'var(--node-table)';
            return 'var(--text-tertiary)';
          }}
        />
      </ReactFlow>
    </div>
  );
}

