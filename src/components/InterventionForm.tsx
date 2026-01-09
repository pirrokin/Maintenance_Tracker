import { useState } from 'react';
import { Client, WorkstationReport, MaintenanceReport, HDDHealth, AntivirusStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    client: Client;
    onClose: () => void;
    onSave: (report: MaintenanceReport) => void;
}

export function InterventionForm({ client, onClose, onSave }: Props) {
    // State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default today YYYY-MM-DD
    const [technician, setTechnician] = useState('');
    // SMS Global State
    const [globalTabletsCheck, setGlobalTabletsCheck] = useState<boolean | undefined>(undefined);
    const [globalObservations, setGlobalObservations] = useState('');

    // Report State
    const [reportData, setReportData] = useState<Record<string, Partial<WorkstationReport>>>(() => {
        const initial: Record<string, Partial<WorkstationReport>> = {};
        client.workstations.forEach(ws => {
            initial[ws.id] = {
                workstationId: ws.id,
                workstationName: ws.name,
                nasAccess: true,
                windowsUpdates: true,
                hddHealth: 'Bon',

                officeAccess: true,
                eventLogs: true,
                antivirus: 'RAS',
                observations: ''
            };
        });
        return initial;
    });

    const updateField = (wsId: string, field: keyof WorkstationReport, value: any) => {
        setReportData(prev => ({
            ...prev,
            [wsId]: { ...prev[wsId], [field]: value }
        }));
    };

    const handleSubmit = () => {
        if (!technician.trim()) {
            alert("Veuillez renseigner le responsable de la maintenance.");
            return;
        }

        const fullReport: MaintenanceReport = {
            id: uuidv4(),
            clientId: client.id,
            date: date,
            technician: technician,
            tabletsCheck: globalTabletsCheck,
            globalObservations: globalObservations,
            workstations: Object.values(reportData).map(d => ({
                ...d,
                hddHours: d.hddHours || 0 // Ensure number if empty, or handle as 0
            })) as WorkstationReport[]
        };
        onSave(fullReport);
    };

    return (
        <div className="form-overlay">
            <div className="form-container">
                <div className="form-header">
                    <h2>Nouveau Rapport : {client.name}</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="form-scroll-area">

                    {/* General Info */}
                    <div className="general-info-box">
                        <h3>Informations Générales</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Date du rapport</label>
                                <input
                                    type="date"
                                    className="input-text"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Responsable Maintenance</label>
                                <input
                                    type="text"
                                    className="input-text"
                                    placeholder="Nom du technicien..."
                                    value={technician}
                                    onChange={(e) => setTechnician(e.target.value)}
                                />
                            </div>

                            {/* SMS Check */}
                            {(client.id === 'sms' || client.templateType === 'sms') && (
                                <div className="form-group">
                                    <label>Vérification Tablettes (Atelier)</label>
                                    <div className="btn-group">
                                        <button
                                            className={`btn-toggle ${globalTabletsCheck === true ? 'active-success' : ''}`}
                                            onClick={() => setGlobalTabletsCheck(true)}>Fait</button>
                                        <button
                                            className={`btn-toggle ${globalTabletsCheck === false ? 'active-warning' : ''}`}
                                            onClick={() => setGlobalTabletsCheck(false)}>Non fait</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* Workstations */}
                    {client.workstations.map(ws => {
                        const data = reportData[ws.id] || {};
                        return (
                            <div key={ws.id} className="ws-form-card">
                                <h3 className="ws-form-title">{ws.name}</h3>


                                <div className="form-grid">
                                    {/* NAS */}
                                    <div className="form-group">
                                        <label>Connexion NAS</label>
                                        <div className="btn-group">
                                            <button
                                                className={`btn-toggle ${data.nasAccess ? 'active-success' : ''}`}
                                                onClick={() => updateField(ws.id, 'nasAccess', true)}>OK</button>
                                            <button
                                                className={`btn-toggle ${!data.nasAccess ? 'active-error' : ''}`}
                                                onClick={() => updateField(ws.id, 'nasAccess', false)}>HS</button>
                                        </div>
                                    </div>

                                    {/* Mises à jour */}
                                    <div className="form-group">
                                        <label>Windows Updates</label>
                                        <div className="btn-group">
                                            <button
                                                className={`btn-toggle ${data.windowsUpdates ? 'active-success' : ''}`}
                                                onClick={() => updateField(ws.id, 'windowsUpdates', true)}>Faites</button>
                                            <button
                                                className={`btn-toggle ${!data.windowsUpdates ? 'active-warning' : ''}`}
                                                onClick={() => updateField(ws.id, 'windowsUpdates', false)}>Attente</button>
                                        </div>
                                    </div>

                                    {/* Office */}
                                    <div className="form-group">
                                        <label>Services Office</label>
                                        <div className="btn-group">
                                            <button
                                                className={`btn-toggle ${data.officeAccess ? 'active-success' : ''}`}
                                                onClick={() => updateField(ws.id, 'officeAccess', true)}>OK</button>
                                            <button
                                                className={`btn-toggle ${!data.officeAccess ? 'active-error' : ''}`}
                                                onClick={() => updateField(ws.id, 'officeAccess', false)}>Erreur</button>
                                        </div>
                                    </div>

                                    {/* Logs */}
                                    <div className="form-group">
                                        <label>Journal Évènements</label>
                                        <div className="btn-group">
                                            <button
                                                className={`btn-toggle ${data.eventLogs ? 'active-success' : ''}`}
                                                onClick={() => updateField(ws.id, 'eventLogs', true)}>RAS</button>
                                            <button
                                                className={`btn-toggle ${!data.eventLogs ? 'active-warning' : ''}`}
                                                onClick={() => updateField(ws.id, 'eventLogs', false)}>Erreurs</button>
                                        </div>
                                    </div>

                                    {/* Disque Dur Health */}
                                    <div className="form-group span-2">
                                        <label>Santé Disque Dur</label>
                                        <div className="btn-group full-width">
                                            {(['Bon', 'Mauvais', 'Critique'] as HDDHealth[]).map(status => (
                                                <button
                                                    key={status}
                                                    className={`btn-toggle ${data.hddHealth === status ? getStatusColor(status) : ''}`}
                                                    onClick={() => updateField(ws.id, 'hddHealth', status)}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Disque Dur Hours */}
                                    <div className="form-group">
                                        <label>Heures HDD</label>
                                        <input
                                            type="number"
                                            className="input-number"
                                            placeholder="Non renseigné"
                                            value={data.hddHours === undefined ? '' : data.hddHours}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                updateField(ws.id, 'hddHours', val === '' ? undefined : parseInt(val));
                                            }}
                                        />
                                    </div>

                                    {/* Antivirus */}
                                    <div className="form-group span-3">
                                        <label>Antivirus BitDefender</label>
                                        <div className="btn-group full-width">
                                            {(['RAS', 'Malware', 'Licence'] as AntivirusStatus[]).map(status => (
                                                <button
                                                    key={status}
                                                    className={`btn-toggle ${data.antivirus === status ? getAntivirusColor(status) : ''}`}
                                                    onClick={() => updateField(ws.id, 'antivirus', status)}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SMS: VEEAM */}
                                    {(client.id === 'sms' || client.templateType === 'sms') && (
                                        <div className="form-group">
                                            <label>Sauvegardes VEEAM</label>
                                            <div className="btn-group">
                                                <button
                                                    className={`btn-toggle ${data.veeamBackup ? 'active-success' : ''}`}
                                                    onClick={() => updateField(ws.id, 'veeamBackup', true)}>OK</button>
                                                <button
                                                    className={`btn-toggle ${data.veeamBackup === false ? 'active-error' : ''}`}
                                                    onClick={() => updateField(ws.id, 'veeamBackup', false)}>Échec</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Observations (except SMS) */}
                                    {client.id !== 'sms' && client.templateType !== 'sms' && (
                                        <div className="form-group span-all">
                                            <label>Observations</label>
                                            <input
                                                type="text"
                                                className="input-text"
                                                placeholder="Remarques éventuelles..."
                                                value={data.observations}
                                                onChange={(e) => updateField(ws.id, 'observations', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* SMS Observations */}
                    {(client.id === 'sms' || client.templateType === 'sms') && (
                        <div className="general-info-box" style={{ marginTop: '20px' }}>
                            <h3>Observations Générales</h3>
                            <textarea
                                className="input-text"
                                style={{ height: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                                placeholder="Observations globales pour ce rapport..."
                                value={globalObservations}
                                onChange={(e) => setGlobalObservations(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="form-footer">
                    <button className="btn-secondary" onClick={onClose}>Annuler</button>
                    <button className="btn-primary" onClick={handleSubmit}>Terminer & Enregistrer</button>
                </div>
            </div>
        </div>
    );
}

// Helpers
function getStatusColor(status: HDDHealth) {
    if (status === 'Bon') return 'active-success';
    if (status === 'Mauvais') return 'active-warning';
    return 'active-error';
}

function getAntivirusColor(status: AntivirusStatus) {
    if (status === 'RAS') return 'active-success';
    if (status === 'Malware' || status === 'Expiré') return 'active-error';
    if (status === 'Licence' || status === 'Inactif') return 'active-warning';
    return '';
}
