const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openPrinterWindow: (printer) => ipcRenderer.invoke('open-printer-window', printer),
  focusPrinterWindow: (printerId) => ipcRenderer.invoke('focus-printer-window', printerId),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  onMenuAddPrinter: (callback) => ipcRenderer.on('menu-add-printer', callback),
  onMenuTestAll: (callback) => ipcRenderer.on('menu-test-all', callback),
  onLanguageChanged: (callback) => ipcRenderer.on('language-changed', callback),
  onGetPrinterData: (callback) => ipcRenderer.on('get-printer-data', callback),
  
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Key-value storage API backed by electron-store in main process
  storeGet: (key, defaultValue) => ipcRenderer.invoke('store-get', key, defaultValue),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  
  // Bambu Lab data transmission
  sendBambuData: (printerId, data) => ipcRenderer.send('send-bambu-data', printerId, data),
  
  // Network Scanner
  scanNetwork: (scanType) => ipcRenderer.invoke('scan-network', scanType),
  onScanProgress: (callback) => ipcRenderer.on('scan-progress', (event, ...args) => callback(...args)),
  removeScanProgressListener: () => ipcRenderer.removeAllListeners('scan-progress'),
  
  // Send IPC messages
  send: (channel, ...args) => {
    const validChannels = ['show-telegram-help', 'show-bambu-help'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  }
});