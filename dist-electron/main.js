import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const require$1 = createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const { app, BrowserWindow, ipcMain, dialog } = require$1("electron");
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
const Store = require$1("electron-store");
const store = new Store();
const clientsList = [
  {
    id: "demo-client",
    name: "Entreprise Démo SARL",
    address: "123 Rue de l'Exemple",
    workstations: [
      { id: "ws-d1", name: "PC Accueil", type: "Desktop" },
      { id: "ws-d2", name: "PC Direction", type: "Laptop" },
      { id: "ws-d3", name: "Serveur", type: "Server" }
    ]
  },
  {
    id: "mairie-champeix",
    name: "Mairie de Champeix",
    address: "Champeix",
    workstations: [
      { id: "ch-1", name: "Aurélie", type: "Desktop" },
      { id: "ch-2", name: "Mélanie", type: "Desktop" },
      { id: "ch-3", name: "Marie-Christine", type: "Desktop" },
      { id: "ch-4", name: "Karim", type: "Desktop" },
      { id: "ch-5", name: "M.Meallet", type: "Laptop" },
      { id: "ch-6", name: "Camille", type: "Desktop" }
    ]
  },
  {
    id: "sms",
    name: "SMS",
    address: "",
    workstations: [
      { id: "sms-1", name: "M.Rechat", type: "Desktop" },
      { id: "sms-2", name: "PC Secrétaire", type: "Desktop" }
    ]
  },
  {
    id: "combes",
    name: "Combes",
    address: "",
    workstations: [
      { id: "combes-1", name: "Pascal Combes", type: "Desktop" }
    ]
  }
];
store.set("clients", clientsList);
ipcMain.handle("db:get-clients", () => {
  return store.get("clients", []);
});
ipcMain.handle("db:save-client", (_event, client) => {
  const clients = store.get("clients", []);
  const index = clients.findIndex((c) => c.id === client.id);
  if (index > -1) {
    clients[index] = client;
  } else {
    clients.push(client);
  }
  store.set("clients", clients);
  return true;
});
ipcMain.handle("db:delete-client", (_event, clientId) => {
  const clients = store.get("clients", []);
  const newClients = clients.filter((c) => c.id !== clientId);
  store.set("clients", newClients);
  return true;
});
ipcMain.handle("report:generate", async (_event, report) => {
  const win2 = BrowserWindow.getFocusedWindow();
  const { filePath } = await dialog.showSaveDialog(win2, {
    title: "Enregistrer le rapport PDF",
    defaultPath: `Rapport-${report.clientId}-${report.date}.pdf`,
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });
  if (!filePath) return { success: false };
  const templatePath = path.join(process.env.APP_ROOT, "src/templates/champeix.html");
  try {
    let html = fs.readFileSync(templatePath, "utf-8");
    let logoBase64 = "";
    const possiblePaths = [
      path.join(process.env.APP_ROOT, "src/assets/logo-verrier.png"),
      // Dev
      path.join(__dirname$1, "../../src/assets/logo-verrier.png"),
      // Relative from dist-electron
      path.join(process.resourcesPath, "src/assets/logo-verrier.png")
      // Prod resources
    ];
    let foundPath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }
    if (foundPath) {
      try {
        const logoBuffer = fs.readFileSync(foundPath);
        logoBase64 = logoBuffer.toString("base64");
        console.log("Logo loaded from:", foundPath);
      } catch (e) {
        console.error("Error reading logo:", e);
      }
    } else {
      console.error("Logo not found in any path:", possiblePaths);
    }
    const clients = store.get("clients");
    const client = clients.find((c) => c.id === report.clientId);
    const realClientName = client ? client.name : "Unknown Client";
    html = html.replace(/{{CLIENT_NAME}}/g, realClientName);
    html = html.replace(/{{DATE}}/g, report.date);
    html = html.replace(/{{TECHNICIAN}}/g, report.technician);
    html = html.replace(/{{LOGO_BASE64}}/g, logoBase64);
    let summaryListHtml = "";
    let detailsHtml = "";
    report.workstations.forEach((ws) => {
      summaryListHtml += `<li>${ws.workstationName}</li>`;
      detailsHtml += `
      <div class="workstation-box">
          <div class="ws-title">Poste de ${ws.workstationName} :</div>
          <ul class="task-list">
              <li>Vérification de la connexion au NAS : <strong>${ws.nasAccess ? "OK" : "HS"}</strong></li>
              <li>Vérification des mises à jour : <strong>${ws.windowsUpdates ? "Faites" : "En attente"}</strong></li>
              <li>Vérification de la santé du disque dur : <strong>${ws.hddHealth}</strong></li>
              <li>Nombre d'heures du disque dur : <strong>${ws.hddHours ? ws.hddHours + " H" : "Non renseigné"}</strong></li>
              <li>Vérification de la connexion aux services Office : <strong>${ws.officeAccess ? "OK" : "Erreur"}</strong></li>
              <li>Vérification de présence dans le journal d'évènements Windows : <strong>${ws.eventLogs ? "RAS" : "Erreurs"}</strong></li>
              <li>Vérification de l'antivirus BitDefender : <strong>${ws.antivirus}</strong></li>
          </ul>
          ${ws.observations ? `<div style="margin-top:5px; font-style:italic;">Obs: ${ws.observations}</div>` : ""}
      </div>
      `;
    });
    html = html.replace("{{SUMMARY_LIST}}", summaryListHtml);
    html = html.replace("{{DETAILS_CONTENT}}", detailsHtml);
    const printWindow = new BrowserWindow({ show: false, width: 800, height: 600 });
    const htmlDataUri = "data:text/html;charset=utf-8," + encodeURIComponent(html);
    await printWindow.loadURL(htmlDataUri);
    const pdfData = await printWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: "A4",
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });
    fs.writeFileSync(filePath, pdfData);
    printWindow.close();
    return { success: true, filePath };
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return { success: false, error: String(error) };
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
