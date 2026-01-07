import { useState, useEffect } from 'react';
import './App.css';
import { ClientList } from './components/ClientList';
import { MaintenanceView } from './components/MaintenanceView';
import SplashScreen from './components/SplashScreen';
import { Client } from './types';

function App() {
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Force minimum splash screen time
  useEffect(() => {
    // The SplashScreen component handles its own timer for the animation (4s)
    // We just pass the callback to finish loading
  }, []);

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

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
