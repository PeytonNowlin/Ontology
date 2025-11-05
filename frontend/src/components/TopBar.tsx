import { Search, Database, Table, GitBranch, List, FolderTree, Network, GitFork, Filter } from 'lucide-react';
import { ViewMode } from '../types';
import './TopBar.css';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  stats: {
    databaseCount: number;
    tableCount: number;
    relationshipCount: number;
  };
}

export default function TopBar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  stats,
}: TopBarProps) {
  return (
    <div className="topbar glass">
      <div className="topbar-left">
        <div className="topbar-logo">
          <Database className="logo-icon" size={24} />
          <h1 className="logo-text">Ontology Explorer</h1>
        </div>
        
        <div className="topbar-stats">
          <div className="stat-item">
            <Database size={16} />
            <span>{stats.databaseCount}</span>
            <span className="stat-label">Databases</span>
          </div>
          <div className="stat-item">
            <Table size={16} />
            <span>{stats.tableCount}</span>
            <span className="stat-label">Tables</span>
          </div>
          <div className="stat-item">
            <GitBranch size={16} />
            <span>{stats.relationshipCount}</span>
            <span className="stat-label">Relations</span>
          </div>
        </div>
      </div>
      
      <div className="topbar-center">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search databases, tables, columns..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="topbar-right">
        <button
          className={`filter-toggle-button ${showFilters ? 'active' : ''}`}
          onClick={onToggleFilters}
          title="Toggle Filters"
        >
          <Filter size={18} />
        </button>
        
        <div className="view-mode-toggle">
          <button
            className={`mode-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List View"
          >
            <List size={16} />
            <span>List</span>
          </button>
          <button
            className={`mode-button ${viewMode === 'tree' ? 'active' : ''}`}
            onClick={() => onViewModeChange('tree')}
            title="Tree View"
          >
            <FolderTree size={16} />
            <span>Tree</span>
          </button>
          <button
            className={`mode-button ${viewMode === 'graph' ? 'active' : ''}`}
            onClick={() => onViewModeChange('graph')}
            title="Graph View"
          >
            <Network size={16} />
            <span>Graph</span>
          </button>
          <button
            className={`mode-button ${viewMode === 'lineage' ? 'active' : ''}`}
            onClick={() => onViewModeChange('lineage')}
            title="Lineage View"
          >
            <GitFork size={16} />
            <span>Lineage</span>
          </button>
        </div>
      </div>
    </div>
  );
}

