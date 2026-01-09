/// <reference types="vite/client" />

interface Window {
    db: {
        getClients: () => Promise<any[]>;
        saveClient: (client: any) => Promise<boolean>;
        deleteClient: (id: string) => Promise<boolean>;

        getReports: (clientId: string) => Promise<any[]>;
        saveReport: (report: any) => Promise<boolean>;
        deleteReport: (reportId: string) => Promise<boolean>;

        generateReport: (report: any) => Promise<{ success: boolean, filePath?: string }>;
    }
}
