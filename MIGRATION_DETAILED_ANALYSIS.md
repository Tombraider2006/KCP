# 🔍 Детальный анализ миграции на приватный репозиторий

**Дата анализа:** 12 октября 2025  
**Текущая версия:** 1.5.34  
**Статус:** 📋 Подготовка

---

## 📊 Текущее состояние проекта

### ✅ Что уже готово:
- Версия 1.5.34 собрана и находится в `dist-electron/`
- Умные розетки (Tuya/Home Assistant) интегрированы
- Bambu Lab поддержка работает
- Сайт tomich.fun работает и отдает релизы
- Telegram бот функционирует

### ⚠️ Критические проблемы:

#### ПРОБЛЕМА 1: Проверка обновлений через GitHub API
**Где:** `src/main.js` строки 1264-1265, 2910

```javascript
// ТЕКУЩИЙ КОД (строки 1264-1265)
const repoOwner = 'Tombraider2006';
const repoName = 'KCP';

// ЗАПРОС (строка 1278-1279)
hostname: 'api.github.com',
path: `/repos/${repoOwner}/${repoName}/releases/latest`

// ВТОРОЕ МЕСТО (строка 2910)
path: '/repos/Tombraider2006/KCP/releases/latest'
```

**Последствия после закрытия репо:**
- ❌ Все версии <= 1.5.34 получат 404 при проверке обновлений
- ❌ Пользователи НЕ узнают о новых версиях
- ❌ Автообновление сломается

**Решение:** Выпустить версию 1.5.35 с проверкой через `tomich.fun/api/latest-version`

---

#### ПРОБЛЕМА 2: Ссылки на GitHub в интерфейсе
**Где найдено 16 ссылок:**

1. **src/main.js** (6 мест):
   - Строка 263: Открытие GitHub при клике
   - Строки 851, 1114: Ссылки в диалогах помощи
   - Строки 1264-1265: Переменные репозитория
   - Строка 2910: Хардкод в запросе

2. **src/renderer.js** (5 мест):
   - Строка 1220: Помощь по веб-серверу
   - Строки 6562-6563: Руководство по Tuya
   - Строки 6566-6567: Руководство по Home Assistant

3. **src/index.html** (1 место):
   - Строка 81: Ссылка на LICENSE

4. **src/web-interface/index.html** (1 место):
   - Строка 56: Ссылка в футере

**Решение:** После миграции ВСЕ ссылки должны вести на `tomich.fun`

---

#### ПРОБЛЕМА 3: Сайт использует GitHub репо
**Где найдено 28 упоминаний:**

**Критично (работа сайта):**
1. `website/public/js/downloads.js` (строки 32-33, 81-82):
   ```javascript
   window.githubOwner = 'Tombraider2006';
   window.githubRepo = 'KCP';
   ```

2. `website/routes/api.js` (строки 244-245):
   ```javascript
   const owner = process.env.GITHUB_OWNER || 'Tombraider2006';
   const repoName = process.env.GITHUB_REPO || 'KCP';
   ```

3. `website/database.js` (строка 73):
   ```javascript
   { key: 'github_repo', value: 'Tombraider2006/KCP' }
   ```

4. `website/.env` (на сервере):
   ```bash
   GITHUB_OWNER=Tombraider2006
   GITHUB_REPO=KCP
   GITHUB_TOKEN=ghp_xxx
   ```

**Некритично (документация):**
- Различные README.md файлы
- QUICK_UPLOAD.md, SUMMARY.md и т.д.

**Решение:** Обновить .env на сервере + загрузить новый downloads.js

---

## 🎯 СТРАТЕГИЯ МИГРАЦИИ

### ❌ ПРОБЛЕМА с планом из MIGRATION_PLAN.md:

**План предлагает:**
1. Сначала выпустить v1.5.35 с проверкой через сайт
2. Подождать ~1 неделю пока пользователи обновятся
3. Потом закрыть репо

**НО:**
- Нет данных сколько у нас пользователей
- Нет телеметрии об обновлениях
- Непонятно сколько ждать

### ✅ РЕКОМЕНДУЕМАЯ СТРАТЕГИЯ:

#### Вариант A: Быстрая миграция (рекомендую)
**Преимущества:**
- ✅ Быстро (сегодня)
- ✅ Сайт продолжает работать
- ✅ Новые пользователи скачают актуальную версию

**Недостатки:**
- ⚠️ Старые пользователи (v1.5.34 и ниже) не узнают об обновлениях автоматически
- ⚠️ НО они могут проверить вручную на tomich.fun

**План:**
1. Создать приватный репо `3DPC-Private`
2. Перенести код
3. Обновить сайт (.env + downloads.js)
4. Закрыть KCP (сделать приватным или оставить с заглушкой)
5. Выпустить v1.5.35 в новом репо с исправлениями

**Итого:** ~30 минут работы

---

#### Вариант B: Постепенная миграция
**План:**
1. **Сегодня:** Выпустить v1.5.35 в старом KCP
   - Исправить проверку обновлений (через tomich.fun)
   - Подождать 1-2 недели
   
2. **Через 1-2 недели:** День X
   - Перенести в приватный репо
   - Закрыть KCP

**Преимущества:**
- ✅ Пользователи успеют обновиться
- ✅ Минимум проблем

**Недостатки:**
- ⏳ Долго (1-2 недели ожидания)
- 📊 Нужна телеметрия чтобы понять сколько обновилось

---

## 🛠️ ЧТО НУЖНО ПОДГОТОВИТЬ

### 1. API на сайте для проверки версий

**Файл:** `website/routes/api.js`

**Добавить эндпоинт:**
```javascript
router.get('/latest-version', async (req, res) => {
    try {
        const owner = process.env.GITHUB_OWNER || 'Tombraider2006';
        const repo = process.env.GITHUB_REPO || '3DPC-Private';
        const token = process.env.GITHUB_TOKEN;

        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
            {
                headers: token ? {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                } : {
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        const release = response.data;
        res.json({
            version: release.tag_name.replace(/^v/, ''),
            name: release.name,
            notes: release.body,
            published_at: release.published_at,
            download_url: `https://tomich.fun/downloads`
        });
    } catch (error) {
        console.error('Latest version check error:', error);
        res.status(500).json({ error: 'Failed to check version' });
    }
});
```

**Тест:**
```bash
curl https://tomich.fun/api/latest-version
```

**Ожидаемый результат:**
```json
{
  "version": "1.5.34",
  "name": "Release 1.5.34",
  "notes": "...",
  "download_url": "https://tomich.fun/downloads"
}
```

---

### 2. Исправить проверку обновлений в приложении

**Файл:** `src/main.js`

**Заменить ДВЕ функции `checkForUpdates()`:**

**Место 1:** Строки 1258-1350 (примерно)
**Место 2:** Строки 2900+ (второй вариант)

**НОВЫЙ КОД:**
```javascript
async function checkForUpdates() {
  const { dialog } = require('electron');
  const https = require('https');
  
  const currentVersion = APP_VERSION;
  
  try {
    const checkingMessage = isRussian 
      ? 'Проверка обновлений...' 
      : 'Checking for updates...';
    
    console.log(checkingMessage);
    
    // ИЗМЕНЕНО: Проверяем через сайт вместо GitHub API
    const latestRelease = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'tomich.fun',
        path: '/api/latest-version',
        method: 'GET',
        headers: {
          'User-Agent': '3D-Printer-Control-Panel'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const info = JSON.parse(data);
              resolve({
                tag_name: 'v' + info.version,
                name: info.name,
                body: info.notes,
                html_url: info.download_url || 'https://tomich.fun/downloads'
              });
            } else {
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      req.end();
    });
    
    // Остальной код остается без изменений
    const latestVersion = latestRelease.tag_name.replace(/^v/, '');
    
    if (compareVersions(latestVersion, currentVersion) > 0) {
      const message = isRussian
        ? `Доступна новая версия!\n\nТекущая версия: ${currentVersion}\nНовая версия: ${latestVersion}\n\n${latestRelease.name || ''}\n\nОткрыть страницу загрузки?`
        : `New version available!\n\nCurrent version: ${currentVersion}\nNew version: ${latestVersion}\n\n${latestRelease.name || ''}\n\nOpen download page?`;
      
      const buttonLabel = isRussian ? 'Скачать' : 'Download';
      const cancelLabel = isRussian ? 'Позже' : 'Later';
      
      const response = await dialog.showMessageBox({
        type: 'info',
        title: isRussian ? 'Доступно обновление' : 'Update Available',
        message: message,
        buttons: [buttonLabel, cancelLabel],
        defaultId: 0,
        cancelId: 1
      });
      
      if (response.response === 0) {
        // Открыть страницу загрузки
        shell.openExternal('https://tomich.fun/downloads');
      }
    } else {
      const message = isRussian
        ? `У вас установлена последняя версия (${currentVersion})`
        : `You have the latest version (${currentVersion})`;
      
      dialog.showMessageBox({
        type: 'info',
        title: isRussian ? 'Обновлений нет' : 'No Updates',
        message: message,
        buttons: ['OK']
      });
    }
  } catch (error) {
    console.error('Update check failed:', error);
    
    const message = isRussian
      ? `Не удалось проверить обновления.\nПожалуйста, проверьте подключение к интернету.\n\nВы можете проверить обновления вручную на сайте:\nhttps://tomich.fun/downloads`
      : `Failed to check for updates.\nPlease check your internet connection.\n\nYou can check for updates manually at:\nhttps://tomich.fun/downloads`;
    
    dialog.showMessageBox({
      type: 'warning',
      title: isRussian ? 'Ошибка проверки обновлений' : 'Update Check Error',
      message: message,
      buttons: ['OK']
    });
  }
}
```

**Заменить в ДВУХ местах:**
1. Первая функция checkForUpdates
2. Вторая функция checkForUpdates (если есть дубликат)

**Также исправить:**
- Строка 263: `shell.openExternal('https://tomich.fun');`
- Строки 851, 1114: Заменить ссылки на `https://tomich.fun/docs/`

---

### 3. Исправить ссылки в renderer.js

**Файл:** `src/renderer.js`

**Найти и заменить:**
```javascript
// Строка 1220
const helpUrl = 'https://tomich.fun/docs/web-server';

// Строки 6562-6563
? 'https://tomich.fun/docs/tuya-guide'
: 'https://tomich.fun/docs/tuya-guide';

// Строки 6566-6567
? 'https://tomich.fun/docs/homeassistant-guide'
: 'https://tomich.fun/docs/homeassistant-guide';
```

---

### 4. Исправить ссылки в HTML

**Файл:** `src/index.html`

**Строка 81:**
```html
<a href="https://tomich.fun/license" target="_blank" style="color: #888; text-decoration: underline;">License</a>
```

**Файл:** `src/web-interface/index.html`

**Строка 56:**
```html
<a href="https://tomich.fun" target="_blank">tomich.fun</a>
```

---

### 5. Обновить файлы на сайте

#### 5.1. Файл: `website/public/js/downloads.js`

**Строки 32-33:**
```javascript
window.githubOwner = 'Tombraider2006';
window.githubRepo = '3DPC-Private';  // ИЗМЕНЕНО
```

**Строки 81-82:**
```javascript
const owner = window.githubOwner || 'Tombraider2006';
const repo = window.githubRepo || '3DPC-Private';  // ИЗМЕНЕНО
```

#### 5.2. Файл: `website/.env` (на сервере)

```bash
GITHUB_OWNER=Tombraider2006
GITHUB_REPO=3DPC-Private          # ИЗМЕНЕНО
GITHUB_TOKEN=ghp_ваш_новый_токен  # ВАЖНО: Нужен токен с доступом к приватному репо!
```

---

### 6. Создать заглушку для старого KCP

**Файл:** `KCP-README-STUB.md` (будущий README.md в KCP)

```markdown
# 🖨️ 3D Printer Control Panel

## ⚠️ Этот репозиторий больше не используется

Проект перемещен в приватный репозиторий для защиты интеллектуальной собственности.

---

## 📥 Где скачать приложение?

### 🌐 Официальный сайт: **[tomich.fun](https://tomich.fun)**

- 📦 **[Скачать последнюю версию](https://tomich.fun/downloads)**
- 📰 **[Новости и обновления](https://tomich.fun/news)**
- 📖 **[Документация](https://tomich.fun)**

---

## 📞 Контакты

- 💬 **Telegram:** [@Tom_Tomich](https://t.me/Tom_Tomich)
- 🌐 **Сайт:** [tomich.fun](https://tomich.fun)

---

## 💼 Коммерческое использование

Для приобретения коммерческой лицензии или получения доступа к исходному коду свяжитесь со мной через Telegram.

---

## 🔒 О приватности

Проект закрыт для предотвращения несанкционированного коммерческого использования и защиты авторских прав.

Все релизы доступны бесплатно на официальном сайте.

---

*© 2024-2025 Tom Tomich. Все права защищены.*
```

---

## 📋 ПОШАГОВЫЙ ПЛАН ДЕЙСТВИЙ

### ВАРИАНТ A: Быстрая миграция (30 минут)

#### ✅ Этап 1: Подготовка кода (10 минут)

1. **Добавить API эндпоинт на сайте**
   - [ ] Открыть `website/routes/api.js`
   - [ ] Добавить `/api/latest-version` (код выше)
   - [ ] Сохранить

2. **Исправить проверку обновлений в приложении**
   - [ ] Открыть `src/main.js`
   - [ ] Найти ДВЕ функции `checkForUpdates()`
   - [ ] Заменить обе на новый код
   - [ ] Исправить ссылки (строки 263, 851, 1114)
   - [ ] Сохранить

3. **Исправить ссылки в UI**
   - [ ] `src/renderer.js` - исправить 5 ссылок
   - [ ] `src/index.html` - исправить 1 ссылку
   - [ ] `src/web-interface/index.html` - исправить 1 ссылку
   - [ ] Сохранить все

4. **Обновить package.json**
   - [ ] Изменить версию на `1.5.35`
   - [ ] Сохранить

5. **Обновить downloads.js**
   - [ ] Открыть `website/public/js/downloads.js`
   - [ ] Изменить `KCP` → `3DPC-Private` (2 места)
   - [ ] Сохранить

---

#### ✅ Этап 2: Создание нового репо (5 минут)

1. **Создать приватный репозиторий на GitHub**
   - [ ] Открыть https://github.com/new
   - [ ] Название: `3DPC-Private`
   - [ ] Visibility: **Private**
   - [ ] НЕ добавлять README, .gitignore, license
   - [ ] Нажать "Create repository"

2. **Создать Personal Access Token для приватного репо**
   - [ ] https://github.com/settings/tokens
   - [ ] "Generate new token (classic)"
   - [ ] Scopes: `repo` (full control)
   - [ ] Сгенерировать и СОХРАНИТЬ токен

---

#### ✅ Этап 3: Перенос кода (5 минут)

**Запустить батник или вручную:**

```batch
@echo off
echo === Migration to Private Repo ===
cd /d D:\3DC

echo.
echo Step 1: Committing current changes...
git add .
git commit -m "Prepare for migration: v1.5.35 with site-based update check"

echo.
echo Step 2: Renaming old remote...
git remote rename origin old-origin

echo.
echo Step 3: Adding new private repo...
git remote add origin https://github.com/Tombraider2006/3DPC-Private.git

echo.
echo Step 4: Pushing to new repo...
git push -u origin main

echo.
echo Step 5: Pushing tags...
git push origin --tags

echo.
echo === DONE! Code migrated to private repo ===
echo.
echo Next: Update .env on server
pause
```

---

#### ✅ Этап 4: Обновление сайта (5 минут)

**На сервере tomich.fun:**

```bash
# SSH на сервер
ssh root@tomich.fun

# Перейти в папку сайта
cd /opt/website

# Обновить .env
nano .env

# ИЗМЕНИТЬ:
# GITHUB_REPO=3DPC-Private
# GITHUB_TOKEN=новый_токен_с_доступом_к_приватному_репо

# Сохранить: Ctrl+X, Y, Enter

# Загрузить обновленные файлы (с локальной машины)
# exit
# (на Windows)
scp D:\3DC\website\public\js\downloads.js root@tomich.fun:/opt/website/public/js/
scp D:\3DC\website\routes\api.js root@tomich.fun:/opt/website/routes/

# Вернуться на сервер
ssh root@tomich.fun

# Перезапустить Docker
cd /opt/website
docker compose restart

# Проверить что работает
curl http://localhost:3000/api/latest-version

# Выйти
exit
```

**Или использовать батник:**
```batch
@echo off
echo === Updating Website ===

echo Uploading downloads.js...
scp website\public\js\downloads.js root@tomich.fun:/opt/website/public/js/

echo Uploading api.js...
scp website\routes\api.js root@tomich.fun:/opt/website/routes/

echo.
echo !!! IMPORTANT !!!
echo Now SSH to server and:
echo 1. Edit /opt/website/.env
echo 2. Change GITHUB_REPO=3DPC-Private
echo 3. Change GITHUB_TOKEN=your_new_token
echo 4. Run: docker compose restart
echo.
pause
```

---

#### ✅ Этап 5: Закрытие старого KCP (5 минут)

**Вариант 1: Сделать репо приватным**
- [ ] https://github.com/Tombraider2006/KCP/settings
- [ ] Scroll down → Danger Zone
- [ ] "Change visibility" → "Make private"

**Вариант 2: Оставить публичным с заглушкой (РЕКОМЕНДУЮ)**

```batch
@echo off
echo === Creating Stub in Old KCP ===
cd /d D:\3DC

echo Switching to old repo...
git remote set-url origin https://github.com/Tombraider2006/KCP.git

echo Creating archive branch...
git checkout -b archive

echo Removing most files...
git rm -rf src docs dist-electron build icons server-telemetry website temp_artifacts
git rm -rf package.json package-lock.json logo.png node_modules

echo Copying stub README...
copy KCP-README-STUB.md README.md
git add README.md LICENSE.md

echo Committing...
git commit -m "Archive: Project moved to private repository. Downloads at tomich.fun"

echo Pushing to old repo...
git push origin archive:main --force

echo.
echo === DONE! Old KCP archived ===
echo Users will see stub README with link to tomich.fun
pause
```

---

#### ✅ Этап 6: Тестирование (5 минут)

**Проверить:**

1. **Сайт отдает релизы:**
   - [ ] Открыть https://tomich.fun/downloads
   - [ ] Должны быть видны релизы
   - [ ] Попробовать скачать → должно работать

2. **API работает:**
   ```bash
   curl https://tomich.fun/api/latest-version
   ```
   - [ ] Должен вернуть JSON с версией

3. **Старый KCP:**
   - [ ] Открыть https://github.com/Tombraider2006/KCP
   - [ ] Должна быть заглушка с ссылкой на tomich.fun

4. **Новый приватный репо:**
   - [ ] Открыть https://github.com/Tombraider2006/3DPC-Private
   - [ ] Должен быть весь код
   - [ ] Видно только вам (private)

---

#### ✅ Этап 7: Выпуск v1.5.35 (опционально)

**Если хотите сразу выпустить новую версию:**

1. **Собрать приложение:**
   ```batch
   npm run build
   ```

2. **Создать релиз на GitHub:**
   - [ ] https://github.com/Tombraider2006/3DPC-Private/releases/new
   - [ ] Tag: `v1.5.35`
   - [ ] Title: `Release 1.5.35 - Fixed update check`
   - [ ] Description: 
     ```
     ## Changes
     - ✅ Fixed update check (now uses tomich.fun API)
     - ✅ Updated all GitHub links to tomich.fun
     - ✅ Project moved to private repository
     
     ## Download
     All downloads available at: https://tomich.fun/downloads
     ```
   - [ ] Upload файлы из `dist-electron/`
   - [ ] Publish release

---

## 🔍 ПРОВЕРОЧНЫЙ ЧЕК-ЛИСТ

### Перед началом миграции:
- [ ] Создана резервная копия всего проекта
- [ ] Все изменения закоммичены в git
- [ ] Проверен доступ к серверу (SSH)
- [ ] Создан новый GitHub token с доступом к приватным репо
- [ ] Подготовлен новый README для старого KCP

### После миграции:
- [ ] Сайт tomich.fun/downloads показывает релизы
- [ ] API tomich.fun/api/latest-version работает
- [ ] Скачивание файлов работает
- [ ] Старый KCP показывает заглушку или закрыт
- [ ] Новый 3DPC-Private содержит весь код
- [ ] Можно создать новый релиз в приватном репо

### Если что-то пошло не так:
- [ ] Есть резервная копия
- [ ] Можно вернуть old-origin обратно
- [ ] Можно откатить изменения на сервере

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

### 1. GitHub Token для приватного репо
**КРИТИЧНО:** Токен ДОЛЖЕН иметь доступ к приватному репо!
- Scope: `repo` (full control of private repositories)
- Без этого сайт не сможет получить релизы

### 2. Старые пользователи
После миграции пользователи v1.5.34 и ниже:
- ❌ НЕ смогут автоматически проверить обновления (получат ошибку)
- ✅ Могут проверить вручную на tomich.fun
- ✅ Telegram бот может отправить уведомление

**Решение:** Отправить сообщение в Telegram канал/группу:
```
🔔 Важное обновление!

Проект перемещен на новую инфраструктуру.

📥 Скачать последнюю версию:
https://tomich.fun/downloads

⚠️ Если у вас версия 1.5.34 или ниже - автопроверка обновлений больше не работает. Проверяйте обновления вручную на сайте.

Начиная с версии 1.5.35 - все работает автоматически.
```

### 3. Документация
После миграции ссылки на docs в GitHub будут мертвы.
**Решение:** Разместить документацию на tomich.fun

### 4. Безопасность токена
- Никогда не коммитить `.env` с токеном
- Токен хранится только на сервере
- Регулярно ротировать токены

---

## 🤔 МОЯ РЕКОМЕНДАЦИЯ

### Делаем ВАРИАНТ A (быстрая миграция):

**Почему:**
1. ✅ Быстро (30 минут)
2. ✅ Сайт продолжает работать
3. ✅ Код защищен
4. ⚠️ Старые пользователи получат ошибку, НО могут зайти на сайт

**Минусы:**
- Старые версии сломаются
- НО: Сайт работает, можно скачать вручную

**Альтернатива (Вариант B):**
- Сначала выпустить v1.5.35 в KCP
- Подождать 1-2 недели
- Потом мигрировать

**НО это требует:**
- 📊 Телеметрию (чтобы знать сколько обновилось)
- ⏳ Время (1-2 недели ожидания)
- 🤷 Непонятно сколько пользователей вообще

---

## 🚀 ГОТОВЫ НАЧАТЬ?

Если все понятно и готовы - скажите, и я:
1. Создам все необходимые файлы
2. Подготовлю батники для автоматизации
3. Проведу вас пошагово через миграцию

**Время:** ~30 минут  
**Простой:** 0 минут (все без перерыва)

---

**Автор:** AI Assistant  
**Дата:** 12 октября 2025  
**Версия:** 1.0 - Детальный анализ

