import { useState, useEffect } from 'react';
import { Client } from '../types';

export function ClientList({ onSelectClient }: { onSelectClient: (client: Client) => void }) {
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        const data = await window.db.getClients();
        setClients(data);
    };

    return (
        <div className="client-list-container">
            <div className="header">
                <h2>Mes Clients</h2>
            </div>

            <div className="grid">
                {clients.map(client => (
                    <div key={client.id} className="card-client" onClick={() => onSelectClient(client)}>
                        <h3>{client.name}</h3>
                        <p>{client.workstations.length} postes</p>
                    </div>
                ))}

                {clients.length === 0 && (
                    <p className="empty-msg">Aucune entreprise trouvée dans la base de données.</p>
                )}
            </div>
        </div>
    );
}
