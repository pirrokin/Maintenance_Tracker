import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { app, BrowserWindow, ipcMain } = require('electron')

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
  {
    id: 'demo-client',
    name: 'Entreprise Démo SARL',
    address: '123 Rue de l\'Exemple',
    workstations: [
      { id: 'ws-d1', name: 'PC Accueil', type: 'Desktop' },
      { id: 'ws-d2', name: 'PC Direction', type: 'Laptop' },
      { id: 'ws-d3', name: 'Serveur', type: 'Server' }
    ]
  },
  {
    id: 'mairie-champeix',
    name: 'Mairie de Champeix',
    address: 'Champeix',
    workstations: [
      { id: 'ch-1', name: 'Aurélie', type: 'Desktop' },
      { id: 'ch-2', name: 'Mélanie', type: 'Desktop' },
      { id: 'ch-3', name: 'Marie-Christine', type: 'Desktop' },
      { id: 'ch-4', name: 'Karime', type: 'Desktop' },
      { id: 'ch-5', name: 'M.Meallet', type: 'Laptop' },
      { id: 'ch-6', name: 'Camille', type: 'Desktop' }
    ]
  },
  {
    id: 'sms',
    name: 'SMS',
    address: '',
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

app.whenReady().then(createWindow)
