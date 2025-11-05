import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import GraphView from './components/GraphView';
import ListView from './components/ListView';
import LineageView from './components/LineageView';
import Breadcrumbs from './components/Breadcrumbs';
import FilterPanel from './components/FilterPanel';
import DetailPanel from './components/DetailPanel';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import { api } from './api';
import { Ontology, ViewMode, FilterState } from './types';
import { useDebounce } from './hooks/useDebounce';
import './App.css';

export interface SelectedNode {
  type: 'database' | 'table' | 'column';
  database: string;
  table?: string;
  column?: string;
}

function App() {
  const [ontology, setOntology] = useState<Ontology | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [filters, setFilters] = useState<FilterState>({
    databases: [],
    tableTypes: [],
    hasRelationships: null,
    rowCountMin: null,
    rowCountMax: null,
    columnCountMin: null,
    columnCountMax: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadOntology();
  }, []);

  const loadOntology = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOntology();
      setOntology(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ontology');
    } finally {
      setLoading(false);
    }
  };

  // Filter ontology data based on active filters
  const filteredOntology = useMemo(() => {
    if (!ontology) return null;

    let filteredDatabases = ontology.databases;

    // Filter by database names
    if (filters.databases.length > 0) {
      filteredDatabases = filteredDatabases.filter(db =>
        filters.databases.includes(db.name)
      );
    }

    // Filter tables within databases
    filteredDatabases = filteredDatabases.map(db => ({
      ...db,
      tables: db.tables.filter(table => {
        // Filter by table type
        if (filters.tableTypes.length > 0 && !filters.tableTypes.includes(table.table_type)) {
          return false;
        }

        // Filter by row count
        if (filters.rowCountMin !== null && (table.row_count || 0) < filters.rowCountMin) {
          return false;
        }
        if (filters.rowCountMax !== null && (table.row_count || 0) > filters.rowCountMax) {
          return false;
        }

        // Filter by column count
        if (filters.columnCountMin !== null && table.columns.length < filters.columnCountMin) {
          return false;
        }
        if (filters.columnCountMax !== null && table.columns.length > filters.columnCountMax) {
          return false;
        }

        // Filter by relationships
        if (filters.hasRelationships !== null) {
          const hasFK = table.foreign_keys.length > 0;
          const isReferenced = ontology.relationships.some(
            rel => rel.target_database === db.name && rel.target_table === table.name
          );
          const hasAnyRelationship = hasFK || isReferenced;
          if (filters.hasRelationships && !hasAnyRelationship) {
            return false;
          }
          if (!filters.hasRelationships && hasAnyRelationship) {
            return false;
          }
        }

        return true;
      }),
    })).filter(db => db.tables.length > 0);

    return {
      ...ontology,
      databases: filteredDatabases,
    };
  }, [ontology, filters]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={loadOntology} />;
  }

  if (!ontology || !filteredOntology) {
    return <ErrorScreen error="No ontology data available" onRetry={loadOntology} />;
  }

  const renderMainView = () => {
    const sharedProps = {
      ontology: filteredOntology,
      selectedNode,
      onSelectNode: setSelectedNode,
      searchQuery: debouncedSearchQuery,
    };

    switch (viewMode) {
      case 'list':
        return <ListView {...sharedProps} />;
      case 'tree':
        return (
          <Sidebar
            databases={filteredOntology.databases}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            searchQuery={debouncedSearchQuery}
            fullWidth={true}
          />
        );
      case 'graph':
        return <GraphView {...sharedProps} />;
      case 'lineage':
        return <LineageView {...sharedProps} />;
      default:
        return <GraphView {...sharedProps} />;
    }
  };

  const totalTableCount = ontology.databases.reduce((sum, db) => sum + db.tables.length, 0);
  const filteredTableCount = filteredOntology.databases.reduce((sum, db) => sum + db.tables.length, 0);

  return (
    <div className="app">
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        stats={{
          databaseCount: filteredOntology.databases.length,
          tableCount: filteredTableCount,
          relationshipCount: ontology.relationships.length,
        }}
      />
      
      <Breadcrumbs selectedNode={selectedNode} onSelectNode={setSelectedNode} />
      
      <div className="app-body">
        {viewMode !== 'tree' && (
          <Sidebar
            databases={filteredOntology.databases}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            searchQuery={debouncedSearchQuery}
            fullWidth={false}
          />
        )}
        
        <div className="main-content">
          {renderMainView()}
          
          {filteredTableCount < totalTableCount && (
            <div className="filter-badge">
              Showing {filteredTableCount} of {totalTableCount} tables
            </div>
          )}
        </div>
        
        <AnimatePresence>
          {selectedNode && (
            <DetailPanel
              selectedNode={selectedNode}
              ontology={filteredOntology}
              onClose={() => setSelectedNode(null)}
              onSelectNode={setSelectedNode}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFilters && (
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              ontology={ontology}
              onClose={() => setShowFilters(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;

