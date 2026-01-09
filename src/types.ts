export interface Workstation {
    id: string;
    name: string;
    type: 'Desktop' | 'Laptop' | 'Server' | 'Other';
    notes?: string;
}

export interface Client {
    id: string;
    name: string;
    address?: string;
    contactName?: string;
    templateType?: string; // For the custom PDF template
    workstations: Workstation[];
}
// Maintenance Report Types
export type CheckStatus = 'OK' | 'HS' | 'En attente' | 'Erreur' | 'RAS';
export type HDDHealth = 'Bon' | 'Prudence' | 'Mauvais';
export type AntivirusStatus = 'Actif' | 'Inactif' | 'Expiré';

export interface WorkstationReport {
    workstationId: string;
    workstationName: string;

    // Checks
    nasAccess: boolean;
    windowsUpdates: boolean;
    hddHealth: HDDHealth;
    hddHours?: number; // Optional
    officeAccess: boolean;
    eventLogs: boolean;
    antivirus: AntivirusStatus;

    // SMS Specific
    veeamBackup?: boolean;
    // tabletsCheck moved to global report

    observations?: string;
}

export interface MaintenanceReport {
    id?: string; // Optional for new reports
    clientId: string;
    date: string;
    technician: string;

    // SMS Specific Global Check
    tabletsCheck?: boolean;
    globalObservations?: string;

    workstations: WorkstationReport[];
}
