const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let tabsWindow = null;
const printerTabs = new Map();

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: getIconPath(),
    title: '3D Printer Control Panel v1.3.0',
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  createApplicationMenu();

  mainWindow.on('closed', () => {
    if (tabsWindow && !tabsWindow.isDestroyed()) {
      tabsWindow.close();
    }
    mainWindow = null;
  });
}

function getIconPath() {
  switch (process.platform) {
    case 'darwin':
      return path.join(__dirname, 'icons/icon.icns');
    case 'win32':
      return path.join(__dirname, 'icons/icon.ico');
    default:
      return path.join(__dirname, 'icons/icon.png');
  }
}

// Функция для получения сохраненного или системного языка
function getSavedLanguage() {
  // Сначала проверяем сохраненный выбор пользователя
  const savedLang = store.get('appLanguage', null);
  if (savedLang) {
    return savedLang;
  }
  
  // Если нет сохраненного, определяем системный
  try {
    const locale = app.getLocale();
    return locale.toLowerCase().includes('ru') ? 'ru' : 'en';
  } catch (error) {
    console.log('Could not determine locale, using English as default');
    return 'en';
  }
}

// Функция для установки языка
function setLanguage(lang) {
  store.set('appLanguage', lang);
  
  // Пересоздаем меню
  createApplicationMenu();
  
  // Уведомляем renderer процесс об изменении языка
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('language-changed', lang);
  }
  
  // Показываем уведомление
  const isRussian = lang === 'ru';
  const { dialog } = require('electron');
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: isRussian ? 'Язык изменен' : 'Language Changed',
    message: isRussian 
      ? 'Язык программы изменен. Для полного применения изменений перезапустите программу.' 
      : 'Application language has been changed. Please restart the application for full effect.',
    buttons: ['OK']
  });
}

function createApplicationMenu() {
  const currentLang = getSavedLanguage();
  const isRussian = currentLang === 'ru';
  
  const template = [
    {
      label: isRussian ? 'Файл' : 'File',
      submenu: [
        {
          label: isRussian ? 'Добавить принтер' : 'Add Printer',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-add-printer');
            }
          }
        },
        {
          label: isRussian ? 'Проверить все подключения' : 'Test All Connections',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-test-all');
            }
          }
        },
        { type: 'separator' },
        {
          label: isRussian ? 'Настройки Telegram' : 'Telegram Settings',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript('openTelegramSettingsModal()');
            }
          }
        },
        { type: 'separator' },
        {
          label: isRussian ? 'Выход' : 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: isRussian ? 'Вид' : 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: isRussian ? 'Окно' : 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Language',
      submenu: [
        {
          label: '🇷🇺 Русский',
          type: 'radio',
          checked: isRussian,
          click: () => {
            setLanguage('ru');
          }
        },
        {
          label: '🇬🇧 English',
          type: 'radio',
          checked: !isRussian,
          click: () => {
            setLanguage('en');
          }
        }
      ]
    },
    {
      label: isRussian ? 'Помощь' : 'Help',
      submenu: [
        {
          label: isRussian ? 'Помощь по настройке Telegram бота' : 'Telegram Bot Setup Help',
          click: () => {
            showTelegramHelp(isRussian);
          }
        },
        { type: 'separator' },
        {
          label: isRussian ? 'Проверить обновления' : 'Check for Updates',
          click: () => {
            checkForUpdates(isRussian);
          }
        },
        { type: 'separator' },
        {
          label: isRussian ? 'О программе 3D Printer Control Panel' : 'About 3D Printer Control Panel',
          click: () => {
            shell.openExternal('https://github.com/Tombraider2006/KCP');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showTelegramHelp(isRussian) {
  const helpWindow = new BrowserWindow({
    width: 700,
    height: 900,
    parent: mainWindow,
    modal: true,
    resizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: isRussian ? 'Помощь по настройке Telegram бота' : 'Telegram Bot Setup Help'
  });

  const helpContent = isRussian ? `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Помощь по настройке Telegram бота</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 25px; 
                line-height: 1.6;
                color: #333;
                background: #f5f5f5;
            }
            .container {
                max-width: 650px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #0088cc; text-align: center; margin-bottom: 30px; }
            h2 { color: #555; margin-top: 25px; padding-bottom: 8px; border-bottom: 2px solid #0088cc; }
            .step { 
                background: #f8f9fa; 
                padding: 20px; 
                margin: 15px 0; 
                border-radius: 8px;
                border-left: 4px solid #0088cc;
            }
            code { 
                background: #2d2d2d; 
                color: #fff; 
                padding: 12px; 
                display: block; 
                border-radius: 6px;
                margin: 12px 0;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                overflow-x: auto;
            }
            .note { 
                background: #e3f2fd; 
                border: 1px solid #bbdefb; 
                padding: 12px; 
                border-radius: 6px;
                margin: 15px 0;
            }
            .warning { 
                background: #fff3cd; 
                border: 1px solid #ffeaa7; 
                padding: 12px; 
                border-radius: 6px;
                margin: 15px 0;
            }
            .success { 
                background: #d4edda; 
                border: 1px solid #c3e6cb; 
                padding: 12px; 
                border-radius: 6px;
                margin: 15px 0;
            }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
            .icon { font-size: 18px; margin-right: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 Помощь по настройке Telegram бота</h1>
            
            <h2>📋 Шаг 1: Создание бота в Telegram</h2>
            <div class="step">
                <p><span class="icon">1.</span> Откройте Telegram и найдите <strong>@BotFather</strong></p>
                <p><span class="icon">2.</span> Отправьте команду: <code>/newbot</code></p>
                <p><span class="icon">3.</span> Следуйте инструкциям чтобы выбрать имя и username для вашего бота</p>
                <p><span class="icon">4.</span> После создания вы получите <strong>Токен бота</strong> - сохраните его!</p>
                <div class="note">
                    💡 <strong>Пример токена:</strong> <code>1234567890:ABCdefGHIjklMNopQRstUVwxyz</code>
                </div>
            </div>

            <h2>🆔 Шаг 2: Получение вашего Chat ID</h2>
            <div class="step">
                <p><strong>Способ 1 (простой):</strong></p>
                <p><span class="icon">1.</span> Найдите бота <strong>@userinfobot</strong> в Telegram</p>
                <p><span class="icon">2.</span> Отправьте ему команду <code>/start</code></p>
                <p><span class="icon">3.</span> Он покажет ваш Chat ID - скопируйте его</p>
                
                <p><strong>Способ 2 (через API):</strong></p>
                <p><span class="icon">1.</span> Начните диалог с вашим новым ботом</p>
                <p><span class="icon">2.</span> Отправьте команду: <code>/start</code></p>
                <p><span class="icon">3.</span> Откройте этот URL в браузере (замените YOUR_BOT_TOKEN):</p>
                <code>https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates</code>
                <p><span class="icon">4.</span> Найдите объект "chat" и скопируйте значение "id"</p>
            </div>

            <h2>📢 Шаг 3: Добавление бота в канал (опционально)</h2>
            <div class="step">
                <p><strong>Если вы хотите получать уведомления в канал Telegram:</strong></p>
                
                <p><strong>Создание и настройка канала:</strong></p>
                <p><span class="icon">1.</span> Создайте канал в Telegram (через меню → Новый канал)</p>
                <p><span class="icon">2.</span> Назовите канал (например, "3D Printer Notifications")</p>
                <p><span class="icon">3.</span> Выберите тип канала: <strong>Приватный</strong> или <strong>Публичный</strong></p>
                
                <p><strong>Добавление бота администратором:</strong></p>
                <p><span class="icon">1.</span> Откройте настройки канала (⋮ → Управление каналом)</p>
                <p><span class="icon">2.</span> Перейдите в <strong>Администраторы</strong> → Добавить администратора</p>
                <p><span class="icon">3.</span> Найдите и выберите вашего бота (по username)</p>
                <p><span class="icon">4.</span> Выдайте права: минимум нужно <strong>"Публикация сообщений"</strong></p>
                <p><span class="icon">5.</span> Сохраните изменения</p>
                
                <p><strong>Получение Chat ID канала:</strong></p>
                <p><span class="icon">1.</span> Опубликуйте любое сообщение в канале</p>
                <p><span class="icon">2.</span> Перешлите это сообщение боту <strong>@userinfobot</strong></p>
                <p><span class="icon">3.</span> Он покажет Chat ID канала (начинается с <code>-100</code>)</p>
                <div class="note">
                    💡 <strong>Пример Chat ID канала:</strong> <code>-1001234567890</code> (отрицательное число для каналов и групп)
                </div>
                
                <p><strong>Альтернативный способ через API:</strong></p>
                <p><span class="icon">1.</span> Добавьте бота администратором канала</p>
                <p><span class="icon">2.</span> Отправьте любое сообщение в канал</p>
                <p><span class="icon">3.</span> Откройте в браузере:</p>
                <code>https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates</code>
                <p><span class="icon">4.</span> Найдите в JSON объект "chat" с типом "channel" и скопируйте "id"</p>
                
                <div class="warning">
                    ⚠️ <strong>Важно для каналов:</strong>
                    <ul>
                        <li>Chat ID канала всегда отрицательный и начинается с <code>-100</code></li>
                        <li>Бот должен быть администратором канала с правами на публикацию</li>
                        <li>Используйте Chat ID канала вместо личного ID в настройках</li>
                    </ul>
                </div>
            </div>

            <h2>⚙️ Шаг 4: Настройка в программе</h2>
            <div class="step">
                <p><span class="icon">1.</span> Нажмите кнопку "🤖 Telegram" в главном окне</p>
                <p><span class="icon">2.</span> Введите ваш Токен бота и Chat ID (личный или канала)</p>
                <p><span class="icon">3.</span> Выберите какие уведомления вы хотите получать</p>
                <p><span class="icon">4.</span> Нажмите "Проверить соединение" для проверки</p>
                <p><span class="icon">5.</span> Сохраните настройки</p>
                <div class="success">
                    ✅ <strong>Готово!</strong> Теперь вы будете получать уведомления о статусе ваших принтеров
                </div>
            </div>

            <h2>🔔 Поддерживаемые уведомления</h2>
            
            <h3>📄 Уведомления о печати:</h3>
            <ul>
                <li>✅ <strong>Завершение печати</strong> - когда печать успешно завершена</li>
                <li>❌ <strong>Ошибка печати</strong> - когда возникает ошибка во время печати</li>
                <li>⏸️ <strong>Пауза печати</strong> - когда печать поставлена на паузу</li>
            </ul>
            
            <h3>🖨️ Уведомления о принтере:</h3>
            <ul>
                <li>🔌 <strong>Принтер offline</strong> - когда принтер отключается (опционально)</li>
                <li>🟢 <strong>Принтер online</strong> - когда принтер подключается (опционально)</li>
            </ul>
            
            <h3>📊 Уведомления об эффективности:</h3>
            <ul>
                <li>⚠️ <strong>Событие неэффективности</strong> - автоматически обнаруживает:
                    <ul>
                        <li><strong>Gap</strong> (перерыв между печатями более 10 минут)</li>
                        <li><strong>Pause</strong> (пауза во время печати более 7 минут)</li>
                    </ul>
                </li>
                <li>📝 <strong>Отчет оператора</strong> - когда оператор сохраняет причину неэффективности в разделе Аналитика</li>
            </ul>
            
            <h3>⚙️ Системные уведомления:</h3>
            <ul>
                <li>🚀 <strong>Запуск программы</strong> - отправляется при старте программы (включает версию и количество принтеров)</li>
            </ul>

            <div class="warning">
                <strong>Важно:</strong> Убедитесь что у вашего бота отключен режим конфиденциальности (Privacy mode), 
                если вы хотите получать от него сообщения. Это можно настроить через @BotFather командой <code>/setprivacy</code> → <code>Disable</code>.
            </div>

            <div class="note">
                <strong>Совет:</strong> Для тестирования вы можете временно включить все типы уведомлений, 
                а после настройки оставить только нужные.
            </div>
        </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Telegram Bot Setup Help</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 25px; 
                line-height: 1.6;
                color: #333;
                background: #f5f5f5;
            }
            .container {
                max-width: 650px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #0088cc; text-align: center; margin-bottom: 30px; }
            h2 { color: #555; margin-top: 25px; padding-bottom: 8px; border-bottom: 2px solid #0088cc; }
            .step { 
                background: #f8f9fa; 
                padding: 20px; 
                margin: 15px 0; 
                border-radius: 8px;
                border-left: 4px solid #0088cc;
            }
            code { 
                background: #2d2d2d; 
                color: #fff; 
                padding: 12px; 
                display: block; 
                border-radius: 6px;
                margin: 12px 0;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                overflow-x: auto;
            }
            .note { 
                background: #e3f2fd; 
                border: 1px solid #bbdefb; 
                padding: 12px; 
                border-radius: 6px;
                margin: 15px 0;
            }
            .warning { 
                background: #fff3cd; 
                border: 1px solid #ffeaa7; 
                padding: 12px; 
                border-radius: 6px;
                margin: 15px 0;
            }
            .success { 
                background: #d4edda; 
                border: 1px solid #c3e6cb; 
                padding: 12px; 
                border-radius: 6px;
                margin: 15px 0;
            }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
            .icon { font-size: 18px; margin-right: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 Telegram Bot Setup Help</h1>
            
            <h2>📋 Step 1: Create a Telegram Bot</h2>
            <div class="step">
                <p><span class="icon">1.</span> Open Telegram and search for <strong>@BotFather</strong></p>
                <p><span class="icon">2.</span> Send the command: <code>/newbot</code></p>
                <p><span class="icon">3.</span> Follow the instructions to choose a name and username for your bot</p>
                <p><span class="icon">4.</span> After creation, you'll receive a <strong>Bot Token</strong> - save it!</p>
                <div class="note">
                    💡 <strong>Token example:</strong> <code>1234567890:ABCdefGHIjklMNopQRstUVwxyz</code>
                </div>
            </div>

            <h2>🆔 Step 2: Get Your Chat ID</h2>
            <div class="step">
                <p><strong>Method 1 (easy):</strong></p>
                <p><span class="icon">1.</span> Search for <strong>@userinfobot</strong> in Telegram</p>
                <p><span class="icon">2.</span> Send it the <code>/start</code> command</p>
                <p><span class="icon">3.</span> It will show your Chat ID - copy it</p>
                
                <p><strong>Method 2 (via API):</strong></p>
                <p><span class="icon">1.</span> Start a conversation with your new bot</p>
                <p><span class="icon">2.</span> Send the command: <code>/start</code></p>
                <p><span class="icon">3.</span> Open this URL in your browser (replace YOUR_BOT_TOKEN):</p>
                <code>https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates</code>
                <p><span class="icon">4.</span> Look for the "chat" object and copy the "id" value</p>
            </div>

            <h2>📢 Step 3: Add Bot to Channel (Optional)</h2>
            <div class="step">
                <p><strong>If you want to receive notifications in a Telegram channel:</strong></p>
                
                <p><strong>Create and configure channel:</strong></p>
                <p><span class="icon">1.</span> Create a channel in Telegram (menu → New Channel)</p>
                <p><span class="icon">2.</span> Name your channel (e.g., "3D Printer Notifications")</p>
                <p><span class="icon">3.</span> Choose channel type: <strong>Private</strong> or <strong>Public</strong></p>
                
                <p><strong>Add bot as administrator:</strong></p>
                <p><span class="icon">1.</span> Open channel settings (⋮ → Manage Channel)</p>
                <p><span class="icon">2.</span> Go to <strong>Administrators</strong> → Add Administrator</p>
                <p><span class="icon">3.</span> Find and select your bot (by username)</p>
                <p><span class="icon">4.</span> Grant permissions: minimum required is <strong>"Post Messages"</strong></p>
                <p><span class="icon">5.</span> Save changes</p>
                
                <p><strong>Get channel Chat ID:</strong></p>
                <p><span class="icon">1.</span> Post any message in the channel</p>
                <p><span class="icon">2.</span> Forward this message to <strong>@userinfobot</strong></p>
                <p><span class="icon">3.</span> It will show the channel Chat ID (starts with <code>-100</code>)</p>
                <div class="note">
                    💡 <strong>Channel Chat ID example:</strong> <code>-1001234567890</code> (negative number for channels and groups)
                </div>
                
                <p><strong>Alternative method via API:</strong></p>
                <p><span class="icon">1.</span> Add bot as channel administrator</p>
                <p><span class="icon">2.</span> Post any message to the channel</p>
                <p><span class="icon">3.</span> Open in browser:</p>
                <code>https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates</code>
                <p><span class="icon">4.</span> Find the "chat" object with type "channel" and copy the "id"</p>
                
                <div class="warning">
                    ⚠️ <strong>Important for channels:</strong>
                    <ul>
                        <li>Channel Chat ID is always negative and starts with <code>-100</code></li>
                        <li>Bot must be channel administrator with posting permissions</li>
                        <li>Use channel Chat ID instead of personal ID in settings</li>
                    </ul>
                </div>
            </div>

            <h2>⚙️ Step 4: Configure in the App</h2>
            <div class="step">
                <p><span class="icon">1.</span> Click the "🤖 Telegram" button in the main window</p>
                <p><span class="icon">2.</span> Enter your Bot Token and Chat ID (personal or channel)</p>
                <p><span class="icon">3.</span> Choose which notifications you want to receive</p>
                <p><span class="icon">4.</span> Click "Test Connection" to verify everything works</p>
                <p><span class="icon">5.</span> Save the settings</p>
                <div class="success">
                    ✅ <strong>Done!</strong> You will now receive notifications about your printers status
                </div>
            </div>

            <h2>🔔 Supported Notifications</h2>
            
            <h3>📄 Print Notifications:</h3>
            <ul>
                <li>✅ <strong>Print Complete</strong> - When a print job finishes successfully</li>
                <li>❌ <strong>Print Error</strong> - When an error occurs during printing</li>
                <li>⏸️ <strong>Print Paused</strong> - When a print is paused</li>
            </ul>
            
            <h3>🖨️ Printer Notifications:</h3>
            <ul>
                <li>🔌 <strong>Printer Offline</strong> - When a printer goes offline (optional)</li>
                <li>🟢 <strong>Printer Online</strong> - When a printer comes back online (optional)</li>
            </ul>
            
            <h3>📊 Efficiency Notifications:</h3>
            <ul>
                <li>⚠️ <strong>Inefficiency Event</strong> - Automatically detects:
                    <ul>
                        <li><strong>Gap</strong> (break between prints exceeding 10 minutes)</li>
                        <li><strong>Pause</strong> (pause during printing exceeding 7 minutes)</li>
                    </ul>
                </li>
                <li>📝 <strong>Operator Report</strong> - When operator saves the reason for inefficiency in Analytics section</li>
            </ul>
            
            <h3>⚙️ System Notifications:</h3>
            <ul>
                <li>🚀 <strong>Program Start</strong> - Sent when the program starts (includes version and number of printers)</li>
            </ul>

            <div class="warning">
                <strong>Important:</strong> Make sure your bot has privacy mode disabled if you want to receive messages from it.
                You can configure this via @BotFather with command <code>/setprivacy</code> → <code>Disable</code>.
            </div>

            <div class="note">
                <strong>Tip:</strong> For testing, you can temporarily enable all notification types, 
                and after setup leave only the ones you need.
            </div>
        </div>
    </body>
    </html>
  `;

  helpWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(helpContent)}`);
}

async function checkForUpdates(isRussian) {
  const { dialog } = require('electron');
  const https = require('https');
  
  const currentVersion = '1.3.0';
  const repoOwner = 'Tombraider2006';
  const repoName = 'KCP';
  
  try {
    // Показываем диалог "Проверка..."
    const checkingMessage = isRussian 
      ? 'Проверка обновлений...' 
      : 'Checking for updates...';
    
    console.log(checkingMessage);
    
    // Делаем запрос к GitHub API
    const latestRelease = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${repoOwner}/${repoName}/releases/latest`,
        method: 'GET',
        headers: {
          'User-Agent': '3D-Printer-Control-Panel'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
    
    // Получаем версию из тега (убираем 'v' если есть)
    const latestVersion = latestRelease.tag_name.replace(/^v/, '');
    
    // Сравниваем версии
    const isNewer = compareVersions(latestVersion, currentVersion);
    
    if (isNewer) {
      const result = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: isRussian ? 'Доступно обновление' : 'Update Available',
        message: isRussian 
          ? `Доступна новая версия ${latestVersion}!\nТекущая версия: ${currentVersion}`
          : `New version ${latestVersion} is available!\nCurrent version: ${currentVersion}`,
        detail: isRussian
          ? 'Хотите перейти на страницу загрузки?'
          : 'Would you like to go to the download page?',
        buttons: [
          isRussian ? 'Да' : 'Yes',
          isRussian ? 'Нет' : 'No'
        ],
        defaultId: 0,
        cancelId: 1
      });
      
      if (result.response === 0) {
        shell.openExternal(`https://github.com/${repoOwner}/${repoName}/releases/latest`);
      }
    } else {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: isRussian ? 'Обновлений нет' : 'No Updates',
        message: isRussian
          ? `У вас установлена последняя версия (${currentVersion})`
          : `You have the latest version (${currentVersion})`,
        buttons: ['OK']
      });
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: isRussian ? 'Ошибка' : 'Error',
      message: isRussian
        ? 'Не удалось проверить обновления'
        : 'Failed to check for updates',
      detail: error.message,
      buttons: ['OK']
    });
  }
}

function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;
    
    if (num1 > num2) return true;
    if (num1 < num2) return false;
  }
  
  return false;
}

function createTabsWindow() {
  if (tabsWindow && !tabsWindow.isDestroyed()) {
    tabsWindow.focus();
    return tabsWindow;
  }

  tabsWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    title: '3D Printer Interfaces - v1.3.1',
    icon: getIconPath(),
    show: false
  });

  tabsWindow.loadFile('printer-tabs-window.html');

  tabsWindow.once('ready-to-show', () => {
    tabsWindow.show();
  });

  if (process.argv.includes('--dev')) {
    tabsWindow.webContents.openDevTools();
  }

  tabsWindow.on('closed', () => {
    tabsWindow = null;
    printerTabs.clear();
  });

  return tabsWindow;
}

function addPrinterTab(printerData) {
  // Проверяем было ли окно создано заново (ПЕРЕД добавлением в Map)
  const wasWindowNull = !tabsWindow || tabsWindow.isDestroyed();
  
  const window = createTabsWindow();
  const isNewWindow = wasWindowNull; // Новое окно если раньше его не было
  
  // Сохраняем данные принтера
  printerTabs.set(printerData.id, printerData);
  
  // Отправляем данные в окно вкладок
  const sendData = () => {
    if (window && !window.isDestroyed()) {
      window.webContents.send('add-printer-tab', printerData);
    }
  };
  
  // Если это новое окно (первый принтер) - ждем dom-ready
  if (isNewWindow) {
    window.webContents.once('dom-ready', () => {
      setTimeout(sendData, 100); // Даем время на инициализацию табов менеджера
    });
  } else {
    // Окно уже существует - отправляем сразу
    setTimeout(sendData, 10);
  }
}

function focusPrinterTab(printerId) {
  if (tabsWindow && !tabsWindow.isDestroyed() && printerTabs.has(printerId)) {
    tabsWindow.webContents.send('focus-printer-tab', printerId);
    tabsWindow.focus();
    return true;
  }
  return false;
}

// IPC handlers
ipcMain.handle('open-printer-window', (event, printerData) => {
  try {
    const sanitizedPrinterData = {
      id: String(printerData.id),
      name: String(printerData.name),
      ip: String(printerData.ip),
      port: String(printerData.port || '7125'),
      webPort: String(printerData.webPort || '80')
    };
    
    console.log('Opening printer tab for:', sanitizedPrinterData.name);
    
    // Проверяем, существует ли уже вкладка
    if (printerTabs.has(sanitizedPrinterData.id)) {
      focusPrinterTab(sanitizedPrinterData.id);
    } else {
      addPrinterTab(sanitizedPrinterData);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error opening printer tab:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('focus-printer-window', (event, printerId) => {
  return focusPrinterTab(String(printerId));
});

// ОБРАБОТЧИК ДЛЯ ЗАКРЫТИЯ ВКЛАДКИ ПРИНТЕРА
ipcMain.on('close-printer-tab', (event, printerId) => {
  console.log('Closing printer tab:', printerId);
  if (printerTabs.has(printerId)) {
    printerTabs.delete(printerId);
    console.log('Printer tab removed from map:', printerId);
  }
});

// ОБРАБОТЧИК ДЛЯ ВОЗВРАТА НА ГЛАВНЫЙ ЭКРАН
ipcMain.on('focus-main-window', (event) => {
  console.log('Focusing main window...');
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

ipcMain.handle('get-app-version', () => {
  return '1.3.0';
});

// Storage handlers
ipcMain.handle('store-get', (event, key, defaultValue) => {
  return store.get(key, defaultValue);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
  return true;
});

// Menu events
ipcMain.on('menu-add-printer', () => {
  if (mainWindow) {
    mainWindow.webContents.send('menu-add-printer');
  }
});

ipcMain.on('menu-test-all', () => {
  if (mainWindow) {
    mainWindow.webContents.send('menu-test-all');
  }
});

ipcMain.on('show-telegram-help', () => {
  const currentLang = getSavedLanguage();
  const isRussian = currentLang === 'ru';
  showTelegramHelp(isRussian);
});

// App events
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (tabsWindow && !tabsWindow.isDestroyed()) {
    tabsWindow.destroy();
  }
});