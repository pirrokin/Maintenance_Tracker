import { useState } from 'react';
import { Client, MaintenanceReport } from '../types';
import { InterventionForm } from './InterventionForm';

export function MaintenanceView({ client, onBack }: { client: Client, onBack: () => void }) {
    const [showForm, setShowForm] = useState(false);

    const handleSaveReport = async (report: MaintenanceReport) => {
        console.log("Génération du rapport...", report);
        try {
            const result = await window.db.generateReport(report);
            if (result.success) {
                alert(`Rapport enregistré avec succès !\nEmplacement : ${result.filePath}`);
                setShowForm(false);
            } else {
                alert("Annulé ou erreur lors de l'enregistrement.");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la génération du PDF.");
        }
    };

    return (
        <div className="maintenance-container">
            {showForm && (
                <InterventionForm
                    client={client}
                    onClose={() => setShowForm(false)}
                    onSave={handleSaveReport}
                />
            )}

            {/* Header: Navigation + Title + Main Action */}
            <div className="maintenance-header">
                <div className="header-left">
                    <button className="btn-icon" onClick={onBack} title="Retour">
                        &larr;
                    </button>
                    <h1>{client.name}</h1>
                </div>
                <button className="btn-primary action-btn" onClick={() => setShowForm(true)}>
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
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
