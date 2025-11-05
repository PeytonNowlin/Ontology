import { AlertCircle, RefreshCw } from 'lucide-react';
import './ErrorScreen.css';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div className="error-screen">
      <div className="error-content">
        <div className="error-icon">
          <AlertCircle size={64} />
        </div>
        <h2>Unable to Load Ontology</h2>
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={onRetry}>
          <RefreshCw size={18} />
          <span>Retry</span>
        </button>
        <div className="error-hint">
          <p>Make sure you have:</p>
          <ul>
            <li>Run the extraction command: <code>python -m src.main extract</code></li>
            <li>Started the API server: <code>python -m src.main serve</code></li>
            <li>Configured your database connections in <code>.env</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

