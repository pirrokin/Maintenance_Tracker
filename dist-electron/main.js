import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const require$1 = createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const { app, BrowserWindow, ipcMain } = require$1("electron");
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
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
