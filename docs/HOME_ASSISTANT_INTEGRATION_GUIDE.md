# 🏠 Интеграция 3D Printer Control Panel с Home Assistant

**Дата:** 10 октября 2025  
**Версия проекта:** 1.5.29  
**Сложность:** 🟡 Средняя

---

## 📋 Содержание

1. [Введение](#введение)
2. [Что такое Home Assistant](#что-такое-home-assistant)
3. [Преимущества интеграции](#преимущества-интеграции)
4. [Требования](#требования)
5. [Установка Home Assistant](#установка-home-assistant)
6. [Настройка интеграций](#настройка-интеграций)
7. [Интеграция с проектом](#интеграция-с-проектом)
8. [Примеры использования](#примеры-использования)
9. [FAQ](#faq)

---

## Введение

**Home Assistant** - это универсальное решение для управления умным домом, которое поддерживает тысячи устройств от разных производителей через единый API.

### Зачем использовать Home Assistant?

```
┌─────────────────────────────────────────────────────┐
│  БЕЗ Home Assistant:                                │
│                                                     │
│  3D Printer Control Panel                          │
│         ↓         ↓         ↓                       │
│    Tuya API  Яндекс API  Sonoff API  ...          │
│         ↓         ↓         ↓                       │
│    Розетки   Розетки    Розетки                    │
│                                                     │
│  ❌ Нужна интеграция с каждым API отдельно        │
│  ❌ Яндекс розетки не имеют публичного API        │
│  ❌ Сложная поддержка разных устройств            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  С Home Assistant:                                  │
│                                                     │
│  3D Printer Control Panel                          │
│            ↓                                        │
│    Home Assistant API (единый)                     │
│            ↓                                        │
│  ┌──────────┬──────────┬──────────┬──────────┐    │
│  │ Tuya     │ Яндекс   │ Sonoff   │ TP-Link  │    │
│  │ Розетки  │ Розетки  │ Розетки  │ Розетки  │    │
│  └──────────┴──────────┴──────────┴──────────┘    │
│                                                     │
│  ✅ Один API для всех устройств                    │
│  ✅ Поддержка Яндекс розеток                       │
│  ✅ Легкое добавление новых устройств              │
└─────────────────────────────────────────────────────┘
```

---

## Что такое Home Assistant

**Home Assistant (HA)** - это open-source платформа для автоматизации умного дома:

- 🌍 **Локальное управление** - работает без облака
- 🔓 **Open Source** - полностью бесплатно
- 🔌 **2000+ интеграций** - поддержка огромного количества устройств
- 🎨 **Удобный UI** - красивый веб-интерфейс
- 🤖 **Автоматизация** - мощные сценарии
- 📊 **История данных** - хранение и графики
- 🔒 **Безопасность** - полный контроль над данными

**Официальный сайт:** https://www.home-assistant.io

---

## Преимущества интеграции

### ✅ Универсальность

```
Поддерживаемые розетки:
├─ ✅ Tuya (Smart Life)
├─ ✅ Яндекс
├─ ✅ Sonoff (eWeLink)
├─ ✅ TP-Link (Kasa)
├─ ✅ Xiaomi (Mi Home)
├─ ✅ Meross
├─ ✅ Shelly
└─ ✅ И тысячи других...

Один API для всех!
```

### ✅ Локальная работа

```
Преимущества:
├─ Работает без интернета
├─ Быстрый отклик (<50ms)
├─ Не зависит от облачных сервисов
├─ Полная конфиденциальность
└─ Работает 24/7 даже при сбоях интернета
```

### ✅ Расширяемость

```
Дополнительные возможности:
├─ Управление освещением
├─ Датчики температуры
├─ IP камеры
├─ Климат-контроль
└─ Любые IoT устройства

Можно интегрировать всё в один проект!
```

---

## Требования

### Минимальные требования

```
Аппаратная часть:
├─ Raspberry Pi 4 (2GB RAM) - рекомендуется
├─ Или: старый ПК/ноутбук
├─ Или: виртуальная машина (VMware/VirtualBox)
├─ Или: Docker контейнер
└─ microSD карта 32GB+ (для Raspberry Pi)

Программное обеспечение:
├─ Home Assistant OS (рекомендуется)
├─ Или: Home Assistant Supervised
├─ Или: Home Assistant Core
└─ Или: Home Assistant Container (Docker)

Сеть:
├─ Ethernet подключение (рекомендуется)
├─ Или: Wi-Fi 2.4/5 GHz
└─ Статический IP (желательно)
```

### Рекомендуемая конфигурация

```
🏆 Оптимальная конфигурация:
├─ Raspberry Pi 4 (4GB RAM)
├─ microSD карта 64GB Class 10
├─ Ethernet подключение
├─ UPS (бесперебойное питание)
└─ Статический IP адрес

Цена: ~8000-12000₽
```

---

## Установка Home Assistant

### Вариант 1: Raspberry Pi (РЕКОМЕНДУЕТСЯ)

#### Шаг 1: Скачать образ

```
1. Открыть https://www.home-assistant.io/installation/
2. Выбрать "Raspberry Pi"
3. Скачать образ для вашей модели:
   - Raspberry Pi 4/5: haos_rpi4-64-XX.X.img.xz
   - Raspberry Pi 3: haos_rpi3-64-XX.X.img.xz
```

#### Шаг 2: Записать на microSD

```
Использовать Balena Etcher:

1. Скачать https://www.balena.io/etcher/
2. Вставить microSD карту
3. Выбрать скачанный образ
4. Выбрать microSD карту
5. Нажать "Flash!"
6. Подождать 5-10 минут
```

#### Шаг 3: Первый запуск

```
1. Вставить microSD в Raspberry Pi
2. Подключить Ethernet кабель
3. Подключить питание
4. Подождать 20 минут (первый запуск)
5. Открыть http://homeassistant.local:8123
6. Создать учетную запись
7. Настроить локацию
8. Готово!
```

**Время установки:** ~30 минут  
**Сложность:** 🟢 Легко

---

### Вариант 2: Docker (для продвинутых)

```bash
# 1. Установить Docker
curl -fsSL https://get.docker.com | sh

# 2. Создать папку для конфигурации
mkdir -p /home/pi/homeassistant

# 3. Запустить Home Assistant
docker run -d \
  --name homeassistant \
  --restart=unless-stopped \
  -e TZ=Europe/Moscow \
  -v /home/pi/homeassistant:/config \
  --network=host \
  ghcr.io/home-assistant/home-assistant:stable

# 4. Открыть http://localhost:8123
```

**Время установки:** ~15 минут  
**Сложность:** 🟡 Средне

---

### Вариант 3: Виртуальная машина

```
1. Скачать образ VMDK/VHDX:
   https://www.home-assistant.io/installation/

2. Создать VM в VMware/VirtualBox:
   - RAM: 2GB минимум, 4GB рекомендуется
   - CPU: 2 ядра
   - Сеть: Bridged (важно!)

3. Импортировать образ
4. Запустить VM
5. Открыть http://homeassistant.local:8123
```

**Время установки:** ~45 минут  
**Сложность:** 🟡 Средне

---

## Настройка интеграций

### 1. Интеграция Tuya розеток

#### Вариант A: Через Tuya Cloud (рекомендуется)

```
1. В Home Assistant:
   Settings → Devices & Services → Add Integration
   
2. Найти "Tuya"

3. Выбрать "Tuya Smart Life"

4. Ввести данные:
   - Country: Russia
   - Account Type: Smart Life
   - Username: ваш email от Smart Life
   - Password: ваш пароль

5. Подтвердить → Готово!

Все розетки из Smart Life автоматически появятся в HA.
```

**Время:** 5 минут  
**Сложность:** 🟢 Легко

#### Вариант B: Локально через LocalTuya

```
1. Установить HACS:
   https://hacs.xyz/docs/setup/download

2. В HACS установить "LocalTuya"

3. Получить Local Key каждой розетки:
   - Использовать tuya-cli
   - Или: https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md

4. Добавить каждую розетку:
   Settings → Integrations → LocalTuya
   - Device ID
   - Local Key
   - IP адрес

5. Настроить entity
```

**Время:** 30 минут на розетку  
**Сложность:** 🔴 Сложно

**Рекомендация:** Используйте Вариант A (проще и надежнее)

---

### 2. Интеграция Яндекс розеток

```
1. В Home Assistant:
   Settings → Devices & Services → Add Integration

2. Найти "Yandex Smart Home"

3. Авторизоваться через Яндекс ID:
   - Войти в аккаунт Яндекс
   - Разрешить доступ

4. Готово!

Все устройства из "Дом с Алисой" появятся в HA.
```

**Время:** 5 минут  
**Сложность:** 🟢 Легко

---

### 3. Получение Long-Lived Access Token

**Для интеграции с 3D Printer Control Panel нужен токен:**

```
1. В Home Assistant:
   Профиль (левый нижний угол) → Security

2. Прокрутить вниз до "Long-lived access tokens"

3. Нажать "Create Token"

4. Ввести имя: "3D Printer Control Panel"

5. Скопировать токен (он больше не покажется!)

Пример токена:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIxMjM0NTY3ODkw...
```

**⚠️ ВАЖНО:** Сохраните токен в безопасном месте!

---

## Интеграция с проектом

### Архитектура

```
┌─────────────────────────────────────────────────────┐
│  3D Printer Control Panel (Electron)               │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Home Assistant Adapter                       │ │
│  │                                               │ │
│  │  • Подключение к HA REST API                 │ │
│  │  • Управление розетками                       │ │
│  │  • Получение статуса                          │ │
│  │  • WebSocket для real-time обновлений        │ │
│  └───────────────────────────────────────────────┘ │
│                      ↕                              │
└──────────────────────┼──────────────────────────────┘
                       ↕ HTTP/WebSocket
              ┌────────────────┐
              │ Home Assistant │
              │   REST API     │
              │   WebSocket    │
              └────────────────┘
                       ↕
         ┌─────────────┴─────────────┐
         │                           │
    ┌─────────┐                 ┌─────────┐
    │  Tuya   │                 │ Яндекс  │
    │ Розетки │                 │ Розетки │
    └─────────┘                 └─────────┘
```

---

### Этап 1: Установка зависимостей

```bash
# Установить axios для HTTP запросов
npm install axios

# Опционально: WebSocket клиент для real-time обновлений
npm install ws
```

---

### Этап 2: Создание адаптера

**Файл:** `src/homeassistant-adapter.js`

```javascript
const axios = require('axios');

class HomeAssistantAdapter {
  /**
   * Конструктор адаптера Home Assistant
   * @param {Object} config - Конфигурация подключения
   * @param {string} config.baseUrl - URL Home Assistant (http://homeassistant.local:8123)
   * @param {string} config.token - Long-lived access token
   */
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Удаляем trailing slash
    this.token = config.token;
    
    // Настройка axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 секунд таймаут
    });
  }
  
  /**
   * Проверка подключения к Home Assistant
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const response = await this.client.get('/api/');
      return response.status === 200 && response.data.message === 'API running.';
    } catch (error) {
      console.error('HA connection test failed:', error.message);
      return false;
    }
  }
  
  /**
   * Получить список всех устройств (entities)
   * @returns {Promise<Array>}
   */
  async getEntities() {
    try {
      const response = await this.client.get('/api/states');
      return response.data;
    } catch (error) {
      console.error('Failed to get entities:', error.message);
      throw error;
    }
  }
  
  /**
   * Получить список всех розеток (switch entities)
   * @returns {Promise<Array>}
   */
  async getSwitches() {
    const entities = await this.getEntities();
    return entities.filter(entity => entity.entity_id.startsWith('switch.'));
  }
  
  /**
   * Получить состояние устройства
   * @param {string} entityId - ID устройства (например: switch.printer_1)
   * @returns {Promise<Object>}
   */
  async getState(entityId) {
    try {
      const response = await this.client.get(`/api/states/${entityId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get state for ${entityId}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Включить розетку
   * @param {string} entityId - ID розетки
   * @returns {Promise<Object>}
   */
  async turnOn(entityId) {
    return await this.callService('switch', 'turn_on', entityId);
  }
  
  /**
   * Выключить розетку
   * @param {string} entityId - ID розетки
   * @returns {Promise<Object>}
   */
  async turnOff(entityId) {
    return await this.callService('switch', 'turn_off', entityId);
  }
  
  /**
   * Переключить розетку (toggle)
   * @param {string} entityId - ID розетки
   * @returns {Promise<Object>}
   */
  async toggle(entityId) {
    return await this.callService('switch', 'toggle', entityId);
  }
  
  /**
   * Вызвать сервис Home Assistant
   * @param {string} domain - Домен (switch, light, climate и т.д.)
   * @param {string} service - Сервис (turn_on, turn_off и т.д.)
   * @param {string} entityId - ID устройства
   * @param {Object} data - Дополнительные данные
   * @returns {Promise<Object>}
   */
  async callService(domain, service, entityId, data = {}) {
    try {
      const payload = {
        entity_id: entityId,
        ...data
      };
      
      const response = await this.client.post(
        `/api/services/${domain}/${service}`,
        payload
      );
      
      return response.data;
    } catch (error) {
      console.error(`Failed to call ${domain}.${service}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Получить историю состояния устройства
   * @param {string} entityId - ID устройства
   * @param {Date} startTime - Начало периода
   * @param {Date} endTime - Конец периода (опционально)
   * @returns {Promise<Array>}
   */
  async getHistory(entityId, startTime, endTime = null) {
    try {
      const start = startTime.toISOString();
      const end = endTime ? `&end_time=${endTime.toISOString()}` : '';
      
      const response = await this.client.get(
        `/api/history/period/${start}?filter_entity_id=${entityId}${end}`
      );
      
      return response.data[0] || [];
    } catch (error) {
      console.error(`Failed to get history for ${entityId}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Получить энергопотребление розетки (если поддерживается)
   * @param {string} entityId - ID розетки
   * @returns {Promise<number|null>} - Мощность в Вт или null
   */
  async getPowerConsumption(entityId) {
    try {
      // Ищем sensor с энергопотреблением
      const powerSensorId = entityId.replace('switch.', 'sensor.') + '_power';
      const state = await this.getState(powerSensorId);
      
      if (state && state.state !== 'unavailable') {
        return parseFloat(state.state);
      }
      
      return null;
    } catch (error) {
      // Датчик энергопотребления не найден
      return null;
    }
  }
  
  /**
   * Проверить, включена ли розетка
   * @param {string} entityId - ID розетки
   * @returns {Promise<boolean>}
   */
  async isOn(entityId) {
    const state = await this.getState(entityId);
    return state.state === 'on';
  }
  
  /**
   * Проверить, доступна ли розетка
   * @param {string} entityId - ID розетки
   * @returns {Promise<boolean>}
   */
  async isAvailable(entityId) {
    const state = await this.getState(entityId);
    return state.state !== 'unavailable' && state.state !== 'unknown';
  }
}

module.exports = HomeAssistantAdapter;
```

---

### Этап 3: Интеграция в main.js

**Файл:** `src/main.js`

```javascript
// Импорт в начале файла
const HomeAssistantAdapter = require('./homeassistant-adapter.js');

// Создание instance
let haAdapter = null;

// IPC Handler для настройки подключения
ipcMain.handle('setup-homeassistant', async (event, config) => {
  try {
    haAdapter = new HomeAssistantAdapter({
      baseUrl: config.baseUrl,
      token: config.token
    });
    
    // Тестирование подключения
    const isConnected = await haAdapter.testConnection();
    
    if (isConnected) {
      // Сохранить конфигурацию
      store.set('homeassistant', {
        baseUrl: config.baseUrl,
        token: encrypt(config.token) // Шифруем токен
      });
      
      return { success: true, message: 'Connected to Home Assistant' };
    } else {
      return { success: false, error: 'Connection failed' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handler для получения списка розеток
ipcMain.handle('ha-get-switches', async () => {
  if (!haAdapter) {
    return { success: false, error: 'Home Assistant not configured' };
  }
  
  try {
    const switches = await haAdapter.getSwitches();
    return { success: true, switches };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handler для управления розеткой
ipcMain.handle('ha-control-switch', async (event, entityId, action) => {
  if (!haAdapter) {
    return { success: false, error: 'Home Assistant not configured' };
  }
  
  try {
    let result;
    
    switch (action) {
      case 'turn_on':
        result = await haAdapter.turnOn(entityId);
        break;
      case 'turn_off':
        result = await haAdapter.turnOff(entityId);
        break;
      case 'toggle':
        result = await haAdapter.toggle(entityId);
        break;
      default:
        return { success: false, error: 'Unknown action' };
    }
    
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handler для получения статуса розетки
ipcMain.handle('ha-get-switch-state', async (event, entityId) => {
  if (!haAdapter) {
    return { success: false, error: 'Home Assistant not configured' };
  }
  
  try {
    const state = await haAdapter.getState(entityId);
    const isOn = state.state === 'on';
    const isAvailable = state.state !== 'unavailable';
    
    return {
      success: true,
      state: {
        isOn,
        isAvailable,
        lastChanged: state.last_changed,
        attributes: state.attributes
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Автоматическое подключение при старте
app.whenReady().then(async () => {
  // ... существующий код ...
  
  // Проверить сохраненную конфигурацию HA
  const haConfig = store.get('homeassistant');
  if (haConfig && haConfig.baseUrl && haConfig.token) {
    try {
      haAdapter = new HomeAssistantAdapter({
        baseUrl: haConfig.baseUrl,
        token: decrypt(haConfig.token) // Расшифровываем токен
      });
      
      const isConnected = await haAdapter.testConnection();
      if (isConnected) {
        console.log('✅ Home Assistant connected');
      } else {
        console.log('❌ Home Assistant connection failed');
      }
    } catch (error) {
      console.error('Home Assistant auto-connect error:', error);
    }
  }
});
```

---

### Этап 4: UI для настройки

**Добавить модальное окно в** `src/index.html`:

```html
<!-- Модальное окно настройки Home Assistant -->
<div id="homeassistantModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>🏠 Настройка Home Assistant</h2>
    
    <form id="homeassistantForm">
      <div class="form-group">
        <label for="haBaseUrl">URL Home Assistant:</label>
        <input 
          type="text" 
          id="haBaseUrl" 
          placeholder="http://homeassistant.local:8123"
          required
        >
        <small>Обычно: http://homeassistant.local:8123 или http://IP_ADDRESS:8123</small>
      </div>
      
      <div class="form-group">
        <label for="haToken">Long-Lived Access Token:</label>
        <textarea 
          id="haToken" 
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
          rows="4"
          required
        ></textarea>
        <small>
          Получить в Home Assistant: Профиль → Security → Long-lived access tokens
        </small>
      </div>
      
      <div class="button-group">
        <button type="button" id="haTestConnection" class="btn-secondary">
          🔍 Проверить соединение
        </button>
        <button type="submit" class="btn-primary">
          💾 Сохранить
        </button>
      </div>
    </form>
    
    <div id="haStatus" style="margin-top: 20px;"></div>
  </div>
</div>
```

**JavaScript для управления** в `src/renderer.js`:

```javascript
// Открыть модальное окно настройки HA
function openHomeAssistantSettings() {
  const modal = document.getElementById('homeassistantModal');
  modal.style.display = 'block';
  
  // Загрузить сохраненные настройки
  window.electronAPI.storeGet('homeassistant').then(config => {
    if (config) {
      document.getElementById('haBaseUrl').value = config.baseUrl || '';
      // Токен не показываем (зашифрован)
    }
  });
}

// Проверить соединение
document.getElementById('haTestConnection').addEventListener('click', async () => {
  const baseUrl = document.getElementById('haBaseUrl').value;
  const token = document.getElementById('haToken').value;
  
  if (!baseUrl || !token) {
    showStatus('Заполните все поля', 'error');
    return;
  }
  
  showStatus('Проверка соединения...', 'info');
  
  const result = await window.electronAPI.setupHomeAssistant({ baseUrl, token });
  
  if (result.success) {
    showStatus('✅ Соединение установлено!', 'success');
  } else {
    showStatus(`❌ Ошибка: ${result.error}`, 'error');
  }
});

// Сохранить настройки
document.getElementById('homeassistantForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const baseUrl = document.getElementById('haBaseUrl').value;
  const token = document.getElementById('haToken').value;
  
  const result = await window.electronAPI.setupHomeAssistant({ baseUrl, token });
  
  if (result.success) {
    showStatus('✅ Настройки сохранены!', 'success');
    setTimeout(() => {
      document.getElementById('homeassistantModal').style.display = 'none';
    }, 2000);
  } else {
    showStatus(`❌ Ошибка: ${result.error}`, 'error');
  }
});

function showStatus(message, type) {
  const statusDiv = document.getElementById('haStatus');
  statusDiv.textContent = message;
  statusDiv.className = `status-${type}`;
}
```

**Добавить в** `src/preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ... существующие методы ...
  
  // Home Assistant методы
  setupHomeAssistant: (config) => ipcRenderer.invoke('setup-homeassistant', config),
  haGetSwitches: () => ipcRenderer.invoke('ha-get-switches'),
  haControlSwitch: (entityId, action) => ipcRenderer.invoke('ha-control-switch', entityId, action),
  haGetSwitchState: (entityId) => ipcRenderer.invoke('ha-get-switch-state', entityId)
});
```

---

## Примеры использования

### Пример 1: Автоматическое отключение после печати

```javascript
// В renderer.js или в логике управления принтером

async function handlePrintComplete(printerId) {
  // Получить привязанную розетку для этого принтера
  const printerConfig = printersData.get(printerId);
  
  if (printerConfig.haEntityId) {
    // Подождать 5 минут
    setTimeout(async () => {
      // Выключить розетку
      const result = await window.electronAPI.haControlSwitch(
        printerConfig.haEntityId,
        'turn_off'
      );
      
      if (result.success) {
        console.log(`✅ Питание принтера ${printerId} отключено`);
        
        // Отправить уведомление в Telegram
        sendTelegramNotification(
          `🔌 Питание принтера "${printerConfig.name}" автоматически отключено после завершения печати`
        );
      }
    }, 5 * 60 * 1000); // 5 минут
  }
}
```

---

### Пример 2: Защита от перегрева

```javascript
async function handleOverheat(printerId, temperature) {
  const printerConfig = printersData.get(printerId);
  
  if (printerConfig.haEntityId && temperature > 70) {
    // Немедленно выключить питание
    const result = await window.electronAPI.haControlSwitch(
      printerConfig.haEntityId,
      'turn_off'
    );
    
    if (result.success) {
      console.error(`🔥 КРИТИЧНО! Питание принтера ${printerId} отключено из-за перегрева (${temperature}°C)`);
      
      // Критическое уведомление
      sendTelegramNotification(
        `🔥🚨 КРИТИЧНО!\n` +
        `Принтер "${printerConfig.name}" отключен автоматически!\n` +
        `Температура MCU: ${temperature}°C (критично!)\n` +
        `Требуется проверка!`
      );
    }
  }
}
```

---

### Пример 3: Удаленное включение принтера

```javascript
async function remotePowerOn(printerId) {
  const printerConfig = printersData.get(printerId);
  
  if (!printerConfig.haEntityId) {
    throw new Error('Home Assistant не настроен для этого принтера');
  }
  
  // Включить розетку
  const result = await window.electronAPI.haControlSwitch(
    printerConfig.haEntityId,
    'turn_on'
  );
  
  if (result.success) {
    console.log(`✅ Питание принтера ${printerId} включено`);
    
    // Подождать инициализации принтера (30-60 секунд)
    await new Promise(resolve => setTimeout(resolve, 45000));
    
    // Проверить статус принтера
    const printerStatus = await checkPrinterStatus(printerId);
    
    if (printerStatus === 'ready') {
      return { success: true, message: 'Принтер готов к работе' };
    } else {
      return { success: false, error: 'Принтер не ответил' };
    }
  } else {
    throw new Error(result.error);
  }
}
```

---

### Пример 4: Расписание работы

```javascript
// Настройка расписания в Home Assistant
// (можно создать через UI или через YAML)

// configuration.yaml в Home Assistant:
/*
automation:
  - alias: "3D Farm - Morning Start"
    trigger:
      - platform: time
        at: "07:00:00"
    action:
      - service: switch.turn_on
        target:
          entity_id:
            - switch.printer_1
            - switch.printer_2
            - switch.printer_3
            - switch.printer_4
            - switch.printer_5

  - alias: "3D Farm - Evening Shutdown"
    trigger:
      - platform: time
        at: "23:00:00"
    condition:
      # Только если нет активных печатей
      - condition: state
        entity_id: sensor.active_prints_count
        state: "0"
    action:
      - service: switch.turn_off
        target:
          entity_id:
            - switch.printer_1
            - switch.printer_2
            - switch.printer_3
            - switch.printer_4
            - switch.printer_5
*/

// Или управлять из приложения:
async function scheduleShutdown(printerIds, time) {
  const delay = time - Date.now();
  
  if (delay > 0) {
    setTimeout(async () => {
      for (const printerId of printerIds) {
        const printerConfig = printersData.get(printerId);
        
        if (printerConfig.haEntityId) {
          // Проверить, не печатает ли принтер
          const status = await checkPrinterStatus(printerId);
          
          if (status !== 'printing') {
            await window.electronAPI.haControlSwitch(
              printerConfig.haEntityId,
              'turn_off'
            );
            
            console.log(`✅ Принтер ${printerId} выключен по расписанию`);
          } else {
            console.log(`⏭️ Принтер ${printerId} пропущен (идет печать)`);
          }
        }
      }
    }, delay);
  }
}
```

---

## FAQ

### Q: Нужен ли постоянно работающий сервер для Home Assistant?

**A:** Да, Home Assistant должен работать 24/7 для управления устройствами. Рекомендуется использовать Raspberry Pi или выделенный мини-ПК.

---

### Q: Можно ли использовать Home Assistant без Raspberry Pi?

**A:** Да, можно установить на:
- Старый ПК/ноутбук
- Docker контейнер на любом сервере
- Виртуальную машину (VMware/VirtualBox)
- NAS (Synology/QNAP)

---

### Q: Работает ли это без интернета?

**A:** Да! Home Assistant работает полностью локально. Интернет нужен только для:
- Первоначальной настройки некоторых интеграций
- Удаленного доступа (опционально)
- Обновлений системы

---

### Q: Безопасно ли хранить токен в приложении?

**A:** Да, если использовать шифрование (функции `encrypt`/`decrypt` уже есть в проекте). Токен шифруется перед сохранением в electron-store.

---

### Q: Сколько розеток можно подключить?

**A:** Неограниченно. Home Assistant поддерживает тысячи устройств одновременно. Ограничение только по производительности сервера.

---

### Q: Что быстрее - Tuya Cloud API или Home Assistant?

**A:** Home Assistant обычно быстрее (50-200ms vs 200-500ms), особенно если розетки настроены локально через LocalTuya или через локальные интеграции.

---

### Q: Можно ли использовать и Tuya API, и Home Assistant одновременно?

**A:** Да, можно реализовать оба варианта и позволить пользователю выбирать:
- Tuya API - для простоты (только Tuya розетки)
- Home Assistant - для универсальности (любые розетки)

---

## 🎯 Итоги

### ✅ Преимущества Home Assistant интеграции:

1. **Универсальность** - поддержка ВСЕХ брендов розеток
2. **Яндекс розетки** - работают через HA (нет прямого API)
3. **Локальная работа** - быстро и без облака
4. **Расширяемость** - можно добавить любые IoT устройства
5. **Open Source** - бесплатно и безопасно

### 🟡 Недостатки:

1. **Требуется сервер** - нужен Raspberry Pi или ПК 24/7
2. **Сложнее настройка** - больше шагов чем с Tuya API
3. **Дополнительная точка отказа** - зависимость от работы HA

---

## 📚 Дополнительные ресурсы

### Официальная документация:
- **Home Assistant:** https://www.home-assistant.io/docs/
- **REST API:** https://developers.home-assistant.io/docs/api/rest/
- **WebSocket API:** https://developers.home-assistant.io/docs/api/websocket

### Сообщество:
- **Форум:** https://community.home-assistant.io/
- **Discord:** https://discord.gg/home-assistant
- **Reddit:** https://reddit.com/r/homeassistant

### Видео туториалы:
- **Установка на Raspberry Pi:** https://www.youtube.com/watch?v=sVqyDtEjudk
- **Настройка интеграций:** https://www.youtube.com/watch?v=1liV2VNcyt0

---

## 🎉 Заключение

Интеграция с Home Assistant - это **универсальное решение** для управления умными розетками любых брендов. Если у вас уже есть Home Assistant или вы готовы его установить - это отличный выбор!

**Для быстрого старта** рекомендую Tuya Cloud API (проще).  
**Для максимальной гибкости** - Home Assistant (универсальнее).

Можно реализовать **оба варианта** и дать пользователям выбор! 🚀

---

**Автор:** AI Assistant  
**Дата:** 10 октября 2025  
**Версия:** 1.0

---

📄 **Связанные документы:**
- [Краткая сводка](SMART_PLUGS_SUMMARY_RU.md)
- [Визуальный гид](SMART_PLUGS_QUICK_GUIDE.md)
- [Полное исследование](SMART_PLUGS_INTEGRATION_RESEARCH.md)
- [Итоговая сводка](SMART_PLUGS_RESEARCH_SUMMARY.md)

