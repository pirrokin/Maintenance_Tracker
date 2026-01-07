import { useState, useEffect } from 'react';
import { Client } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function ClientList({ onSelectClient }: { onSelectClient: (client: Client) => void }) {
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        const data = await window.db.getClients();
        setClients(data);
    };

    const handleCreateClient = async () => {
        const name = prompt("Nom de l'entreprise :");
        if (!name) return;

        const newClient: Client = {
            id: uuidv4(),
            name,
            workstations: []
        };

        await window.db.saveClient(newClient);
        loadClients();
    };

    return (
        <div className="client-list-container">
            <div className="header">
                <h2>Mes Clients</h2>
                <button className="btn-primary" onClick={handleCreateClient}>
                    + Nouvelle Entreprise
                </button>
            </div>

            <div className="grid">
                {clients.map(client => (
                    <div key={client.id} className="card-client" onClick={() => onSelectClient(client)}>
                        <h3>{client.name}</h3>
                        <p>{client.workstations.length} postes</p>
                    </div>
                ))}

                {clients.length === 0 && (
                    <p className="empty-msg">Aucune entreprise. Cliquez sur "Nouvelle Entreprise" pour commencer.</p>
                )}
            </div>
        </div>
    );
}
