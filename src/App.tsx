import { useState } from 'react';
import './App.css';
import { ClientList } from './components/ClientList';
import { MaintenanceView } from './components/MaintenanceView';
import { Client } from './types';

function App() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className="container">
      {!selectedClient ? (
        <ClientList onSelectClient={setSelectedClient} />
      ) : (
        <MaintenanceView client={selectedClient} onBack={() => setSelectedClient(null)} />
      )}
    </div>
  );
}

export default App;
