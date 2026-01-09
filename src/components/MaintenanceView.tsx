import { useState, useEffect } from 'react';
import { Client, MaintenanceReport } from '../types';
import { InterventionForm } from './InterventionForm';

export function MaintenanceView({ client, onBack }: { client: Client, onBack: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [reports, setReports] = useState<MaintenanceReport[]>([]);

    useEffect(() => {
        loadReports();
    }, [client.id]);

    const loadReports = async () => {
        try {
            // Fetch reports
            const data = await window.db.getReports(client.id);
            setReports((data || []).reverse());
        } catch (error) {
            console.error("Error loading reports:", error);
            setReports([]);
        }
    };

    const handleSaveReport = async (report: MaintenanceReport) => {
        console.log("Saving & Generating...", report);
        try {
            // Save
            await window.db.saveReport(report);
            loadReports();

            // PDF
            const result = await window.db.generateReport(report);
            if (result.success) {
                alert(`Rapport enregistré et PDF généré avec succès !\nEmplacement : ${result.filePath}`);
                setShowForm(false);
            } else {
                alert("Rapport sauvegardé, mais la génération PDF a été annulée ou a échoué.");
                setShowForm(false);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur technique lors de la sauvegarde.");
        }
    };

    const handleDeleteReport = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Voulez-vous vraiment supprimer ce rapport d'historique ?")) {
            await window.db.deleteReport(id);
            loadReports();
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

            {/* Header */}
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
                {/* History */}
                <div className="main-section">
                    <h2>Historique des maintenances</h2>

                    {reports.length === 0 ? (
                        <div className="history-placeholder">
                            <p>Aucun rapport archivé pour ce client.</p>
                        </div>
                    ) : (
                        <div className="history-list">
                            {reports.map((report) => (
                                <div key={report.id || Math.random()} className="history-card" onClick={() => alert("La relecture du rapport sera disponible prochainement.")}>
                                    <div className="h-info">
                                        <div className="h-date">{report.date}</div>
                                        <div className="h-tech">Technicien: <span className="highlight">{report.technician}</span></div>
                                    </div>
                                    <button
                                        className="btn-icon btn-delete"
                                        onClick={(e) => report.id && handleDeleteReport(e, report.id)}
                                        title="Supprimer ce rapport"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
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
