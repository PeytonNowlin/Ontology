import { motion } from 'framer-motion';
import { X, Database, Table, Columns, Key, Link2, Info } from 'lucide-react';
import { Ontology } from '../types';
import { SelectedNode } from '../App';
import './DetailPanel.css';

interface DetailPanelProps {
  selectedNode: SelectedNode;
  ontology: Ontology;
  onClose: () => void;
  onSelectNode: (node: SelectedNode) => void;
}

export default function DetailPanel({ selectedNode, ontology, onClose, onSelectNode }: DetailPanelProps) {
  const renderDatabaseDetails = () => {
    const database = ontology.databases.find(db => db.name === selectedNode.database);
    if (!database) return null;

    const totalColumns = database.tables.reduce((sum, t) => sum + t.columns.length, 0);

    return (
      <>
        <div className="detail-header">
          <div className="detail-title-row">
            <Database size={24} className="detail-icon database-icon" />
            <h2>{database.name}</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h3>Overview</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="item-label">Host</span>
                <span className="item-value">{database.host}:{database.port}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">Tables</span>
                <span className="item-value">{database.tables.length}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">Total Columns</span>
                <span className="item-value">{totalColumns}</span>
              </div>
              {database.character_set && (
                <div className="detail-item">
                  <span className="item-label">Character Set</span>
                  <span className="item-value">{database.character_set}</span>
                </div>
              )}
              {database.collation && (
                <div className="detail-item">
                  <span className="item-label">Collation</span>
                  <span className="item-value">{database.collation}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>Tables</h3>
            <div className="table-list">
              {database.tables.map(table => (
                <div key={table.name} className="table-list-item">
                  <Table size={16} />
                  <span>{table.name}</span>
                  <span className="table-col-count">{table.columns.length} cols</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderTableDetails = () => {
    const database = ontology.databases.find(db => db.name === selectedNode.database);
    const table = database?.tables.find(t => t.name === selectedNode.table);
    if (!table) return null;

    // Find relationships
    const outgoingRelationships = ontology.relationships.filter(
      rel => rel.source_database === selectedNode.database && rel.source_table === selectedNode.table
    );
    const incomingRelationships = ontology.relationships.filter(
      rel => rel.target_database === selectedNode.database && rel.target_table === selectedNode.table
    );

    return (
      <>
        <div className="detail-header">
          <div className="detail-title-row">
            <Table size={24} className="detail-icon table-icon" />
            <div>
              <h2>{table.name}</h2>
              <p className="detail-subtitle">{selectedNode.database}</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h3>Overview</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="item-label">Type</span>
                <span className="item-value">{table.table_type}</span>
              </div>
              {table.engine && (
                <div className="detail-item">
                  <span className="item-label">Engine</span>
                  <span className="item-value">{table.engine}</span>
                </div>
              )}
              {table.row_count !== null && table.row_count !== undefined && (
                <div className="detail-item">
                  <span className="item-label">Rows</span>
                  <span className="item-value">{table.row_count.toLocaleString()}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="item-label">Columns</span>
                <span className="item-value">{table.columns.length}</span>
              </div>
            </div>
          </div>

          {table.primary_key_columns.length > 0 && (
            <div className="detail-section">
              <h3><Key size={16} /> Primary Key</h3>
              <div className="key-list">
                {table.primary_key_columns.map(col => (
                  <div key={col} className="key-item primary-key">
                    {col}
                  </div>
                ))}
              </div>
            </div>
          )}

          {table.foreign_keys.length > 0 && (
            <div className="detail-section">
              <h3><Link2 size={16} /> Foreign Keys</h3>
              <div className="fk-list">
                {table.foreign_keys.map((fk, idx) => (
                  <div key={idx} className="fk-item">
                    <div className="fk-column">{fk.column_name}</div>
                    <div className="fk-arrow">→</div>
                    <div className="fk-reference">
                      {fk.referenced_table_schema}.{fk.referenced_table_name}.{fk.referenced_column_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3><Columns size={16} /> Columns</h3>
            <div className="column-list">
              {table.columns.map(column => (
                <div key={column.name} className="column-item">
                  <div className="column-header">
                    <span className="column-name">{column.name}</span>
                    <span className="column-type">{column.data_type}</span>
                  </div>
                  <div className="column-meta">
                    {column.column_key === 'PRI' && <span className="column-badge primary">PK</span>}
                    {column.column_key === 'UNI' && <span className="column-badge unique">UNIQUE</span>}
                    {!column.is_nullable && <span className="column-badge required">NOT NULL</span>}
                    {column.extra && <span className="column-badge extra">{column.extra}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {table.table_comment && (
            <div className="detail-section">
              <h3><Info size={16} /> Comment</h3>
              <p className="table-comment">{table.table_comment}</p>
            </div>
          )}

          {(outgoingRelationships.length > 0 || incomingRelationships.length > 0) && (
            <div className="detail-section">
              <h3><Link2 size={16} /> Relationships</h3>
              
              {outgoingRelationships.length > 0 && (
                <div className="relationship-group">
                  <h4>References ({outgoingRelationships.length})</h4>
                  <div className="relationship-list">
                    {outgoingRelationships.map((rel, idx) => (
                      <div
                        key={`out-${idx}`}
                        className="relationship-item clickable"
                        onClick={() => onSelectNode({
                          type: 'table',
                          database: rel.target_database,
                          table: rel.target_table,
                        })}
                      >
                        <div className="relationship-source">
                          <span className="rel-column">{rel.source_column}</span>
                        </div>
                        <div className="relationship-arrow">→</div>
                        <div className="relationship-target">
                          <span className="rel-table">
                            {rel.target_database}.{rel.target_table}
                          </span>
                          <span className="rel-column">{rel.target_column}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {incomingRelationships.length > 0 && (
                <div className="relationship-group">
                  <h4>Referenced By ({incomingRelationships.length})</h4>
                  <div className="relationship-list">
                    {incomingRelationships.map((rel, idx) => (
                      <div
                        key={`in-${idx}`}
                        className="relationship-item clickable"
                        onClick={() => onSelectNode({
                          type: 'table',
                          database: rel.source_database,
                          table: rel.source_table,
                        })}
                      >
                        <div className="relationship-source">
                          <span className="rel-table">
                            {rel.source_database}.{rel.source_table}
                          </span>
                          <span className="rel-column">{rel.source_column}</span>
                        </div>
                        <div className="relationship-arrow">→</div>
                        <div className="relationship-target">
                          <span className="rel-column">{rel.target_column}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderColumnDetails = () => {
    const database = ontology.databases.find(db => db.name === selectedNode.database);
    const table = database?.tables.find(t => t.name === selectedNode.table);
    const column = table?.columns.find(c => c.name === selectedNode.column);
    if (!column) return null;

    return (
      <>
        <div className="detail-header">
          <div className="detail-title-row">
            <Columns size={24} className="detail-icon column-icon" />
            <div>
              <h2>{column.name}</h2>
              <p className="detail-subtitle">{selectedNode.database}.{selectedNode.table}</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h3>Properties</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="item-label">Data Type</span>
                <span className="item-value code">{column.data_type}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">Nullable</span>
                <span className="item-value">{column.is_nullable ? 'Yes' : 'No'}</span>
              </div>
              {column.default_value !== null && column.default_value !== undefined && (
                <div className="detail-item">
                  <span className="item-label">Default</span>
                  <span className="item-value code">{column.default_value}</span>
                </div>
              )}
              {column.character_maximum_length && (
                <div className="detail-item">
                  <span className="item-label">Max Length</span>
                  <span className="item-value">{column.character_maximum_length}</span>
                </div>
              )}
              {column.numeric_precision && (
                <div className="detail-item">
                  <span className="item-label">Precision</span>
                  <span className="item-value">{column.numeric_precision}</span>
                </div>
              )}
              {column.column_key && (
                <div className="detail-item">
                  <span className="item-label">Key</span>
                  <span className="item-value">{column.column_key}</span>
                </div>
              )}
              {column.extra && (
                <div className="detail-item">
                  <span className="item-label">Extra</span>
                  <span className="item-value">{column.extra}</span>
                </div>
              )}
            </div>
          </div>

          {column.column_comment && (
            <div className="detail-section">
              <h3><Info size={16} /> Comment</h3>
              <p className="table-comment">{column.column_comment}</p>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderContent = () => {
    switch (selectedNode.type) {
      case 'database':
        return renderDatabaseDetails();
      case 'table':
        return renderTableDetails();
      case 'column':
        return renderColumnDetails();
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="detail-panel glass"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {renderContent()}
    </motion.div>
  );
}

