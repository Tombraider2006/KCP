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
  },
  
  // Web Server Management
  startWebServer: (port) => ipcRenderer.invoke('start-web-server', port),
  stopWebServer: () => ipcRenderer.invoke('stop-web-server'),
  getWebServerInfo: () => ipcRenderer.invoke('get-web-server-info'),
  openWebInterface: () => ipcRenderer.invoke('open-web-interface'),
  openExternalLink: (url) => ipcRenderer.invoke('open-external-link', url),
  updatePrinterData: (printerId, data) => ipcRenderer.invoke('update-printer-data', printerId, data),
  getNetworkInterfaces: () => ipcRenderer.invoke('get-network-interfaces'),
  onWebServerStatus: (callback) => ipcRenderer.on('web-server-status', (event, ...args) => callback(...args)),
  removeWebServerStatusListener: () => ipcRenderer.removeAllListeners('web-server-status'),
  
  diagnostics: {
    trackPrinterAdded: (type) => ipcRenderer.invoke('diagnostics-track-printer-added', type),
    updatePrinters: (list) => ipcRenderer.invoke('diagnostics-update-printers', list),
    trackFeature: (name) => ipcRenderer.invoke('diagnostics-track-feature', name),
    trackAnalyticsView: () => ipcRenderer.invoke('diagnostics-track-analytics-view'),
    trackExport: (format) => ipcRenderer.invoke('diagnostics-track-export', format)
  },
  
  // Tuya Smart Plug Management
  setupTuya: (config) => ipcRenderer.invoke('setup-tuya', config),
  tuyaGetDevices: () => ipcRenderer.invoke('tuya-get-devices'),
  tuyaLinkDevice: (printerId, deviceId, settings) => ipcRenderer.invoke('tuya-link-device', printerId, deviceId, settings),
  tuyaUnlinkDevice: (printerId) => ipcRenderer.invoke('tuya-unlink-device', printerId),
  tuyaControlDevice: (printerId, action) => ipcRenderer.invoke('tuya-control-device', printerId, action),
  tuyaGetEnergyStats: (printerId) => ipcRenderer.invoke('tuya-get-energy-stats', printerId),
  tuyaGetDeviceStatus: (printerId) => ipcRenderer.invoke('tuya-get-device-status', printerId),
  
  // Home Assistant Management
  setupHomeAssistant: (config) => ipcRenderer.invoke('setup-homeassistant', config),
  haGetSwitches: () => ipcRenderer.invoke('ha-get-switches'),
  haLinkDevice: (printerId, entityId, settings) => ipcRenderer.invoke('ha-link-device', printerId, entityId, settings),
  haUnlinkDevice: (printerId) => ipcRenderer.invoke('ha-unlink-device', printerId),
  haControlSwitch: (printerId, action) => ipcRenderer.invoke('ha-control-switch', printerId, action),
  haGetSwitchStatus: (printerId) => ipcRenderer.invoke('ha-get-switch-status', printerId),
  
  // Слушатели событий для Smart Plugs
  onPrinterPoweredOff: (callback) => ipcRenderer.on('printer-powered-off', (event, ...args) => callback(...args)),
  onPrinterEmergencyShutdown: (callback) => ipcRenderer.on('printer-emergency-shutdown', (event, ...args) => callback(...args)),
  removePowerOffListener: () => ipcRenderer.removeAllListeners('printer-powered-off'),
  removeEmergencyShutdownListener: () => ipcRenderer.removeAllListeners('printer-emergency-shutdown'),
  
  // Update Checker
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  openReleasePage: (url) => ipcRenderer.invoke('open-release-page', url),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, ...args) => callback(...args)),
  removeUpdateListener: () => ipcRenderer.removeAllListeners('update-available')
});