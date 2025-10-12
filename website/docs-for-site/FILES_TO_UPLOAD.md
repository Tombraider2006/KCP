# 📤 Файлы для заливки на сервер tomich.fun

**Дата:** 12 октября 2025  
**Назначение:** Подготовка к миграции на приватный репозиторий

---

## 🔴 КРИТИЧНЫЕ (обязательны перед миграцией)

### 1. API для проверки обновлений ✅ ГОТОВ
**Файл:** `routes/api.js`  
**Описание:** Добавлен эндпоинт `/api/latest-version`  
**Строки:** 331-395 (новый код)

**Что делать:**
```bash
# Загрузить обновленный api.js
scp routes/api.js root@tomich.fun:/opt/website/routes/

# Перезапустить Docker
ssh root@tomich.fun "cd /opt/website && docker compose restart"

# Проверить
curl https://tomich.fun/api/latest-version
```

**Ожидаемый ответ:**
```json
{
  "version": "1.5.34",
  "name": "Release 1.5.34",
  "notes": "Changelog...",
  "published_at": "2025-10-12T...",
  "download_url": "https://tomich.fun/downloads"
}
```

---

## 🟡 ВАЖНЫЕ (для полноценной работы)

### 2. Динамические страницы документации
**Требуется создать:**

#### 2.1. Роутер документации
**Файл:** `routes/docs.js` (новый)  
**Размер:** ~80 строк кода  
**Назначение:** Динамическая генерация страниц из Markdown

**Зависимости (установить на сервере):**
```bash
ssh root@tomich.fun
cd /opt/website
npm install marked highlight.js --save
```

**Загрузить:**
```bash
scp routes/docs.js root@tomich.fun:/opt/website/routes/
```

#### 2.2. Markdown файлы документации
**Создать папку:**
```bash
ssh root@tomich.fun "mkdir -p /opt/website/docs-content"
```

**Файлы для загрузки:**

1. **Web-сервер** (`docs-content/web-server.md`)
   - Источник: `D:\3DC\docs\WEB_SERVER.md`
   - URL: `/docs/web-server`
   - Размер: 15KB

2. **Tuya Guide** (`docs-content/tuya-guide.md`)
   - Источник: `D:\3DC\docs\TUYA_USER_GUIDE.md`
   - URL: `/docs/tuya-guide`
   - Размер: 35KB

3. **Home Assistant Guide** (`docs-content/homeassistant-guide.md`)
   - Источник: `D:\3DC\docs\HOME_ASSISTANT_USER_GUIDE.md`
   - URL: `/docs/homeassistant-guide`
   - Размер: ~20KB

4. **License** (`docs-content/license.md`)
   - Источник: `D:\3DC\LICENSE.md`
   - URL: `/license`
   - Размер: 1KB

**Команды загрузки:**
```bash
# Загрузить все документы
scp D:\3DC\docs\WEB_SERVER.md root@tomich.fun:/opt/website/docs-content/web-server.md
scp D:\3DC\docs\TUYA_USER_GUIDE.md root@tomich.fun:/opt/website/docs-content/tuya-guide.md
scp D:\3DC\docs\HOME_ASSISTANT_USER_GUIDE.md root@tomich.fun:/opt/website/docs-content/homeassistant-guide.md
scp D:\3DC\LICENSE.md root@tomich.fun:/opt/website/docs-content/license.md
```

#### 2.3. EJS шаблон
**Файл:** `views/docs-template.ejs` (новый)  
**Назначение:** HTML шаблон для отображения документации

**Создать папку:**
```bash
ssh root@tomich.fun "mkdir -p /opt/website/views"
```

**Загрузить:**
```bash
scp views/docs-template.ejs root@tomich.fun:/opt/website/views/
```

#### 2.4. CSS стили для документации
**Файл:** `public/css/docs.css` (новый)  
**Назначение:** Стилизация страниц документации

**Загрузить:**
```bash
scp public/css/docs.css root@tomich.fun:/opt/website/public/css/
```

#### 2.5. Обновить server.js
**Файл:** `server.js`  
**Изменения:** Подключить роутер `/docs` и настроить EJS

**Добавить в server.js:**
```javascript
// Настройка EJS (если ещё не настроено)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Подключить роутер документации
const docsRouter = require('./routes/docs');
app.use('/docs', docsRouter);
```

**Загрузить:**
```bash
scp server.js root@tomich.fun:/opt/website/
```

---

## 🔵 ОПЦИОНАЛЬНЫЕ (можно добавить позже)

### 3. Дополнительная документация
**Bambu Lab:**
- `docs/BAMBU_LAB_SETUP.md` → `/docs/bambu-setup`
- `docs/BAMBU_TROUBLESHOOTING_EN.md` → `/docs/bambu-troubleshooting`

**Tablet:**
- `docs/TABLET_QUICK_START.md` → `/docs/tablet-guide`

**Можно добавить по мере необходимости**

---

## 📋 Пошаговый чек-лист загрузки

### ✅ Шаг 1: API обновлений (КРИТИЧНО)
- [ ] Загрузить обновленный `routes/api.js`
- [ ] Перезапустить Docker
- [ ] Протестировать: `curl https://tomich.fun/api/latest-version`
- [ ] Убедиться что возвращается JSON с версией

### ✅ Шаг 2: Установка зависимостей (ВАЖНО)
- [ ] SSH на сервер
- [ ] `cd /opt/website`
- [ ] `npm install marked highlight.js ejs --save`
- [ ] Проверить что установилось: `npm list marked`

### ✅ Шаг 3: Создание папок (ВАЖНО)
- [ ] `mkdir -p /opt/website/docs-content`
- [ ] `mkdir -p /opt/website/views`
- [ ] `mkdir -p /opt/website/public/css` (если нет)

### ✅ Шаг 4: Загрузка файлов документации (ВАЖНО)
- [ ] Загрузить `routes/docs.js`
- [ ] Загрузить `views/docs-template.ejs`
- [ ] Загрузить `public/css/docs.css`
- [ ] Загрузить все .md файлы в `docs-content/`

### ✅ Шаг 5: Обновление server.js (ВАЖНО)
- [ ] Добавить настройку EJS
- [ ] Подключить `/docs` роутер
- [ ] Загрузить обновленный `server.js`

### ✅ Шаг 6: Перезапуск и тестирование (ВАЖНО)
- [ ] `docker compose restart`
- [ ] Открыть https://tomich.fun/docs/web-server
- [ ] Проверить что страница отображается корректно
- [ ] Проверить навигацию между страницами
- [ ] Проверить на мобильном устройстве

---

## 🚨 Важные замечания

### 1. Порядок загрузки имеет значение!
**Правильный порядок:**
1. ✅ Сначала установить зависимости (npm install)
2. ✅ Потом загрузить файлы
3. ✅ Обновить server.js в последнюю очередь
4. ✅ Перезапустить Docker

**Почему:** Если загрузить server.js раньше - сайт упадёт из-за отсутствия файлов

### 2. Проверка перед рестартом
```bash
# Проверить что все файлы на месте
ls -la /opt/website/routes/docs.js
ls -la /opt/website/docs-content/
ls -la /opt/website/views/docs-template.ejs
ls -la /opt/website/public/css/docs.css
```

### 3. Откат при проблемах
Если что-то пошло не так:
```bash
# Откатить server.js
cd /opt/website
git checkout server.js

# Перезапустить
docker compose restart
```

---

## 📊 Размер файлов для загрузки

| Файл | Размер | Приоритет |
|------|--------|-----------|
| `routes/api.js` | ~12KB | 🔴 Критично |
| `routes/docs.js` | ~4KB | 🟡 Важно |
| `views/docs-template.ejs` | ~3KB | 🟡 Важно |
| `public/css/docs.css` | ~5KB | 🟡 Важно |
| `docs-content/web-server.md` | 15KB | 🟡 Важно |
| `docs-content/tuya-guide.md` | 35KB | 🟡 Важно |
| `docs-content/homeassistant-guide.md` | 20KB | 🟡 Важно |
| `docs-content/license.md` | 1KB | 🔵 Опционально |
| **ИТОГО:** | **~95KB** | |

**Время загрузки:** ~5 минут  
**Время настройки:** ~15 минут  
**Всего:** ~20 минут

---

## 🎯 Минимальный набор для работы

Если времени мало - загрузить только:
1. ✅ `routes/api.js` - для проверки обновлений (ОБЯЗАТЕЛЬНО)
2. ✅ `routes/docs.js` + зависимости
3. ✅ `docs-content/web-server.md` - самый частый запрос
4. ✅ `docs-content/tuya-guide.md` - второй по частоте
5. ✅ Базовый шаблон и стили

**Остальное можно добавить позже.**

---

## 🔧 Батник для автоматической загрузки

**Файл:** `UPLOAD_DOCS_TO_SERVER.bat`

```batch
@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         Загрузка документации на сервер tomich.fun            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d %~dp0

echo [1/7] Загрузка api.js (критично)...
scp routes\api.js root@tomich.fun:/opt/website/routes/
if %errorlevel% neq 0 goto :error
echo ✓ api.js загружен
echo.

echo [2/7] Загрузка docs.js...
scp routes\docs.js root@tomich.fun:/opt/website/routes/
if %errorlevel% neq 0 goto :error
echo ✓ docs.js загружен
echo.

echo [3/7] Загрузка шаблона...
scp views\docs-template.ejs root@tomich.fun:/opt/website/views/
if %errorlevel% neq 0 goto :error
echo ✓ Шаблон загружен
echo.

echo [4/7] Загрузка стилей...
scp public\css\docs.css root@tomich.fun:/opt/website/public/css/
if %errorlevel% neq 0 goto :error
echo ✓ Стили загружены
echo.

echo [5/7] Загрузка документации...
scp ..\docs\WEB_SERVER.md root@tomich.fun:/opt/website/docs-content/web-server.md
scp ..\docs\TUYA_USER_GUIDE.md root@tomich.fun:/opt/website/docs-content/tuya-guide.md
scp ..\docs\HOME_ASSISTANT_USER_GUIDE.md root@tomich.fun:/opt/website/docs-content/homeassistant-guide.md
if %errorlevel% neq 0 goto :error
echo ✓ Документация загружена
echo.

echo [6/7] Обновление server.js...
scp server.js root@tomich.fun:/opt/website/
if %errorlevel% neq 0 goto :error
echo ✓ server.js обновлен
echo.

echo [7/7] Перезапуск Docker...
ssh root@tomich.fun "cd /opt/website && docker compose restart"
if %errorlevel% neq 0 goto :error
echo ✓ Docker перезапущен
echo.

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    ✓ ЗАГРУЗКА ЗАВЕРШЕНА!                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Проверьте работу:
echo - https://tomich.fun/api/latest-version
echo - https://tomich.fun/docs/web-server
echo - https://tomich.fun/docs/tuya-guide
echo.
pause
exit /b 0

:error
echo.
echo ❌ ОШИБКА при загрузке файлов!
echo Проверьте подключение к серверу
echo.
pause
exit /b 1
```

---

**Автор:** AI Assistant  
**Дата:** 12 октября 2025  
**Версия:** 1.0

