import { useState } from 'react';
import './App.css';
import { ClientList } from './components/ClientList';
import { Client } from './types';

function App() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className="container">
      {!selectedClient ? (
        <ClientList onSelectClient={setSelectedClient} />
      ) : (
        <div>
          <button className="btn-primary" onClick={() => setSelectedClient(null)} style={{ marginBottom: '20px' }}>
            &larr; Retour
          </button>
          <h1>{selectedClient.name}</h1>
          <p>Interface de maintenance à venir...</p>
        </div>
      )}
    </div>
  );
}

export default App;
