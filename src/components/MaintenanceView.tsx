import { Client } from '../types';

export function MaintenanceView({ client, onBack }: { client: Client, onBack: () => void }) {
    return (
        <div className="maintenance-container">
            {/* Header: Navigation + Title + Main Action */}
            <div className="maintenance-header">
                <div className="header-left">
                    <button className="btn-icon" onClick={onBack} title="Retour">
                        &larr;
                    </button>
                    <h1>{client.name}</h1>
                </div>
                <button className="btn-primary action-btn">
                    + Nouveau Rapport
                </button>
            </div>

            <div className="maintenance-layout">
                {/* Main Content: History */}
                <div className="main-section">
                    <h2>Historique des maintenances</h2>
                    <div className="history-placeholder">
                        <p>Aucun rapport effectué récemment.</p>
                        {/* Future history items will go here */}
                    </div>
                </div>

                {/* Sidebar: Workstations (Minimal Details) */}
                <div className="side-section">
                    <h3>Parc Informatique <span className="count">({client.workstations.length})</span></h3>
                    <ul className="mini-ws-list">
                        {client.workstations.map(ws => (
                            <li key={ws.id} className="mini-ws-item">
                                <span className="ws-name">{ws.name}</span>
                                <span className={`ws-dot ${ws.type.toLowerCase()}`} title={ws.type}></span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
