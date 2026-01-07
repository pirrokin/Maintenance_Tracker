"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
electron.contextBridge.exposeInMainWorld("db", {
  getClients: () => electron.ipcRenderer.invoke("db:get-clients"),
  saveClient: (client) => electron.ipcRenderer.invoke("db:save-client", client),
  deleteClient: (id) => electron.ipcRenderer.invoke("db:delete-client", id),
  // Reports
  getReports: (clientId) => electron.ipcRenderer.invoke("db:get-reports", clientId),
  saveReport: (report) => electron.ipcRenderer.invoke("db:save-report", report),
  deleteReport: (id) => electron.ipcRenderer.invoke("db:delete-report", id),
  // Generator
  generateReport: (report) => electron.ipcRenderer.invoke("report:generate", report)
});
