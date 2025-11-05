import { Ontology, Stats, SearchResults, Database, Table } from './types';

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getOntology: () => fetchAPI<Ontology>('/ontology'),
  
  getDatabases: () => fetchAPI<Database[]>('/databases'),
  
  getDatabase: (name: string) => fetchAPI<Database>(`/databases/${name}`),
  
  getTable: (database: string, table: string) => 
    fetchAPI<Table>(`/databases/${database}/tables/${table}`),
  
  getRelationships: () => fetchAPI('/relationships'),
  
  search: (query: string) => fetchAPI<SearchResults>(`/search?q=${encodeURIComponent(query)}`),
  
  getStats: () => fetchAPI<Stats>('/stats'),
};

