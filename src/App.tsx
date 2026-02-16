import { Connector } from './types/connector';
import connectorsData from './data/connectors.json';

const connectors = connectorsData as Connector[];

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Connector Catalog
        </h1>
        <p className="text-xl text-gray-700">
          {connectors.length} connectors loaded
        </p>
      </div>
    </div>
  );
}

export default App;
