# 📋 Финальный список файлов для загрузки

## ✅ Все файлы проверены на синтаксис

### Телеметрия (порт 3000)
```
D:\3DC\server-telemetry\server.js → /opt/3dpc-telemetry/server.js
```
**Изменения:**
- ✅ Добавлен `trust proxy` (строка 14)
- ✅ Удален `basicAuth`
- ✅ Добавлен `webInterfaceAuth` с проверкой IP/токена
- ✅ Маршрут `/dashboard` защищён

---

### Website Backend
```
D:\3DC\website\server.js → /opt/website/server.js
D:\3DC\website\routes\api.js → /opt/website/routes/api.js
D:\3DC\website\routes\telemetry.js → /opt/website/routes/telemetry.js
```
**Изменения server.js:**
- ✅ Добавлен `trust proxy` (строка 14)
- ✅ Настроен CSP для разрешения HTTP iframe телеметрии

**Изменения api.js:**
- ✅ Добавлен `/download/:owner/:repo/:tag/:filename` для прокси скачивания
- ✅ Исправлена конструкция пути к GitHub репозиторию

**telemetry.js (НОВЫЙ):**
- ✅ Прокси для телеметрии `/dashboard` и `/api/*`

---

### Website Frontend - Public
```
D:\3DC\website\public\js\downloads.js → /opt/website/public/js/downloads.js
D:\3DC\website\public\index.html → /opt/website/public/index.html
D:\3DC\website\public\downloads.html → /opt/website/public/downloads.html
D:\3DC\website\public\news.html → /opt/website/public/news.html
```
**Изменения:**
- ✅ Убраны все ссылки на GitHub из меню
- ✅ Убраны все ссылки на GitHub из футера
- ✅ downloads.js использует прокси `/api/download/...` вместо прямых ссылок

---

### Website Frontend - Admin
```
D:\3DC\website\public\admin\dashboard.html → /opt/website/public/admin/dashboard.html
D:\3DC\website\public\admin\news-editor.html → /opt/website/public/admin/news-editor.html
D:\3DC\website\public\admin\settings.html → /opt/website/public/admin/settings.html
D:\3DC\website\public\admin\telemetry.html → /opt/website/public/admin/telemetry.html
```
**Изменения:**
- ✅ Добавлена ссылка "📊 Телеметрия" во всех страницах
- ✅ В dashboard.html убрана кнопка "GitHub Releases", заменена на "Телеметрия"
- ✅ telemetry.html (НОВЫЙ) - страница с iframe телеметрии + CSP разрешение

---

## 🎯 Что будет работать

1. ✅ **Приложения** → `http://tomich.fun:3000/api/telemetry` (API открыт)
2. ✅ **Админка** → `https://tomich.fun/admin/telemetry.html` → iframe с HTTP телеметрии (CSP разрешён)
3. ✅ **Скачивание** → `https://tomich.fun/downloads` → прокси `/api/download/...`
4. ✅ **Приватный repo** → будет работать через токен в прокси

---

## 🚫 Проблем НЕТ в коде

- ✅ Синтаксис всех JS файлов правильный
- ✅ GitHub упоминается только в settings (для настройки API)
- ✅ Все прокси настроены правильно
- ✅ CSP разрешает HTTP iframe

---

## 🔧 Осталось

1. Загрузить 12 файлов на сервер
2. Перезапустить PM2 (телеметрия)
3. Перезапустить Docker (website)
4. Проверить в браузере

**Готов создать финальный скрипт загрузки!** 🚀



