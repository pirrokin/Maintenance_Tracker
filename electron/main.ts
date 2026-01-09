import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { app, BrowserWindow, ipcMain, dialog } = require('electron')

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 1280,
    height: 720,
    resizable: false,      // Locked size
    maximizable: false,    // No maximize button
    fullscreenable: false, // No fullscreen
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


// Initialize Store
const Store = require('electron-store');
const store = new Store()

// Force update of Client List (Source of Truth defined in code)
const clientsList = [
  // Demo client removed as requested

  {
    id: 'mairie-champeix',
    name: 'Mairie de Champeix',
    address: 'Champeix',
    workstations: [
      { id: 'ch-1', name: 'Aurélie', type: 'Desktop' },
      { id: 'ch-2', name: 'Mélanie', type: 'Desktop' },
      { id: 'ch-3', name: 'Marie-Christine', type: 'Desktop' },
      { id: 'ch-4', name: 'Karim', type: 'Desktop' },
      { id: 'ch-5', name: 'M.Meallet', type: 'Laptop' },
      { id: 'ch-6', name: 'Camille', type: 'Desktop' }
    ]
  },
  {
    id: 'sms',
    name: 'SMS',
    address: '',
    templateType: 'sms',
    workstations: [
      { id: 'sms-1', name: 'M.Rechat', type: 'Desktop' },
      { id: 'sms-2', name: 'PC Secrétaire', type: 'Desktop' }
    ]
  },
  {
    id: 'combes',
    name: 'Combes',
    address: '',
    workstations: [
      { id: 'combes-1', name: 'Pascal Combes', type: 'Desktop' }
    ]
  }
];

store.set('clients', clientsList);

// Database Handlers
ipcMain.handle('db:get-clients', () => {
  return store.get('clients', [])
})

ipcMain.handle('db:save-client', (_event, client) => {
  const clients = store.get('clients', []) as any[]
  const index = clients.findIndex((c: any) => c.id === client.id)
  if (index > -1) {
    clients[index] = client
  } else {
    clients.push(client)
  }
  store.set('clients', clients)
  return true
})

ipcMain.handle('db:delete-client', (_event, clientId) => {
  const clients = store.get('clients', []) as any[]
  const newClients = clients.filter((c: any) => c.id !== clientId)
  store.set('clients', newClients)
  return true
})

// Report Handlers
ipcMain.handle('db:get-reports', (_event, clientId) => {
  const reports = store.get('reports', []) as any[];
  if (!clientId) return reports;
  return reports.filter((r: any) => r.clientId === clientId);
});

ipcMain.handle('db:save-report', (_event, report) => {
  const reports = store.get('reports', []) as any[];
  const index = reports.findIndex((r: any) => r.id === report.id);
  if (!report.id) {
    const crypto = require('crypto');
    report.id = crypto.randomUUID();
  }
  if (index > -1) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  store.set('reports', reports);
  return true;
});

ipcMain.handle('db:delete-report', (_event, reportId) => {
  const reports = store.get('reports', []) as any[];
  const newReports = reports.filter((r: any) => r.id !== reportId);
  store.set('reports', newReports);
  return true;
});

// PDF Generation Logic
ipcMain.handle('report:generate', async (_event, report) => {
  const win = BrowserWindow.getFocusedWindow();

  // 1. Ask user where to save
  const { filePath } = await dialog.showSaveDialog(win, {
    title: 'Enregistrer le rapport PDF',
    defaultPath: `Rapport-${report.clientId}-${report.date}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });

  if (!filePath) return { success: false };

  // 2. Load Data & Template
  const clients = store.get('clients');
  const client = clients.find((c: any) => c.id === report.clientId);
  const realClientName = client ? client.name : 'Unknown Client';
  const isSms = client && client.templateType === 'sms';

  const templateName = isSms ? 'sms.html' : 'champeix.html';
  const templatePath = path.join(process.env.APP_ROOT, `src/templates/${templateName}`);

  try {
    let html = fs.readFileSync(templatePath, 'utf-8');

    // 2b. Load Logo (Robust Path Finding)
    let logoBase64 = '';
    const possiblePaths = [
      path.join(process.env.APP_ROOT, 'src/assets/logo-verrier.png'), // Dev
      path.join(__dirname, '../../src/assets/logo-verrier.png'),      // Relative from dist-electron
      path.join(process.resourcesPath, 'src/assets/logo-verrier.png') // Prod resources
    ];

    let foundPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (foundPath) {
      try {
        const logoBuffer = fs.readFileSync(foundPath);
        logoBase64 = logoBuffer.toString('base64');
      } catch (e) {
        console.error("Error reading logo:", e);
      }
    }

    // 3. Inject General Data
    html = html.replace(/{{CLIENT_NAME}}/g, realClientName);
    html = html.replace(/{{DATE}}/g, report.date);
    html = html.replace(/{{TECHNICIAN}}/g, report.technician);
    html = html.replace(/{{LOGO_BASE64}}/g, logoBase64);

    // 4. Generate Workstations Lists
    let summaryListHtml = '';
    let detailsHtml = '';

    report.workstations.forEach((ws: any) => {
      summaryListHtml += `<li>${ws.workstationName}</li>`;

      if (isSms) {
        // SMS Specific Checklist
        detailsHtml += `
          <div class="workstation-box">
              <div class="ws-title">Poste de ${ws.workstationName} :</div>
              <ul class="task-list">
                  <li>Vérification santé du disque dur : <strong>${ws.hddHealth}</strong></li>
                  <li>Nombre d'heures du disque dur : <strong>${ws.hddHours ? ws.hddHours + ' H' : 'Non renseigné'}</strong></li>
                  <li>Regarder si la connexion au NAS est toujours active : <strong>${ws.nasAccess ? 'OK' : 'HS'}</strong></li>
                  <li>Vérifier les journaux d’évènement Windows : <strong>${ws.eventLogs ? 'RAS' : 'Erreurs'}</strong></li>
                  <li>Vérifier l’antivirus Bitdefender : <strong>${ws.antivirus}</strong></li>
                  <li>Vérifier la connexion du compte Microsoft (Office) : <strong>${ws.officeAccess ? 'OK' : 'Erreur'}</strong></li>
                  <li>Vérifier les mises à jour : <strong>${ws.windowsUpdates ? 'Faites' : 'En attente'}</strong></li>
                  <li>Vérifier les sauvegardes avec VEEAM : <strong>${ws.veeamBackup === true ? 'OK' : (ws.veeamBackup === false ? 'Échec' : 'Non vérifié')}</strong></li>
              </ul>
          </div>
          `;
      } else {
        // Champeix / Standard Checklist
        detailsHtml += `
          <div class="workstation-box">
              <div class="ws-title">Poste de ${ws.workstationName} :</div>
              <ul class="task-list">
                  <li>Vérification de la connexion au NAS : <strong>${ws.nasAccess ? 'OK' : 'HS'}</strong></li>
                  <li>Vérification des mises à jour : <strong>${ws.windowsUpdates ? 'Faites' : 'En attente'}</strong></li>
                  <li>Vérification de la santé du disque dur : <strong>${ws.hddHealth}</strong></li>
                  <li>Nombre d'heures du disque dur : <strong>${ws.hddHours ? ws.hddHours + ' H' : 'Non renseigné'}</strong></li>
                  <li>Vérification de la connexion aux services Office : <strong>${ws.officeAccess ? 'OK' : 'Erreur'}</strong></li>
                  <li>Vérification de présence dans le journal d'évènements Windows : <strong>${ws.eventLogs ? 'RAS' : 'Erreurs'}</strong></li>
                  <li>Vérification de l'antivirus BitDefender : <strong>${ws.antivirus}</strong></li>
              </ul>
              ${ws.observations ? `<div style="margin-top:5px; font-style:italic;">Obs: ${ws.observations}</div>` : ''}
          </div>
          `;
      }
    });

    html = html.replace('{{SUMMARY_LIST}}', summaryListHtml);
    html = html.replace('{{DETAILS_CONTENT}}', detailsHtml);

    // 5. Inject Global Tablets Section (SMS only)
    if (isSms) {
      const tabletStatus = report.tabletsCheck === true ? 'Vérifiées'
        : (report.tabletsCheck === false ? 'Non vérifiées / Problème signalé' : 'Non vérifié');

      const tabletHtml = `
        <div class="workstation-box" style="margin-top: 5mm; break-inside: avoid;">
            <div class="ws-title">Vérification des tablettes</div>
            <ul class="task-list">
                <li>État : <strong>${tabletStatus}</strong></li>
            </ul>
        </div>
        `;
      html = html.replace('{{TABLETS_SECTION}}', tabletHtml);

      // 6. Inject Global Observations (SMS only)
      const obsHtml = report.globalObservations ? `
        <div class="workstation-box" style="margin-top: 5mm; break-inside: avoid; border-color: #666;">
            <div class="ws-title" style="color: #666;">Observations Générales</div>
            <div style="font-style: italic; white-space: pre-wrap;">${report.globalObservations}</div>
        </div>
        ` : '';
      html = html.replace('{{OBSERVATIONS_SECTION}}', obsHtml);

    } else {
      html = html.replace('{{TABLETS_SECTION}}', '');
      html = html.replace('{{OBSERVATIONS_SECTION}}', '');
    }

    // 5. Create Hidden Window for Rendering
    const printWindow = new BrowserWindow({ show: false, width: 800, height: 600 });
    const htmlDataUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
    await printWindow.loadURL(htmlDataUri);

    // 6. Print to PDF
    const pdfData = await printWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    // 7. Write File
    fs.writeFileSync(filePath, pdfData);
    printWindow.close();

    return { success: true, filePath };

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return { success: false, error: String(error) };
  }
});

app.whenReady().then(createWindow)
