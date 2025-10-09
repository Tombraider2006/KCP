# 🏗️ Архитектура системы сменной работы

## Обзор

Система сменной работы представляет собой полноценную подсистему управления пользователями, сменами, аналитикой и отчетностью для 3D Printer Control Panel.

---

## 📦 Компоненты системы

### 1. Backend модули (Node.js)

#### `user-manager.js`
**Назначение:** Управление пользователями и ролями

**Основные функции:**
- ✅ Создание администратора (первичная настройка)
- ✅ Добавление/удаление операторов
- ✅ Аутентификация пользователей
- ✅ Сброс паролей
- ✅ Управление статусом операторов (активен/неактивен)
- ✅ Логирование действий

**Хранилище:** `users-data` (electron-store, encrypted)

**Роли:**
- `admin` - Администратор (полный доступ)
- `operator` - Оператор (ограниченный доступ)

---

#### `shift-manager.js`
**Назначение:** Управление сменами

**Основные функции:**
- ✅ Начало новой смены
- ✅ Завершение смены
- ✅ Передача смены между пользователями
- ✅ Добавление событий смены
- ✅ Отслеживание статистики смены в реальном времени
- ✅ История смен
- ✅ Расчет эффективности смены

**Хранилище:** `shifts-data` (electron-store, encrypted)

**Структура смены:**
```javascript
{
  id: 'shift_...',
  userId: 'user_...',
  username: 'ivan',
  displayName: 'Иван Иванов',
  role: 'operator',
  startTime: '2025-10-09T12:00:00.000Z',
  endTime: null,
  duration: 0,
  events: [],
  statistics: {
    printsStarted: 0,
    printsCompleted: 0,
    printsFailed: 0,
    printsPaused: 0,
    gaps: 0,
    pauses: 0,
    totalGapTime: 0,
    totalPauseTime: 0,
    efficiencyScore: 100
  },
  notes: []
}
```

---

#### `reports-manager.js`
**Назначение:** Генерация отчетов и расчет KPI

**Основные функции:**
- ✅ Генерация кратких отчетов (KPI)
- ✅ Генерация подробных отчетов
- ✅ Сравнительные отчеты (несколько операторов)
- ✅ Расчет KPI (Productivity, Quality, Efficiency, Reliability)
- ✅ Анализ неэффективности
- ✅ Генерация рекомендаций
- ✅ Подготовка данных для графиков

**Хранилище:** `reports-data` (electron-store, encrypted)

**Формула KPI:**
```
Overall Score = 
  Productivity × 0.30 +
  Quality × 0.30 +
  Efficiency × 0.25 +
  Reliability × 0.15
```

---

### 2. Frontend компоненты (HTML/JavaScript)

#### `setup-admin.html`
**Назначение:** Первичная настройка системы

**Функции:**
- Создание первого администратора
- Проверка надежности пароля
- Отображение созданного пароля для записи

**Стиль:** Modern gradient UI с анимациями

---

#### `login.html`
**Назначение:** Экран входа в систему

**Функции:**
- Выбор пользователя из списка (с группировкой по ролям)
- Ввод пароля с возможностью показать/скрыть
- Отображение информации об активной смене
- Автоматический запуск смены при входе

**Особенности:**
- Разделение админов и операторов в select
- Автофокус на поле пароля после выбора пользователя
- Эмодзи индикаторы ролей (👑 админ, 👤 оператор)

---

#### `shift-control-panel.js`
**Назначение:** UI панель управления сменами и пользователями

**Компоненты:**

1. **Верхняя информационная панель**
   - Отображение текущего оператора
   - Счетчик времени смены
   - Кнопки управления

2. **Модальное окно "Управление пользователями"** (только админ)
   - Список операторов
   - Добавление оператора
   - Управление операторами (сброс пароля, деактивация, удаление)

3. **Модальное окно "Передача смены"**
   - Выбор нового оператора
   - Ввод пароля нового оператора
   - Автоматическое завершение/начало смен

4. **Модальное окно "Отчеты"**
   - Выбор периода (день/неделя/месяц)
   - Выбор оператора (только админ видит всех)
   - Отображение KPI и детальной статистики
   - Сравнительные отчеты

---

### 3. Интеграция с основным приложением

#### Изменения в `main.js`

**Добавлено:**
```javascript
const UserManager = require('./user-manager');
const ShiftManager = require('./shift-manager');
const userManager = new UserManager();
const shiftManager = new ShiftManager();
```

**Защита от закрытия окна:**
```javascript
mainWindow.on('close', async (event) => {
  if (!canClose) {
    event.preventDefault();
    mainWindow.webContents.send('before-quit-check');
    
    ipcMain.once('confirm-quit', (e, confirmed) => {
      if (confirmed) {
        canClose = true;
        mainWindow.close();
      }
    });
  }
});
```

---

#### Изменения в `preload.js`

**Добавлено:**
```javascript
// Shift Management & User System
onBeforeQuit: (callback) => ipcRenderer.on('before-quit-check', callback),
removeBeforeQuitListener: () => ipcRenderer.removeAllListeners('before-quit-check'),
confirmQuit: (canQuit) => ipcRenderer.send('confirm-quit', canQuit)
```

---

#### Изменения в `index.html`

**Добавлено:**
1. Подключение `shift-control-panel.js`
2. Обработчик события `before-quit-check` с запросом пароля
3. Проверка аутентификации при загрузке страницы
4. Редирект на `setup-admin.html` или `login.html` при необходимости

---

#### Изменения в `renderer.js`

**Модифицированные функции:**

1. **`sendTelegramNotification()`**
   - Добавлено получение информации о текущем операторе
   - Добавлена строка с оператором в сообщение

```javascript
const currentUser = await window.electronAPI.storeGet('currentUser', null);
if (currentUser) {
  operatorInfo = `\n👤 *Operator:* ${currentUser.displayName}`;
}
```

2. **`trackStatusTransition()`**
   - Изменено на async функцию
   - Добавлено сохранение информации об операторе в события

```javascript
const ev = { 
  printerId: printerIdStr, 
  ts: Date.now(), 
  from: fromStatus, 
  to: toStatus,
  operatorId: operatorId,
  operatorName: operatorName
};
```

3. **`checkStatusChanges()`**
   - Изменено на async функцию
   - Используется `for...of` вместо `forEach` для поддержки await

---

## 🔐 Безопасность

### Хеширование паролей

```javascript
hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + 'salt_3dc_panel_2025')
    .digest('hex');
}
```

### Шифрование хранилищ

Все хранилища используют `electron-store` с шифрованием:

```javascript
new Store({
  name: 'users-data',
  encryptionKey: 'y0ur-s3cr3t-k3y-f0r-us3r-d4t4'
});
```

### Санитизация данных

Перед отправкой пользователю данные очищаются от чувствительной информации:

```javascript
sanitizeUser(user) {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}
```

---

## 📊 Поток данных

### 1. Запуск приложения

```
index.html загружается
    ↓
Проверка: userManager.isInitialized()?
    ↓
НЕТ → redirect setup-admin.html
ДА → Проверка: isAuthenticated?
    ↓
НЕТ → redirect login.html
ДА → Отображение главного окна
    ↓
Загрузка shift-control-panel.js
    ↓
Создание верхней панели управления
```

### 2. Аутентификация

```
login.html
    ↓
Пользователь выбирает логин
    ↓
Пользователь вводит пароль
    ↓
userManager.authenticate(username, password)
    ↓
Проверка хеша пароля
    ↓
УСПЕХ → Старт смены (если нет активной)
    ↓
Сохранение currentUser в electron-store
    ↓
Редирект на index.html
```

### 3. Отслеживание событий

```
Принтер меняет статус
    ↓
checkStatusChanges()
    ↓
await trackStatusTransition(printerId, from, to)
    ↓
Получение currentUser
    ↓
Создание события с operatorId/operatorName
    ↓
analytics.events.push(event)
    ↓
Если есть смена → shiftManager.addShiftEvent()
    ↓
Обновление statistics смены
    ↓
Пересчет efficiencyScore
```

### 4. Генерация отчета

```
Нажатие "Сформировать отчет"
    ↓
reportsManager.generateShortReport(userId, period)
    ↓
shiftManager.getUserShiftStatistics(userId, period)
    ↓
Фильтрация смен по периоду
    ↓
Расчет KPI (productivity, quality, efficiency, reliability)
    ↓
Расчет общего балла (weighted average)
    ↓
Анализ неэффективности
    ↓
Генерация рекомендаций
    ↓
Отображение в UI
```

---

## 🔄 Жизненный цикл смены

```
┌─────────────────────────────────────────────────────┐
│ 1. ВХОД В СИСТЕМУ                                    │
│    - Аутентификация                                  │
│    - shiftManager.startShift()                       │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 2. АКТИВНАЯ СМЕНА                                    │
│    - Отслеживание событий                            │
│    - Обновление statistics                           │
│    - Расчет эффективности                            │
│    - Добавление заметок (notes)                      │
└──────────────────┬──────────────────────────────────┘
                   ↓
           ┌───────┴────────┐
           │                │
    ПЕРЕДАЧА СМЕНЫ    ЗАВЕРШЕНИЕ СМЕНЫ
           │                │
           ↓                ↓
┌──────────────────┐  ┌──────────────────┐
│ 3a. ПЕРЕДАЧА     │  │ 3b. ЗАВЕРШЕНИЕ   │
│  - endShift()    │  │  - endShift()    │
│  - startShift()  │  │  - Сохранение    │
│  - Без выхода    │  │  - Выход/закрытие│
└──────────────────┘  └──────────────────┘
           │                │
           └───────┬────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ 4. ИСТОРИЯ                                           │
│    - Смена сохранена в shift_history                │
│    - Доступна для отчетов                            │
│    - Хранится до 1000 смен                           │
└─────────────────────────────────────────────────────┘
```

---

## 📈 Метрики производительности

### Расчет эффективности смены

```javascript
recalculateEfficiency() {
  let efficiency = 100;
  
  // 1. Штраф за неудачные печати (до -20%)
  const failureRate = stats.printsFailed / stats.printsStarted;
  efficiency -= failureRate * 20;
  
  // 2. Штраф за паузы (до -15%)
  const pausePenalty = Math.min(stats.pauses * 2, 15);
  efficiency -= pausePenalty;
  
  // 3. Штраф за перерывы (до -20%)
  const gapPenalty = Math.min(stats.gaps * 3, 20);
  efficiency -= gapPenalty;
  
  // 4. Штраф за время простоя (до -25%)
  const totalShiftTime = Date.now() - new Date(shift.startTime);
  const idleTimeRatio = (stats.totalGapTime + stats.totalPauseTime) / totalShiftTime;
  const idlePenalty = Math.min(idleTimeRatio * 30, 25);
  efficiency -= idlePenalty;
  
  return Math.max(0, Math.round(efficiency));
}
```

### Расчет KPI производительности

```javascript
// Производительность (0-100)
const avgPrintsPerHour = printsCompleted / (duration / (1000 * 60 * 60));
const productivity = Math.min(100, avgPrintsPerHour * 20); // 5 печатей/час = 100

// Качество (0-100)
const quality = (printsCompleted / printsStarted) * 100;

// Эффективность (0-100)
const efficiency = averageEfficiencyScore;

// Надежность (0-100)
const idleRatio = (totalGapTime + totalPauseTime) / totalDuration;
const reliability = Math.max(0, 100 - (idleRatio * 100));

// Общий балл (weighted average)
const overallScore = 
  (productivity × 0.30) +
  (quality × 0.30) +
  (efficiency × 0.25) +
  (reliability × 0.15);
```

---

## 🗄️ Структура хранилищ

### `users-data`
```json
{
  "users": [
    {
      "id": "user_...",
      "username": "admin",
      "displayName": "Administrator",
      "role": "admin",
      "passwordHash": "sha256...",
      "createdAt": "2025-10-09T...",
      "createdBy": "system",
      "isActive": true,
      "statistics": {...}
    }
  ],
  "action_logs": [...]
}
```

### `shifts-data`
```json
{
  "current_shift": {
    "id": "shift_...",
    "userId": "user_...",
    "startTime": "2025-10-09T...",
    "statistics": {...},
    "events": [...],
    "notes": [...]
  },
  "shift_history": [...],
  "shift_logs": [...]
}
```

### `reports-data`
```json
{
  "saved_reports": [
    {
      "id": "report_...",
      "type": "detailed",
      "userId": "user_...",
      "period": "day",
      "generatedAt": "2025-10-09T...",
      "data": {...}
    }
  ]
}
```

---

## 🚀 Будущие улучшения

### Планируемые функции:

1. **Смена собственного пароля** - операторы смогут менять свой пароль
2. **Email/SMS уведомления** - дополнительные каналы уведомлений
3. **Экспорт отчетов** - PDF, Excel, CSV
4. **Графики и диаграммы** - визуализация KPI
5. **Настройка порогов** - кастомизация gap/pause времени
6. **Мультиязычность** - поддержка разных языков
7. **API для интеграций** - RESTful API
8. **Резервное копирование** - автоматический backup данных

---

## 📝 Changelog

### v1.6.0 (2025-10-09)
- ✅ Первый релиз системы сменной работы
- ✅ Управление пользователями
- ✅ Отслеживание смен
- ✅ Отчеты и KPI
- ✅ Интеграция с Telegram и Analytics

---

**© 2025 3D Printer Control Panel**

