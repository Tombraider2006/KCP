# 🔍 Инспекция: GitHub ссылки в приложении

**Дата:** 12 октября 2025  
**Цель:** Выявить все места с GitHub ссылками для замены на tomich.fun

---

## 📊 Сводка

Найдено: **16 мест** с упоминанием GitHub/KCP репозитория

### Критично (блокирует работу):
- ❌ **2 функции checkForUpdates** - проверка обновлений
- ❌ **Хардкод репозитория** в переменных

### Важно (пользовательский опыт):
- ⚠️ **5 ссылок в UI** - ведут на GitHub
- ⚠️ **2 ссылки в справке** - документация на GitHub
- ⚠️ **3 ссылки в руководствах** - помощь по функциям

---

## 🔴 КРИТИЧНЫЕ - Требуют обязательного исправления

### 1. Функция checkForUpdates #1 (основная)

**Файл:** `src/main.js`  
**Строки:** 1259-1367  
**Используется:** Ручная проверка обновлений из меню

**Текущий код:**
```javascript
async function checkForUpdates(isRussian) {
  const { dialog } = require('electron');
  const https = require('https');
  
  const currentVersion = APP_VERSION;
  const repoOwner = 'Tombraider2006';        // ❌ ИЗМЕНИТЬ
  const repoName = 'KCP';                     // ❌ ИЗМЕНИТЬ
  
  try {
    const latestRelease = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',           // ❌ ИЗМЕНИТЬ
        path: `/repos/${repoOwner}/${repoName}/releases/latest`, // ❌ ИЗМЕНИТЬ
        method: 'GET',
        headers: {
          'User-Agent': '3D-Printer-Control-Panel'
        }
      };
      // ... запрос
    });
    
    // При обновлении открывает:
    if (result.response === 0) {
      shell.openExternal(`https://github.com/${repoOwner}/${repoName}/releases/latest`); // ❌ ИЗМЕНИТЬ
    }
  }
}
```

**Проблемы:**
1. Обращение к `api.github.com` - получит 404 после закрытия репо
2. Ссылка на релизы GitHub - не будет работать
3. Переменные `repoOwner` и `repoName` - хардкод

**Решение:**
```javascript
async function checkForUpdates(isRussian) {
  const { dialog } = require('electron');
  const https = require('https');
  
  const currentVersion = APP_VERSION;
  
  try {
    const latestRelease = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'tomich.fun',                    // ✅ НОВЫЙ
        path: '/api/latest-version',               // ✅ НОВЫЙ
        method: 'GET',
        headers: {
          'User-Agent': '3D-Printer-Control-Panel'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const info = JSON.parse(data);
              resolve({
                tag_name: 'v' + info.version,
                name: info.name,
                body: info.notes,
                html_url: 'https://tomich.fun/downloads' // ✅ НОВЫЙ
              });
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
    
    const latestVersion = latestRelease.tag_name.replace(/^v/, '');
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
        shell.openExternal('https://tomich.fun/downloads'); // ✅ НОВЫЙ
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
        ? 'Не удалось проверить обновления.\n\nВы можете проверить обновления вручную:\nhttps://tomich.fun/downloads' // ✅ НОВЫЙ
        : 'Failed to check for updates.\n\nYou can check manually at:\nhttps://tomich.fun/downloads', // ✅ НОВЫЙ
      detail: error.message,
      buttons: ['OK']
    });
  }
}
```

---

### 2. Функция checkForUpdates #2 (альтернативная)

**Файл:** `src/main.js`  
**Строки:** 2906-2970 (примерно)  
**Используется:** Возможно автоматическая проверка

**Текущий код:**
```javascript
async function checkForUpdates() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',                          // ❌ ИЗМЕНИТЬ
      path: '/repos/Tombraider2006/KCP/releases/latest',  // ❌ ИЗМЕНИТЬ
      method: 'GET',
      headers: {
        'User-Agent': '3D-Printer-Control-Panel'
      }
    };
    // ... аналогично первой функции
  });
}
```

**Решение:** Аналогично функции #1, заменить на:
- `hostname: 'tomich.fun'`
- `path: '/api/latest-version'`
- Парсить новый формат ответа

---

### 3. IPC Handler для проверки обновлений

**Файл:** `src/main.js`  
**Строки:** 2993-2994  

**Текущий код:**
```javascript
ipcMain.handle('check-for-updates', async () => {
  const updateInfo = await checkForUpdates(); // ❌ Вызывает функцию #2
  return updateInfo;
});
```

**Проблема:** Вызывает вторую функцию checkForUpdates, которая обращается к GitHub API

**Решение:** После исправления функции #2, этот handler будет работать автоматически.

---

### 4. Автоматическая проверка при старте

**Файл:** `src/main.js`  
**Строки:** ~3071  

**Текущий код:**
```javascript
// Где-то в app.whenReady() или при старте
const updateInfo = await checkForUpdates(); // ❌ Вызывает функцию #2
```

**Проблема:** Автоматическая проверка при старте приложения

**Решение:** После исправления функции #2, автопроверка будет работать через новый API.

---

## 🟡 ВАЖНЫЕ - Влияют на пользовательский опыт

### 3. Меню "О программе"

**Файл:** `src/main.js`  
**Строка:** 263  

**Текущий код:**
```javascript
{
  label: isRussian ? 'О программе 3D Printer Control Panel' : 'About 3D Printer Control Panel',
  click: () => {
    shell.openExternal('https://github.com/Tombraider2006/KCP'); // ❌ ИЗМЕНИТЬ
  }
}
```

**Решение:**
```javascript
{
  label: isRussian ? 'О программе 3D Printer Control Panel' : 'About 3D Printer Control Panel',
  click: () => {
    shell.openExternal('https://tomich.fun'); // ✅ НОВЫЙ
  }
}
```

---

### 4. Диалог помощи - Установка (RU)

**Файл:** `src/main.js`  
**Строка:** 851  

**Текущий код:**
```html
<p>Скачайте готовый установщик из <a href="https://github.com/Tombraider2006/KCP/releases/" target="_blank">релизов</a>:</p>
```

**Решение:**
```html
<p>Скачайте готовый установщик со <a href="https://tomich.fun/downloads" target="_blank">страницы загрузки</a>:</p>
```

---

### 5. Диалог помощи - Установка (EN)

**Файл:** `src/main.js`  
**Строка:** 1114  

**Текущий код:**
```html
<p>Download the ready installer from <a href="https://github.com/Tombraider2006/KCP/releases/" target="_blank">releases</a>:</p>
```

**Решение:**
```html
<p>Download the ready installer from <a href="https://tomich.fun/downloads" target="_blank">downloads page</a>:</p>
```

---

### 6. Помощь по Web-серверу

**Файл:** `src/renderer.js`  
**Строка:** 1220  

**Текущий код:**
```javascript
const helpUrl = 'https://github.com/Tombraider2006/KCP/blob/main/docs/WEB_SERVER.md';
```

**Решение:**
```javascript
const helpUrl = 'https://tomich.fun/docs/web-server';
```

**⚠️ Примечание:** Нужно будет разместить документацию на сайте!

---

### 7. Помощь по Tuya

**Файл:** `src/renderer.js`  
**Строки:** 6562-6563  

**Текущий код:**
```javascript
githubUrl = isRussian 
  ? 'https://github.com/Tombraider2006/KCP/blob/main/docs/TUYA_USER_GUIDE.md'
  : 'https://github.com/Tombraider2006/KCP/blob/main/docs/TUYA_USER_GUIDE.md';
```

**Решение:**
```javascript
githubUrl = isRussian 
  ? 'https://tomich.fun/docs/tuya-guide'
  : 'https://tomich.fun/docs/tuya-guide';
```

---

### 8. Помощь по Home Assistant

**Файл:** `src/renderer.js`  
**Строки:** 6566-6567  

**Текущий код:**
```javascript
githubUrl = isRussian
  ? 'https://github.com/Tombraider2006/KCP/blob/main/docs/HOME_ASSISTANT_USER_GUIDE.md'
  : 'https://github.com/Tombraider2006/KCP/blob/main/docs/HOME_ASSISTANT_USER_GUIDE.md';
```

**Решение:**
```javascript
githubUrl = isRussian
  ? 'https://tomich.fun/docs/homeassistant-guide'
  : 'https://tomich.fun/docs/homeassistant-guide';
```

---

## 🔵 НЕКРИТИЧНЫЕ - Можно оставить или изменить

### 9. Футер главного окна

**Файл:** `src/index.html`  
**Строка:** 81  

**Текущий код:**
```html
<a href="https://github.com/Tombraider2006/KCP/blob/main/LICENSE.md" target="_blank" style="color: #888; text-decoration: underline;">License</a>
```

**Решение:**
```html
<a href="https://tomich.fun/license" target="_blank" style="color: #888; text-decoration: underline;">License</a>
```

**Или проще:**
```html
<a href="LICENSE.md" style="color: #888; text-decoration: underline;">License</a>
```

---

### 10. Футер веб-интерфейса

**Файл:** `src/web-interface/index.html`  
**Строка:** 56  

**Текущий код:**
```html
<a href="https://github.com/Tombraider2006/KCP" target="_blank">GitHub</a> | 
```

**Решение:**
```html
<a href="https://tomich.fun" target="_blank">Website</a> | 
```

**Или:**
```html
<a href="https://tomich.fun" target="_blank">tomich.fun</a> | 
```

---

## 📋 Чек-лист исправлений

### Обязательные изменения (CRITICAL):

- [ ] **main.js:1259-1367** - Функция checkForUpdates #1 (ручная проверка)
  - [ ] Изменить hostname на `tomich.fun`
  - [ ] Изменить path на `/api/latest-version`
  - [ ] Убрать переменные `repoOwner` и `repoName`
  - [ ] Изменить ссылку загрузки на `tomich.fun/downloads`
  - [ ] Обновить сообщение об ошибке со ссылкой

- [ ] **main.js:2906-2970** - Функция checkForUpdates #2 (IPC/автопроверка)
  - [ ] Изменить hostname на `tomich.fun`
  - [ ] Изменить path на `/api/latest-version`
  - [ ] Обновить парсинг ответа под новый формат

- [ ] **main.js:2993** - IPC Handler `check-for-updates`
  - [ ] Проверить что вызывает исправленную функцию #2

- [ ] **main.js:~3071** - Автопроверка при старте
  - [ ] Проверить что вызывает исправленную функцию #2

### Важные изменения (HIGH):

- [ ] **main.js:263** - Меню "О программе"
  - [ ] `https://tomich.fun`

- [ ] **main.js:851** - Помощь установка (RU)
  - [ ] `https://tomich.fun/downloads`

- [ ] **main.js:1114** - Помощь установка (EN)
  - [ ] `https://tomich.fun/downloads`

- [ ] **renderer.js:1220** - Помощь Web-сервер
  - [ ] `https://tomich.fun/docs/web-server`

- [ ] **renderer.js:6562-6563** - Помощь Tuya
  - [ ] `https://tomich.fun/docs/tuya-guide`

- [ ] **renderer.js:6566-6567** - Помощь Home Assistant
  - [ ] `https://tomich.fun/docs/homeassistant-guide`

### Опциональные изменения (LOW):

- [ ] **index.html:81** - Футер License
  - [ ] `https://tomich.fun/license`

- [ ] **web-interface/index.html:56** - Футер GitHub
  - [ ] `https://tomich.fun`

---

## 🌐 Требования к сайту

Чтобы все ссылки работали, на сайте нужно создать:

### API эндпоинты:
1. ✅ `GET /api/latest-version` - проверка версии
   ```json
   {
     "version": "1.5.35",
     "name": "Release 1.5.35",
     "notes": "Changelog...",
     "published_at": "2025-10-12T...",
     "download_url": "https://tomich.fun/downloads"
   }
   ```

### Страницы:
2. ✅ `/downloads` - уже есть
3. ⚠️ `/docs/web-server` - нужно создать
4. ⚠️ `/docs/tuya-guide` - нужно создать
5. ⚠️ `/docs/homeassistant-guide` - нужно создать
6. ⚠️ `/license` - нужно создать

---

## 📝 План действий

### Шаг 1: Подготовка сайта

1. **Создать API эндпоинт** `/api/latest-version`
   - Файл: `website/routes/api.js`
   - Добавить новый route

2. **Создать страницы документации**
   - `/docs/web-server` - из `docs/WEB_SERVER.md`
   - `/docs/tuya-guide` - из `docs/TUYA_USER_GUIDE.md`
   - `/docs/homeassistant-guide` - из `docs/HOME_ASSISTANT_USER_GUIDE.md`
   - `/license` - из `LICENSE.md`

### Шаг 2: Исправление кода приложения

1. **Исправить main.js:**
   - Обе функции checkForUpdates
   - Ссылки в меню и диалогах

2. **Исправить renderer.js:**
   - Ссылки на документацию

3. **Исправить HTML:**
   - index.html - футер
   - web-interface/index.html - футер

### Шаг 3: Тестирование

1. Запустить приложение
2. Проверить "Проверка обновлений" из меню
3. Проверить все ссылки помощи
4. Проверить футеры

### Шаг 4: Обновить версию

1. Изменить версию на `1.5.35` в `package.json`
2. Собрать приложение
3. Протестировать билд

---

## ⚠️ ВАЖНО!

### Последовательность миграции:

1. **СНАЧАЛА:** Добавить API `/api/latest-version` на сайт
2. **ПОТОМ:** Исправить код приложения
3. **ПОТОМ:** Выпустить v1.5.35 в СТАРОМ репо KCP
4. **ПОДОЖДАТЬ:** 1-2 недели (опционально)
5. **ПОТОМ:** Мигрировать на приватный репо

### Если делать быструю миграцию:

1. ✅ Добавить API на сайт
2. ✅ Исправить код
3. ✅ Мигрировать репо (приватный)
4. ✅ Выпустить v1.5.35 в новом репо

**Результат:** Старые версии (≤1.5.34) не смогут проверить обновления автоматически, но сайт работает.

---

## 📊 Статистика изменений

**Всего мест:** 18  
**Файлов:** 4
- `src/main.js` - 9 мест (включая 2 функции, IPC handler, автопроверку)
- `src/renderer.js` - 5 мест
- `src/index.html` - 1 место
- `src/web-interface/index.html` - 1 место

**Строк кода для изменения:** ~50-70 строк

**Время на исправление:** 1-2 часа

---

## 🔧 Готовые патчи

Все исправления будут подготовлены в виде готовых батников:
- `FIX_GITHUB_LINKS_MAIN.bat` - исправления в main.js
- `FIX_GITHUB_LINKS_RENDERER.bat` - исправления в renderer.js
- `FIX_GITHUB_LINKS_HTML.bat` - исправления в HTML

Или можно сделать одним батником:
- `FIX_ALL_GITHUB_LINKS.bat` - все исправления

---

**Автор:** AI Assistant  
**Дата:** 12 октября 2025  
**Версия:** 1.0 - Детальная инспекция

