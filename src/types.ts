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
    templateType?: string;
    workstations: Workstation[];
}
// Maintenance Report Types
export type CheckStatus = 'OK' | 'HS' | 'En attente' | 'Erreur' | 'RAS';
export type HDDHealth = 'Bon' | 'Prudence' | 'Mauvais';
export type AntivirusStatus = 'RAS' | 'Malware' | 'Licence' | 'Inactif' | 'Expiré';

export interface WorkstationReport {
    workstationId: string;
    workstationName: string;

    // Checks
    nasAccess: boolean;
    windowsUpdates: boolean;
    hddHealth: HDDHealth;
    hddHours?: number;
    officeAccess: boolean;
    eventLogs: boolean;
    antivirus: AntivirusStatus;

    // SMS Only
    veeamBackup?: boolean;

    // Pascal Combes Only
    rdxCheck?: boolean;


    observations?: string;
}

export interface MaintenanceReport {
    id?: string;
    clientId: string;
    date: string;
    technician: string;

    // SMS Only
    tabletsCheck?: boolean;
    globalObservations?: string;

    workstations: WorkstationReport[];
}
