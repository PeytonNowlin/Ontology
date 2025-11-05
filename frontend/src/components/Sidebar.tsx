import { useState } from 'react';
import { ChevronRight, ChevronDown, Database as DatabaseIcon, Table as TableIcon, Columns } from 'lucide-react';
import { Database } from '../types';
import { SelectedNode } from '../App';
import './Sidebar.css';

interface SidebarProps {
  databases: Database[];
  selectedNode: SelectedNode | null;
  onSelectNode: (node: SelectedNode) => void;
  searchQuery: string;
  fullWidth?: boolean;
}

export default function Sidebar({
  databases,
  selectedNode,
  onSelectNode,
  searchQuery,
  fullWidth = false,
}: SidebarProps) {
  const [expandedDatabases, setExpandedDatabases] = useState<Set<string>>(
    new Set(databases.map(db => db.name))
  );
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const toggleDatabase = (dbName: string) => {
    setExpandedDatabases(prev => {
      const next = new Set(prev);
      if (next.has(dbName)) {
        next.delete(dbName);
      } else {
        next.add(dbName);
      }
      return next;
    });
  };

  const toggleTable = (key: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const filterDatabases = () => {
    if (!searchQuery) return databases;
    
    const query = searchQuery.toLowerCase();
    return databases.filter(db => {
      if (db.name.toLowerCase().includes(query)) return true;
      return db.tables.some(table => {
        if (table.name.toLowerCase().includes(query)) return true;
        return table.columns.some(col => col.name.toLowerCase().includes(query));
      });
    });
  };

  const filterTables = (db: Database) => {
    if (!searchQuery) return db.tables;
    
    const query = searchQuery.toLowerCase();
    return db.tables.filter(table => {
      if (table.name.toLowerCase().includes(query)) return true;
      return table.columns.some(col => col.name.toLowerCase().includes(query));
    });
  };

  const filteredDatabases = filterDatabases();

  return (
    <div className={`sidebar glass ${fullWidth ? 'sidebar-full-width' : ''}`}>
      <div className="sidebar-header">
        <h2>Schema Explorer</h2>
        <span className="db-count">{filteredDatabases.length} databases</span>
      </div>
      
      <div className="sidebar-content">
        {filteredDatabases.map(database => {
          const isExpanded = expandedDatabases.has(database.name);
          const filteredTables = filterTables(database);
          
          return (
            <div key={database.name} className="tree-item">
              <div
                className={`tree-node database-node ${
                  selectedNode?.type === 'database' && selectedNode.database === database.name
                    ? 'selected'
                    : ''
                }`}
                onClick={() => {
                  toggleDatabase(database.name);
                  onSelectNode({ type: 'database', database: database.name });
                }}
              >
                <button className="expand-button" onClick={(e) => {
                  e.stopPropagation();
                  toggleDatabase(database.name);
                }}>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <DatabaseIcon size={16} className="node-icon database-icon" />
                <span className="node-label">{database.name}</span>
                <span className="node-badge">{database.tables.length}</span>
              </div>
              
              {isExpanded && (
                <div className="tree-children">
                  {filteredTables.map(table => {
                    const tableKey = `${database.name}.${table.name}`;
                    const isTableExpanded = expandedTables.has(tableKey);
                    
                    return (
                      <div key={tableKey} className="tree-item">
                        <div
                          className={`tree-node table-node ${
                            selectedNode?.type === 'table' &&
                            selectedNode.database === database.name &&
                            selectedNode.table === table.name
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() => {
                            toggleTable(tableKey);
                            onSelectNode({
                              type: 'table',
                              database: database.name,
                              table: table.name,
                            });
                          }}
                        >
                          <button className="expand-button" onClick={(e) => {
                            e.stopPropagation();
                            toggleTable(tableKey);
                          }}>
                            {isTableExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <TableIcon size={14} className="node-icon table-icon" />
                          <span className="node-label">{table.name}</span>
                          <span className="node-badge">{table.columns.length}</span>
                        </div>
                        
                        {isTableExpanded && (
                          <div className="tree-children">
                            {table.columns.map(column => (
                              <div
                                key={column.name}
                                className={`tree-node column-node ${
                                  selectedNode?.type === 'column' &&
                                  selectedNode.database === database.name &&
                                  selectedNode.table === table.name &&
                                  selectedNode.column === column.name
                                    ? 'selected'
                                    : ''
                                }`}
                                onClick={() =>
                                  onSelectNode({
                                    type: 'column',
                                    database: database.name,
                                    table: table.name,
                                    column: column.name,
                                  })
                                }
                              >
                                <Columns size={12} className="node-icon column-icon" />
                                <span className="node-label">{column.name}</span>
                                <span className="column-type">{column.data_type}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

