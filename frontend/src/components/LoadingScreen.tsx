import { Database } from 'lucide-react';
import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-icon">
          <Database size={48} />
        </div>
        <h2 className="text-gradient">Loading Ontology</h2>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p>Fetching database schema information...</p>
      </div>
    </div>
  );
}

