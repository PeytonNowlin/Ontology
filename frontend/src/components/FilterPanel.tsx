import { X, Database, Table, Link, TrendingUp, Columns } from 'lucide-react';
import { FilterState } from '../types';
import { Ontology } from '../types';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  ontology: Ontology;
  onClose: () => void;
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  ontology,
  onClose,
}: FilterPanelProps) {
  const allDatabases = ontology.databases.map(db => db.name);
  const allTableTypes = Array.from(
    new Set(
      ontology.databases.flatMap(db => db.tables.map(t => t.table_type))
    )
  );

  const toggleDatabase = (dbName: string) => {
    const newDatabases = filters.databases.includes(dbName)
      ? filters.databases.filter(d => d !== dbName)
      : [...filters.databases, dbName];
    onFiltersChange({ ...filters, databases: newDatabases });
  };

  const toggleTableType = (type: string) => {
    const newTypes = filters.tableTypes.includes(type)
      ? filters.tableTypes.filter(t => t !== type)
      : [...filters.tableTypes, type];
    onFiltersChange({ ...filters, tableTypes: newTypes });
  };

  const setRelationshipFilter = (value: boolean | null) => {
    onFiltersChange({ ...filters, hasRelationships: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      databases: [],
      tableTypes: [],
      hasRelationships: null,
      rowCountMin: null,
      rowCountMax: null,
      columnCountMin: null,
      columnCountMax: null,
    });
  };

  const activeFilterCount =
    filters.databases.length +
    filters.tableTypes.length +
    (filters.hasRelationships !== null ? 1 : 0) +
    (filters.rowCountMin !== null ? 1 : 0) +
    (filters.rowCountMax !== null ? 1 : 0) +
    (filters.columnCountMin !== null ? 1 : 0) +
    (filters.columnCountMax !== null ? 1 : 0);

  return (
    <div className="filter-panel glass">
      <div className="filter-header">
        <div className="filter-title-row">
          <h2>Filters</h2>
          {activeFilterCount > 0 && (
            <span className="filter-count">{activeFilterCount} active</span>
          )}
        </div>
        <div className="filter-actions">
          {activeFilterCount > 0 && (
            <button className="clear-filters-button" onClick={clearAllFilters}>
              Clear All
            </button>
          )}
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="filter-content">
        {/* Database Filter */}
        <div className="filter-section">
          <h3>
            <Database size={16} />
            Databases
          </h3>
          <div className="filter-options">
            {allDatabases.map(db => (
              <label key={db} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.databases.includes(db)}
                  onChange={() => toggleDatabase(db)}
                />
                <span>{db}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Table Type Filter */}
        <div className="filter-section">
          <h3>
            <Table size={16} />
            Table Types
          </h3>
          <div className="filter-options">
            {allTableTypes.map(type => (
              <label key={type} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.tableTypes.includes(type)}
                  onChange={() => toggleTableType(type)}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Relationship Filter */}
        <div className="filter-section">
          <h3>
            <Link size={16} />
            Relationships
          </h3>
          <div className="filter-options">
            <label className="filter-radio">
              <input
                type="radio"
                name="relationships"
                checked={filters.hasRelationships === null}
                onChange={() => setRelationshipFilter(null)}
              />
              <span>All Tables</span>
            </label>
            <label className="filter-radio">
              <input
                type="radio"
                name="relationships"
                checked={filters.hasRelationships === true}
                onChange={() => setRelationshipFilter(true)}
              />
              <span>Has Relationships</span>
            </label>
            <label className="filter-radio">
              <input
                type="radio"
                name="relationships"
                checked={filters.hasRelationships === false}
                onChange={() => setRelationshipFilter(false)}
              />
              <span>No Relationships</span>
            </label>
          </div>
        </div>

        {/* Row Count Filter */}
        <div className="filter-section">
          <h3>
            <TrendingUp size={16} />
            Row Count
          </h3>
          <div className="filter-range">
            <input
              type="number"
              placeholder="Min"
              value={filters.rowCountMin ?? ''}
              onChange={e =>
                onFiltersChange({
                  ...filters,
                  rowCountMin: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.rowCountMax ?? ''}
              onChange={e =>
                onFiltersChange({
                  ...filters,
                  rowCountMax: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
          </div>
        </div>

        {/* Column Count Filter */}
        <div className="filter-section">
          <h3>
            <Columns size={16} />
            Column Count
          </h3>
          <div className="filter-range">
            <input
              type="number"
              placeholder="Min"
              value={filters.columnCountMin ?? ''}
              onChange={e =>
                onFiltersChange({
                  ...filters,
                  columnCountMin: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.columnCountMax ?? ''}
              onChange={e =>
                onFiltersChange({
                  ...filters,
                  columnCountMax: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

