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

            {/* Top Navigation */}
            <div className="nav-header">
                <button className="btn-back" onClick={onBack}>
                    <span className="icon">←</span> Retour
                </button>
                <button className="btn-primary" onClick={() => setShowForm(true)}>
                    + Nouveau Rapport
                </button>
            </div>

            <div className="dashboard-grid">
                {/* Left Sidebar: Client Info & Assets */}
                <aside className="dashboard-sidebar">
                    <div className="client-card">
                        <div className="client-avatar">
                            {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <h1>{client.name}</h1>
                        <p className="client-detail">{client.address || "Adresse non renseignée"}</p>
                        <div className="client-stats">
                            <div className="stat">
                                <span className="value">{client.workstations.length}</span>
                                <span className="label">Postes</span>
                            </div>
                            <div className="stat">
                                <span className="value">{reports.length}</span>
                                <span className="label">Rapports</span>
                            </div>
                        </div>
                    </div>

                    <div className="assets-section">
                        <h3>Parc Informatique</h3>
                        <div className="assets-list">
                            {client.workstations.map(ws => (
                                <div key={ws.id} className="asset-item">
                                    <span className="asset-icon">💻</span>
                                    <span className="asset-name">{ws.name}</span>
                                    <span className="asset-type">{ws.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content: History Feed */}
                <main className="dashboard-main">
                    <div className="feed-header">
                        <h2>Historique des Interventions</h2>
                    </div>

                    {reports.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📂</div>
                            <p>Aucun rapport d'intervention pour le moment.</p>
                            <button className="btn-secondary" onClick={() => setShowForm(true)}>
                                Créer le premier rapport
                            </button>
                        </div>
                    ) : (
                        <div className="reports-feed">
                            {reports.map((report) => (
                                <div key={report.id || Math.random()} className="report-card">
                                    <div className="report-icon">📄</div>
                                    <div className="report-content">
                                        <div className="report-date">{new Date(report.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        <div className="report-tech">Technicien : <strong>{report.technician}</strong></div>
                                        <div className="report-actions">
                                            <button className="action-link" onClick={() => alert("Relecture bientôt disponible")}>Voir détails</button>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => report.id && handleDeleteReport(e, report.id)}
                                                title="Supprimer"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
