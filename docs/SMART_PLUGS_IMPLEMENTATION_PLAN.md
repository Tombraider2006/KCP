# 🔌 План разработки: Интеграция умных розеток

**Дата создания:** 10 октября 2025  
**Проект:** 3D Printer Control Panel v1.5.29  
**Статус:** 📋 Готов к разработке

---

## 📊 Общий обзор

Этот документ - пошаговый план разработки интеграции умных розеток в проект. План включает два варианта:
1. **Tuya Cloud API** - прямая интеграция (приоритет 1)
2. **Home Assistant API** - универсальное решение (приоритет 2)

---

## 🎯 Цели разработки

### Фаза 1: MVP (Минимально жизнеспособный продукт)
- [x] Исследование завершено
- [ ] Базовая интеграция с Tuya Cloud API
- [ ] Ручное управление питанием
- [ ] Автоматическое отключение после печати
- [ ] UI для настройки

**Оценка:** 12 часов

### Фаза 2: Расширенная функциональность
- [ ] Интеграция с Home Assistant API
- [ ] Защита от перегрева
- [ ] Интеграция с Telegram ботом
- [ ] Web-интерфейс управления

**Оценка:** 8 часов

### Фаза 3: Аналитика и полировка
- [ ] Реальное измерение энергопотребления
- [ ] Графики и статистика
- [ ] Документация для пользователей
- [ ] Тестирование

**Оценка:** 6 часов

---

## 📋 ВАРИАНТ 1: Интеграция с Tuya Cloud API

**Приоритет:** 🔴 Высокий  
**Сложность:** 🟡 Средняя  
**Время:** 12 часов на MVP

---

### Этап 1.1: Подготовка окружения (30 минут)

#### Задача 1.1.1: Установка зависимостей

```bash
# В корне проекта
npm install @tuya/tuya-connector-nodejs --save
```

**Файлы для проверки:**
- `package.json` - должен содержать `@tuya/tuya-connector-nodejs`

**Тест:** `npm list @tuya/tuya-connector-nodejs`

---

#### Задача 1.1.2: Регистрация на Tuya IoT Platform

**Шаги:**
1. Открыть https://iot.tuya.com
2. Создать аккаунт (Sign Up)
3. Создать Cloud Project:
   - Region: Europe
   - Industry: Smart Home
4. Получить credentials:
   - Access ID (записать)
   - Access Secret (записать)
5. Подключить API:
   - API Products → Smart Home PaaS → Subscribe
6. Связать аккаунт:
   - Cloud → Link Tuya App Account
   - Ввести логин/пароль от Smart Life
   - Verify

**Результат:**
- Access ID: `xxxxxxxxxx`
- Access Secret: `xxxxxxxxxx`
- Регион: `https://openapi.tuyaeu.com`

**Сохранить в:** `PRIVATE_NOTES.md` (временно)

---

### Этап 1.2: Создание Tuya адаптера (2 часа)

#### Задача 1.2.1: Создать файл адаптера

**Файл:** `src/tuya-adapter.js`

**Структура класса:**

```javascript
const { TuyaContext } = require('@tuya/tuya-connector-nodejs');

class TuyaAdapter {
  constructor(config) {
    // Инициализация
  }
  
  async testConnection() {
    // Проверка подключения
  }
  
  async getDevices() {
    // Получить список всех устройств
  }
  
  async getDeviceStatus(deviceId) {
    // Получить статус конкретного устройства
  }
  
  async turnOn(deviceId) {
    // Включить розетку
  }
  
  async turnOff(deviceId) {
    // Выключить розетку
  }
  
  async sendCommand(deviceId, code, value) {
    // Отправить произвольную команду
  }
  
  async getEnergyStats(deviceId) {
    // Получить статистику энергопотребления
  }
}

module.exports = TuyaAdapter;
```

**Полный код см. в:** `docs/SMART_PLUGS_INTEGRATION_RESEARCH.md` (раздел "Этап 2: Добавление модуля")

**Тесты:**
1. Создать instance класса
2. Вызвать `testConnection()` - должен вернуть `true`
3. Вызвать `getDevices()` - должен вернуть список розеток

---

#### Задача 1.2.2: Добавить логирование

**Добавить в класс:**

```javascript
constructor(config) {
  this.debug = config.debug || false;
  // ...
}

log(message, level = 'info') {
  if (!this.debug && level === 'debug') return;
  
  const timestamp = new Date().toISOString();
  console.log(`[TuyaAdapter ${timestamp}] [${level.toUpperCase()}] ${message}`);
}

// Использование:
this.log('Connection established', 'info');
this.log('Device status retrieved', 'debug');
this.log('Failed to turn on device', 'error');
```

---

#### Задача 1.2.3: Обработка ошибок

**Добавить try-catch во все методы:**

```javascript
async turnOn(deviceId) {
  try {
    this.log(`Turning on device: ${deviceId}`, 'debug');
    
    const result = await this.sendCommand(deviceId, 'switch_1', true);
    
    this.log(`Device ${deviceId} turned on successfully`, 'info');
    return { success: true, result };
    
  } catch (error) {
    this.log(`Failed to turn on ${deviceId}: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}
```

---

### Этап 1.3: Интеграция в main.js (2 часа)

#### Задача 1.3.1: Импорт и инициализация

**Файл:** `src/main.js`

**Добавить в начало файла:**

```javascript
// Импорт адаптера
const TuyaAdapter = require('./tuya-adapter.js');

// Хранилище подключений
const tuyaConnections = new Map(); // printerId -> { adapter, deviceId }
let globalTuyaAdapter = null; // Глобальный адаптер для всех устройств
```

**Добавить в `app.whenReady()`:**

```javascript
app.whenReady().then(async () => {
  // ... существующий код ...
  
  // Инициализация Tuya адаптера
  const tuyaConfig = store.get('tuyaConfig');
  if (tuyaConfig && tuyaConfig.accessId && tuyaConfig.accessSecret) {
    try {
      globalTuyaAdapter = new TuyaAdapter({
        baseUrl: tuyaConfig.baseUrl || 'https://openapi.tuyaeu.com',
        accessKey: tuyaConfig.accessId,
        secretKey: decrypt(tuyaConfig.accessSecret),
        debug: process.argv.includes('--dev')
      });
      
      const isConnected = await globalTuyaAdapter.testConnection();
      if (isConnected) {
        console.log('✅ Tuya Cloud API connected');
      } else {
        console.log('❌ Tuya Cloud API connection failed');
      }
    } catch (error) {
      console.error('Tuya auto-connect error:', error);
    }
  }
});
```

---

#### Задача 1.3.2: IPC Handlers для Tuya

**Добавить обработчики:**

```javascript
// 1. Настройка Tuya подключения
ipcMain.handle('setup-tuya', async (event, config) => {
  try {
    const adapter = new TuyaAdapter({
      baseUrl: config.baseUrl,
      accessKey: config.accessId,
      secretKey: config.accessSecret,
      debug: true
    });
    
    const isConnected = await adapter.testConnection();
    
    if (isConnected) {
      globalTuyaAdapter = adapter;
      
      // Сохранить конфигурацию (зашифровать secret)
      store.set('tuyaConfig', {
        baseUrl: config.baseUrl,
        accessId: config.accessId,
        accessSecret: encrypt(config.accessSecret)
      });
      
      return { success: true, message: 'Connected to Tuya Cloud API' };
    } else {
      return { success: false, error: 'Connection test failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 2. Получить список устройств
ipcMain.handle('tuya-get-devices', async () => {
  if (!globalTuyaAdapter) {
    return { success: false, error: 'Tuya not configured' };
  }
  
  try {
    const devices = await globalTuyaAdapter.getDevices();
    
    // Фильтруем только розетки (switch)
    const switches = devices.filter(d => 
      d.category === 'cz' || // Socket
      d.category === 'pc' || // Power strip
      d.product_name.toLowerCase().includes('socket') ||
      d.product_name.toLowerCase().includes('plug')
    );
    
    return { success: true, devices: switches };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 3. Привязать розетку к принтеру
ipcMain.handle('tuya-link-device', async (event, printerId, deviceId) => {
  tuyaConnections.set(printerId, {
    adapter: globalTuyaAdapter,
    deviceId: deviceId
  });
  
  // Сохранить в настройках принтера
  const printers = store.get('printers', []);
  const printer = printers.find(p => p.id === printerId);
  if (printer) {
    printer.tuyaDeviceId = deviceId;
    store.set('printers', printers);
  }
  
  return { success: true };
});

// 4. Управление розеткой
ipcMain.handle('tuya-control-device', async (event, printerId, action) => {
  const connection = tuyaConnections.get(printerId);
  
  if (!connection) {
    return { success: false, error: 'Device not linked' };
  }
  
  try {
    let result;
    
    switch (action) {
      case 'turn_on':
        result = await connection.adapter.turnOn(connection.deviceId);
        break;
      case 'turn_off':
        result = await connection.adapter.turnOff(connection.deviceId);
        break;
      case 'get_status':
        result = await connection.adapter.getDeviceStatus(connection.deviceId);
        break;
      default:
        return { success: false, error: 'Unknown action' };
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 5. Получить статистику энергопотребления
ipcMain.handle('tuya-get-energy-stats', async (event, printerId) => {
  const connection = tuyaConnections.get(printerId);
  
  if (!connection) {
    return { success: false, error: 'Device not linked' };
  }
  
  try {
    const stats = await connection.adapter.getEnergyStats(connection.deviceId);
    return { success: true, stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

---

#### Задача 1.3.3: Автоматизация

**Добавить функцию автоматического отключения:**

```javascript
// Функция для обработки завершения печати
async function handlePrintComplete(printerId) {
  const connection = tuyaConnections.get(printerId);
  
  if (!connection) return;
  
  // Получить настройки принтера
  const printers = store.get('printers', []);
  const printer = printers.find(p => p.id === printerId);
  
  if (!printer || !printer.autoShutdownEnabled) return;
  
  const delay = (printer.autoShutdownDelay || 5) * 60 * 1000; // минуты в мс
  
  console.log(`Scheduling shutdown for printer ${printerId} in ${delay/60000} minutes`);
  
  setTimeout(async () => {
    try {
      const result = await connection.adapter.turnOff(connection.deviceId);
      
      if (result.success) {
        console.log(`✅ Printer ${printerId} powered off automatically`);
        
        // Отправить уведомление в Telegram
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('printer-powered-off', {
            printerId,
            reason: 'auto_shutdown_after_complete'
          });
        }
      }
    } catch (error) {
      console.error(`Failed to auto-shutdown printer ${printerId}:`, error);
    }
  }, delay);
}

// Вызывать эту функцию когда принтер завершает печать
// В renderer.js или в обработчике статуса принтера
```

**Функция защиты от перегрева:**

```javascript
async function handleOverheat(printerId, temperature) {
  const connection = tuyaConnections.get(printerId);
  
  if (!connection) return;
  
  // Критический порог
  const CRITICAL_TEMP = 70;
  
  if (temperature > CRITICAL_TEMP) {
    console.error(`🔥 CRITICAL: Printer ${printerId} overheating! (${temperature}°C)`);
    
    try {
      // Немедленно выключить питание
      const result = await connection.adapter.turnOff(connection.deviceId);
      
      if (result.success) {
        console.log(`✅ Emergency shutdown: Printer ${printerId} powered off`);
        
        // Отправить критическое уведомление
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('printer-emergency-shutdown', {
            printerId,
            temperature,
            reason: 'overheat'
          });
        }
      }
    } catch (error) {
      console.error(`Failed to emergency shutdown printer ${printerId}:`, error);
    }
  }
}
```

---

### Этап 1.4: UI для настройки (3 часа)

#### Задача 1.4.1: Модальное окно настройки Tuya

**Файл:** `src/index.html`

**Добавить модальное окно:**

```html
<!-- Модальное окно настройки Tuya Cloud API -->
<div id="tuyaConfigModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>🔌 Настройка Tuya Cloud API</h2>
    
    <div class="info-box">
      <h3>📋 Подготовка:</h3>
      <ol>
        <li>Зарегистрируйтесь на <a href="https://iot.tuya.com" target="_blank">iot.tuya.com</a></li>
        <li>Создайте Cloud Project</li>
        <li>Получите Access ID и Access Secret</li>
        <li>Подключите Smart Home PaaS API</li>
        <li>Свяжите аккаунт Smart Life</li>
      </ol>
      <a href="#" id="tuyaHelpLink">📚 Подробная инструкция</a>
    </div>
    
    <form id="tuyaConfigForm">
      <div class="form-group">
        <label for="tuyaRegion">Регион:</label>
        <select id="tuyaRegion" required>
          <option value="https://openapi.tuyaeu.com">Europe</option>
          <option value="https://openapi.tuyaus.com">USA</option>
          <option value="https://openapi.tuyacn.com">China</option>
          <option value="https://openapi.tuyain.com">India</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="tuyaAccessId">Access ID:</label>
        <input 
          type="text" 
          id="tuyaAccessId" 
          placeholder="xxxxxxxxxxxxxxxxxx"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="tuyaAccessSecret">Access Secret:</label>
        <input 
          type="password" 
          id="tuyaAccessSecret" 
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          required
        >
        <small>⚠️ Будет храниться в зашифрованном виде</small>
      </div>
      
      <div class="button-group">
        <button type="button" id="tuyaTestConnection" class="btn-secondary">
          🔍 Проверить соединение
        </button>
        <button type="submit" class="btn-primary">
          💾 Сохранить
        </button>
      </div>
    </form>
    
    <div id="tuyaStatus" class="status-message"></div>
  </div>
</div>
```

---

#### Задача 1.4.2: Модальное окно привязки розетки к принтеру

**Добавить в** `src/index.html`:

```html
<!-- Модальное окно привязки розетки -->
<div id="linkPlugModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>🔌 Подключение умной розетки</h2>
    
    <p><strong>Принтер:</strong> <span id="linkPlugPrinterName"></span></p>
    
    <form id="linkPlugForm">
      <div class="form-group">
        <label for="selectTuyaDevice">Выберите розетку:</label>
        <select id="selectTuyaDevice" required>
          <option value="">Загрузка...</option>
        </select>
        <button type="button" id="refreshTuyaDevices" class="btn-small">
          🔄 Обновить список
        </button>
      </div>
      
      <div class="form-group">
        <h3>⚙️ Настройки автоматизации:</h3>
        
        <label class="checkbox-label">
          <input type="checkbox" id="autoShutdownEnabled" checked>
          Автоматически выключать после завершения печати
        </label>
        
        <div class="sub-setting">
          <label for="autoShutdownDelay">Задержка выключения (минут):</label>
          <input 
            type="number" 
            id="autoShutdownDelay" 
            min="0" 
            max="60" 
            value="5"
          >
        </div>
        
        <label class="checkbox-label">
          <input type="checkbox" id="autoShutdownError" checked>
          Автоматически выключать при ошибке печати
        </label>
        
        <label class="checkbox-label">
          <input type="checkbox" id="autoShutdownOverheat" checked>
          Автоматически выключать при перегреве (MCU > 70°C)
        </label>
      </div>
      
      <div class="button-group">
        <button type="button" id="testPlugConnection" class="btn-secondary">
          ⚡ Проверить розетку
        </button>
        <button type="submit" class="btn-primary">
          ✅ Подключить
        </button>
      </div>
    </form>
    
    <div id="linkPlugStatus" class="status-message"></div>
  </div>
</div>
```

---

#### Задача 1.4.3: Кнопка управления питанием в карточке принтера

**Модифицировать функцию создания карточки принтера:**

```javascript
function createPrinterCard(printer) {
  // ... существующий код ...
  
  // Добавить кнопку управления питанием
  const powerControlHtml = printer.tuyaDeviceId ? `
    <div class="power-control">
      <button 
        class="power-btn ${printer.powerStatus === 'on' ? 'power-on' : 'power-off'}"
        data-printer-id="${printer.id}"
        data-action="toggle"
        title="${printer.powerStatus === 'on' ? 'Выключить питание' : 'Включить питание'}"
      >
        <span class="power-icon">⚡</span>
        <span class="power-text">
          ${printer.powerStatus === 'on' ? 'ВКЛ' : 'ВЫКЛ'}
        </span>
      </button>
      <button 
        class="settings-btn"
        data-printer-id="${printer.id}"
        data-action="configure"
        title="Настроить розетку"
      >
        ⚙️
      </button>
    </div>
  ` : `
    <div class="power-control">
      <button 
        class="link-plug-btn"
        data-printer-id="${printer.id}"
        title="Подключить умную розетку"
      >
        🔌 Подключить розетку
      </button>
    </div>
  `;
  
  // Вставить в карточку
  // ...
}
```

---

#### Задача 1.4.4: JavaScript для управления

**Файл:** `src/renderer.js`

**Добавить обработчики:**

```javascript
// Открыть настройки Tuya
document.getElementById('openTuyaSettings').addEventListener('click', () => {
  openTuyaConfigModal();
});

function openTuyaConfigModal() {
  const modal = document.getElementById('tuyaConfigModal');
  modal.style.display = 'block';
  
  // Загрузить сохраненные настройки
  window.electronAPI.storeGet('tuyaConfig').then(config => {
    if (config) {
      document.getElementById('tuyaRegion').value = config.baseUrl || 'https://openapi.tuyaeu.com';
      document.getElementById('tuyaAccessId').value = config.accessId || '';
      // Secret не показываем
    }
  });
}

// Тест соединения Tuya
document.getElementById('tuyaTestConnection').addEventListener('click', async () => {
  const baseUrl = document.getElementById('tuyaRegion').value;
  const accessId = document.getElementById('tuyaAccessId').value;
  const accessSecret = document.getElementById('tuyaAccessSecret').value;
  
  if (!accessId || !accessSecret) {
    showStatus('tuyaStatus', 'Заполните все поля', 'error');
    return;
  }
  
  showStatus('tuyaStatus', 'Проверка соединения...', 'info');
  
  const result = await window.electronAPI.setupTuya({
    baseUrl,
    accessId,
    accessSecret
  });
  
  if (result.success) {
    showStatus('tuyaStatus', '✅ Соединение установлено!', 'success');
  } else {
    showStatus('tuyaStatus', `❌ Ошибка: ${result.error}`, 'error');
  }
});

// Сохранить настройки Tuya
document.getElementById('tuyaConfigForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const baseUrl = document.getElementById('tuyaRegion').value;
  const accessId = document.getElementById('tuyaAccessId').value;
  const accessSecret = document.getElementById('tuyaAccessSecret').value;
  
  const result = await window.electronAPI.setupTuya({
    baseUrl,
    accessId,
    accessSecret
  });
  
  if (result.success) {
    showStatus('tuyaStatus', '✅ Настройки сохранены!', 'success');
    setTimeout(() => {
      document.getElementById('tuyaConfigModal').style.display = 'none';
    }, 2000);
  } else {
    showStatus('tuyaStatus', `❌ Ошибка: ${result.error}`, 'error');
  }
});

// Подключить розетку к принтеру
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('link-plug-btn')) {
    const printerId = e.target.dataset.printerId;
    await openLinkPlugModal(printerId);
  }
  
  // Управление питанием
  if (e.target.closest('.power-btn')) {
    const printerId = e.target.closest('.power-btn').dataset.printerId;
    await togglePower(printerId);
  }
});

async function openLinkPlugModal(printerId) {
  const modal = document.getElementById('linkPlugModal');
  const printer = printersData.get(printerId);
  
  document.getElementById('linkPlugPrinterName').textContent = printer.name;
  modal.dataset.printerId = printerId;
  
  // Загрузить список устройств
  await refreshTuyaDevices();
  
  modal.style.display = 'block';
}

async function refreshTuyaDevices() {
  const select = document.getElementById('selectTuyaDevice');
  select.innerHTML = '<option value="">Загрузка...</option>';
  
  const result = await window.electronAPI.tuyaGetDevices();
  
  if (result.success) {
    select.innerHTML = '<option value="">-- Выберите розетку --</option>';
    
    result.devices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.id;
      option.textContent = `${device.name} (${device.product_name})`;
      select.appendChild(option);
    });
  } else {
    select.innerHTML = '<option value="">Ошибка загрузки</option>';
    showStatus('linkPlugStatus', `Ошибка: ${result.error}`, 'error');
  }
}

async function togglePower(printerId) {
  const action = // Определить текущий статус и переключить
  
  const result = await window.electronAPI.tuyaControlDevice(printerId, action);
  
  if (result.success) {
    // Обновить UI
    updatePowerStatus(printerId, action === 'turn_on' ? 'on' : 'off');
  } else {
    alert(`Ошибка управления питанием: ${result.error}`);
  }
}
```

---

### Этап 1.5: Обновление preload.js (30 минут)

**Файл:** `src/preload.js`

**Добавить методы:**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ... существующие методы ...
  
  // Tuya методы
  setupTuya: (config) => ipcRenderer.invoke('setup-tuya', config),
  tuyaGetDevices: () => ipcRenderer.invoke('tuya-get-devices'),
  tuyaLinkDevice: (printerId, deviceId) => ipcRenderer.invoke('tuya-link-device', printerId, deviceId),
  tuyaControlDevice: (printerId, action) => ipcRenderer.invoke('tuya-control-device', printerId, action),
  tuyaGetEnergyStats: (printerId) => ipcRenderer.invoke('tuya-get-energy-stats', printerId),
  
  // Слушатели событий
  onPrinterPoweredOff: (callback) => ipcRenderer.on('printer-powered-off', callback),
  onPrinterEmergencyShutdown: (callback) => ipcRenderer.on('printer-emergency-shutdown', callback)
});
```

---

### Этап 1.6: Стилизация (1 час)

**Файл:** `src/styles.css`

**Добавить стили:**

```css
/* Модальные окна */
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-content {
  background-color: #fefefe;
  margin: 5% auto;
  padding: 30px;
  border: 1px solid #888;
  border-radius: 10px;
  width: 600px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

/* Кнопки управления питанием */
.power-control {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.power-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.power-btn.power-on {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.power-btn.power-on:hover {
  background: linear-gradient(135deg, #45a049, #3d8b40);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.6);
}

.power-btn.power-off {
  background: linear-gradient(135deg, #f44336, #da190b);
  color: white;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
}

.power-btn.power-off:hover {
  background: linear-gradient(135deg, #da190b, #c1160a);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.6);
}

.power-icon {
  font-size: 20px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.link-plug-btn {
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.link-plug-btn:hover {
  background: linear-gradient(135deg, #1976D2, #1565C0);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.5);
}

/* Статус сообщения */
.status-message {
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-weight: 500;
}

.status-message.status-info {
  background: #e3f2fd;
  border: 1px solid #2196F3;
  color: #1565C0;
}

.status-message.status-success {
  background: #e8f5e9;
  border: 1px solid #4CAF50;
  color: #2e7d32;
}

.status-message.status-error {
  background: #ffebee;
  border: 1px solid #f44336;
  color: #c62828;
}

/* Info box */
.info-box {
  background: #f5f5f5;
  border-left: 4px solid #2196F3;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.info-box h3 {
  margin-top: 0;
  color: #1976D2;
}

.info-box ol {
  margin: 10px 0;
  padding-left: 20px;
}

.info-box li {
  margin: 5px 0;
}
```

---

### Этап 1.7: Тестирование (2 часа)

#### Тест 1: Подключение к Tuya Cloud API

**Проверить:**
1. Открыть настройки Tuya
2. Ввести credentials
3. Нажать "Проверить соединение"
4. Должно показать "✅ Соединение установлено!"

**Ожидаемый результат:** Успешное подключение

---

#### Тест 2: Получение списка устройств

**Проверить:**
1. Открыть модальное окно привязки розетки
2. Нажать "Обновить список"
3. Должны появиться все розетки из Smart Life

**Ожидаемый результат:** Список розеток загружен

---

#### Тест 3: Управление розеткой

**Проверить:**
1. Подключить розетку к принтеру
2. Нажать кнопку включения
3. Розетка должна включиться (проверить физически)
4. Нажать кнопку выключения
5. Розетка должна выключиться

**Ожидаемый результат:** Розетка реагирует на команды

---

#### Тест 4: Автоматическое отключение

**Проверить:**
1. Настроить автоотключение (5 минут)
2. Завершить печать на принтере
3. Через 5 минут розетка должна выключиться
4. Должно прийти уведомление

**Ожидаемый результат:** Автоматика работает

---

### Этап 1.8: Документация для пользователей (1 час)

**Создать файл:** `docs/TUYA_USER_GUIDE_RU.md`

**Содержание:**
1. Что такое Tuya Cloud API
2. Пошаговая инструкция регистрации
3. Как подключить розетки
4. Как настроить автоматизацию
5. FAQ
6. Решение проблем

---

## 📋 ВАРИАНТ 2: Интеграция с Home Assistant

**Приоритет:** 🟡 Средний  
**Сложность:** 🟡 Средняя  
**Время:** 6 часов

---

### Этап 2.1: Проверка Home Assistant (30 минут)

#### Задача 2.1.1: Проверить установку HA

**Проверить:**
1. Home Assistant запущен и доступен
2. Получить URL (например: `http://homeassistant.local:8123`)
3. Создать Long-lived access token:
   - Профиль → Security → Create Token
   - Сохранить токен

**Тест:**
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  http://homeassistant.local:8123/api/
```

**Ожидаемый результат:**
```json
{"message": "API running."}
```

---

### Этап 2.2: Создание HA адаптера (2 часа)

**Файл:** `src/homeassistant-adapter.js`

**Полный код см. в:** `docs/HOME_ASSISTANT_INTEGRATION_GUIDE.md` (Этап 2)

**Основные методы:**
- `testConnection()` - проверка подключения
- `getEntities()` - получить все устройства
- `getSwitches()` - получить все розетки
- `turnOn(entityId)` - включить
- `turnOff(entityId)` - выключить
- `getState(entityId)` - получить статус

---

### Этап 2.3: Интеграция в main.js (2 часа)

**Аналогично Tuya, но для Home Assistant:**

1. Импорт адаптера
2. Инициализация при старте
3. IPC handlers:
   - `setup-homeassistant`
   - `ha-get-switches`
   - `ha-control-switch`
   - `ha-get-switch-state`

**Полный код см. в:** `docs/HOME_ASSISTANT_INTEGRATION_GUIDE.md` (Этап 3)

---

### Этап 2.4: UI для Home Assistant (1.5 часа)

**Добавить модальное окно настройки:**
- URL Home Assistant
- Access Token
- Кнопка "Проверить соединение"

**Модифицировать окно привязки розетки:**
- Добавить выбор: Tuya / Home Assistant
- Показывать соответствующий список устройств

---

## 📊 Общий чек-лист разработки

### Фаза 1: Подготовка (1 час)
- [ ] Установить `@tuya/tuya-connector-nodejs`
- [ ] Зарегистрироваться на Tuya IoT Platform
- [ ] Получить Access ID и Secret
- [ ] Проверить Home Assistant (URL + Token)

### Фаза 2: Tuya интеграция (10 часов)
- [ ] Создать `tuya-adapter.js`
- [ ] Добавить IPC handlers в `main.js`
- [ ] Создать UI (модальные окна)
- [ ] Добавить кнопки управления
- [ ] Реализовать автоматизацию
- [ ] Добавить стили
- [ ] Протестировать все функции

### Фаза 3: Home Assistant интеграция (6 часов)
- [ ] Создать `homeassistant-adapter.js`
- [ ] Добавить IPC handlers
- [ ] Создать UI для настройки
- [ ] Модифицировать окно привязки
- [ ] Протестировать

### Фаза 4: Финализация (3 часа)
- [ ] Написать документацию для пользователей
- [ ] Обновить README
- [ ] Создать Release Notes
- [ ] Финальное тестирование
- [ ] Подготовка к релизу

---

## 🎯 Критерии готовности

### MVP готов, если:
✅ Пользователь может настроить Tuya Cloud API  
✅ Пользователь может подключить розетку к принтеру  
✅ Пользователь может включать/выключать розетку вручную  
✅ Розетка автоматически выключается после завершения печати  
✅ Есть базовая документация  

### Полная версия готова, если:
✅ Работает интеграция с Tuya  
✅ Работает интеграция с Home Assistant  
✅ Защита от перегрева функционирует  
✅ Интеграция с Telegram ботом  
✅ Интеграция с Web-сервером  
✅ Реальное измерение энергопотребления  
✅ Полная документация на русском и английском  
✅ Все тесты пройдены  

---

## 📝 Заметки для разработки

### Важные моменты:

1. **Шифрование токенов:**
   - Всегда используйте `encrypt()` для сохранения secrets
   - Используйте `decrypt()` при загрузке

2. **Обработка ошибок:**
   - Все async функции должны иметь try-catch
   - Логировать все ошибки
   - Показывать понятные сообщения пользователю

3. **Тестирование:**
   - Тестировать каждую функцию отдельно
   - Проверять на реальных устройствах
   - Проверять автоматизацию в разных сценариях

4. **Безопасность:**
   - Никогда не логировать токены
   - Не сохранять secrets в plain text
   - Проверять все входные данные

5. **Производительность:**
   - Кэшировать список устройств
   - Не опрашивать API слишком часто
   - Использовать debounce для частых запросов

---

## 🚀 Начало разработки

### Завтра начнем с:

1. ☕ **Утро:**
   - Установка зависимостей
   - Регистрация на Tuya IoT Platform
   - Создание `tuya-adapter.js`

2. 🌤️ **День:**
   - Интеграция в `main.js`
   - Создание UI
   - Первые тесты

3. 🌙 **Вечер:**
   - Автоматизация
   - Финальное тестирование
   - MVP готов!

---

**Автор:** AI Assistant  
**Дата создания:** 10 октября 2025  
**Последнее обновление:** 10 октября 2025  
**Статус:** ✅ Готов к разработке

---

## 📚 Связанные документы

- [Итоговая сводка исследования](SMART_PLUGS_RESEARCH_SUMMARY.md)
- [Полное исследование Tuya/Яндекс](SMART_PLUGS_INTEGRATION_RESEARCH.md)
- [Руководство по Home Assistant](HOME_ASSISTANT_INTEGRATION_GUIDE.md)
- [Быстрый гид](SMART_PLUGS_QUICK_GUIDE.md)

---

**🎯 ГОТОВЫ НАЧАТЬ РАЗРАБОТКУ!**

Завтра просто откройте этот файл и следуйте пошаговому плану. Удачи! 🚀

