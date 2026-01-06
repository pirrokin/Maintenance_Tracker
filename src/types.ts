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
