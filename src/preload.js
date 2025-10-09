const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openPrinterWindow: (printer) => ipcRenderer.invoke('open-printer-window', printer),
  focusPrinterWindow: (printerId) => ipcRenderer.invoke('focus-printer-window', printerId),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  onMenuAddPrinter: (callback) => ipcRenderer.on('menu-add-printer', callback),
  onMenuTestAll: (callback) => ipcRenderer.on('menu-test-all', callback),
  onShowTelegramHelpModal: (callback) => ipcRenderer.on('show-telegram-help-modal', callback),
  onShowBambuHelpModal: (callback) => ipcRenderer.on('show-bambu-help-modal', callback),
  onLanguageChanged: (callback) => ipcRenderer.on('language-changed', callback),
  onGetPrinterData: (callback) => ipcRenderer.on('get-printer-data', callback),
  
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Key-value storage API backed by electron-store in main process
  storeGet: (key, defaultValue) => ipcRenderer.invoke('store-get', key, defaultValue),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  
  // Encryption API for secure credential storage
  encrypt: (text) => ipcRenderer.invoke('encrypt-data', text),
  decrypt: (encryptedText) => ipcRenderer.invoke('decrypt-data', encryptedText),
  
  // Bambu Lab data transmission
  sendBambuData: (printerId, data) => ipcRenderer.send('send-bambu-data', printerId, data),
  
  // Bambu Lab MQTT connection management
  testBambuConnection: (printerData) => ipcRenderer.invoke('test-bambu-connection', printerData),
  closeBambuConnection: (printerId) => ipcRenderer.invoke('close-bambu-connection', printerId),
  getBambuPrinterData: (printerId) => ipcRenderer.invoke('get-bambu-printer-data', printerId),
  requestBambuStatus: (printerId) => ipcRenderer.invoke('request-bambu-status', printerId),
  onBambuPrinterUpdate: (callback) => ipcRenderer.on('bambu-printer-update', (event, ...args) => callback(...args)),
  removeBambuUpdateListener: () => ipcRenderer.removeAllListeners('bambu-printer-update'),
  
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