# ✅ Финальный чек-лист перед миграцией

**Дата:** 12 октября 2025  
**Версия:** 1.5.34 → 1.5.35  
**Репо:** KCP → 3DPC-Private

---

## 📊 СТАТУС: ГОТОВО К МИГРАЦИИ! 🎉

```
████████████████████████████████ 100%

✅ Уборка проекта
✅ Исправление критичных функций  
✅ API на сайте
✅ Динамические страницы
✅ Документация подготовлена
✅ Батники миграции
```

---

## 📁 Изменённые файлы

### Приложение (src/):
```diff
src/main.js
- Line 1264-1265: const repoOwner = 'Tombraider2006'; const repoName = 'KCP';
+ Line 1276: hostname: 'tomich.fun'
+ Line 1277: path: '/api/latest-version'
+ Line 1348: shell.openExternal('https://tomich.fun/downloads');

- Line 2914: hostname: 'api.github.com'
- Line 2915: path: '/repos/Tombraider2006/KCP/releases/latest'
+ Line 2914: hostname: 'tomich.fun'
+ Line 2915: path: '/api/latest-version'
```

### Сайт (website/):
```diff
routes/api.js
+ Lines 331-395: GET /api/latest-version (НОВЫЙ эндпоинт)

routes/docs.js
+ Весь файл (НОВЫЙ роутер для документации)

server.js
+ Lines 16-18: EJS view engine setup
+ Line 82: const docsRouter = require('./routes/docs');
+ Line 88: app.use('/docs', docsRouter);
+ Lines 94-117: /license handler

public/js/downloads.js
- Line 33: window.githubRepo = 'KCP';
+ Line 33: window.githubRepo = '3DPC-Private';
- Line 82: const repo = window.githubRepo || 'KCP';
+ Line 82: const repo = window.githubRepo || '3DPC-Private';
```

### Новые файлы:
```
views/
├── layout.ejs                      # Базовый layout
├── admin-layout.ejs                # Admin layout  
├── partials/
│   ├── header.ejs                  # Единая шапка
│   ├── footer.ejs                  # Единый футер
│   └── admin-header.ejs            # Админ шапка
└── pages/
    ├── docs-viewer.ejs             # Просмотр документации
    └── license.ejs                 # Лицензия

docs-content/
├── web-server.md                   # WEB_SERVER.md
├── tuya-guide.md                   # TUYA_USER_GUIDE.md
├── homeassistant-guide.md          # HOME_ASSISTANT_USER_GUIDE.md
└── license.md                      # LICENSE.md
```

---

## 🎯 Быстрая миграция (30 минут)

### ⏱️ Шаг 1: Создать GitHub репо и токен (5 мин)

1. **Personal Access Token:**
   ```
   https://github.com/settings/tokens
   → Generate new token (classic)
   → Scopes: ✅ repo
   → Generate
   → СОХРАНИТЬ ТОКЕН!
   ```

2. **Приватный репо:**
   ```
   https://github.com/new
   → Name: 3DPC-Private
   → Visibility: Private 🔒
   → Create repository
   ```

---

### ⏱️ Шаг 2: Загрузить на сервер (10 мин)

```batch
cd D:\3DC\website
.\UPLOAD_MIGRATION_FILES.bat
```

**Подтвердить:** yes

**Затем обновить .env:**
```bash
ssh root@tomich.fun
nano /opt/website/.env

# ИЗМЕНИТЬ:
GITHUB_REPO=3DPC-Private
GITHUB_TOKEN=ghp_твой_новый_токен_из_шага_1

# Ctrl+X, Y, Enter

docker compose restart
exit
```

**Проверить:**
```bash
curl https://tomich.fun/api/latest-version
# Должен вернуть JSON с версией
```

---

### ⏱️ Шаг 3: Мигрировать код (5 мин)

```batch
cd D:\3DC
.\MIGRATION_STEP1_PUSH_TO_PRIVATE.bat
```

**Проверить:**
- https://github.com/Tombraider2006/3DPC-Private
- Должен быть весь код ✅

---

### ⏱️ Шаг 4: Закрыть старый KCP (5 мин)

```batch
cd D:\3DC
.\MIGRATION_STEP3_CLOSE_OLD_KCP.bat
```

**Выбрать:** 1 (публичный с заглушкой)  
**Подтвердить:** yes

**Проверить:**
- https://github.com/Tombraider2006/KCP
- Должна быть заглушка со ссылкой на tomich.fun ✅

---

### ⏱️ Шаг 5: Финальная проверка (5 мин)

**Сайт:**
- [ ] https://tomich.fun/api/latest-version → JSON ✅
- [ ] https://tomich.fun/docs/web-server → Документация ✅
- [ ] https://tomich.fun/docs/tuya-guide → Руководство ✅
- [ ] https://tomich.fun/downloads → Релизы ✅
- [ ] Скачать файл → Работает ✅

**GitHub:**
- [ ] 3DPC-Private - приватный ✅
- [ ] KCP - заглушка ✅

**Приложение:**
- [ ] Запустить v1.5.34
- [ ] "Проверить обновления" из меню
- [ ] Должно работать через tomich.fun ✅

---

## 📦 Что в архиве

```
archive/
├── old-uploads/                    # 6 батников
│   ├── GO.bat
│   ├── FINAL_UPLOAD.bat
│   ├── SIMPLE_UPLOAD.bat
│   ├── SUPER_SIMPLE.bat
│   ├── UPLOAD_ALL_UPDATES.bat
│   └── UPLOAD_FINAL.bat
├── old-docs/                       # 11 документов
│   ├── FINAL_FILES_LIST.md
│   ├── UPDATES_SUMMARY.md
│   ├── FIX_SUMMARY_2025_10_10.md
│   ├── WORK_SUMMARY_2025_10_10.md
│   └── ...
├── old-releases/                   # 3 release notes
│   ├── RELEASE_NOTES_1.5.28.md
│   ├── RELEASE_NOTES_1.5.29.md
│   └── RELEASE_NOTES_1.5.30.md
├── updates.tar.gz
└── updates_final.tar.gz

website/archive/                    # 20 батников
├── UPLOAD_SCREENSHOTS.bat
├── UPLOAD_API.bat
└── ...
```

**Можно удалить после проверки что всё работает**

---

## 🎨 Новая структура проекта

```
D:\3DC\
├── 📄 README.md
├── 📄 LICENSE.md
├── 📄 package.json
├── 🖼️ logo.png
│
├── 📂 src/                         ✅ Исправлен main.js
├── 📂 docs/                        ✅ Актуальная документация (29 файлов)
├── 📂 icons/                       Иконки приложения
│
├── 📂 website/                     ✅ Подготовлен к миграции
│   ├── routes/
│   │   ├── api.js                 ✅ Обновлён
│   │   └── docs.js                ✅ Новый
│   ├── views/                     ✅ Новая структура
│   ├── docs-content/              ✅ Markdown документы
│   └── server.js                  ✅ Обновлён
│
├── 📂 archive/                     🗄️ Старые файлы
│
└── 🔧 Миграция:
    ├── MIGRATION_READY_SUMMARY.md              # Полная сводка
    ├── MIGRATION_DETAILED_ANALYSIS.md          # Детальный анализ
    ├── GITHUB_LINKS_INSPECTION.md              # Инспекция ссылок
    ├── CRITICAL_FIXES_SUMMARY.md               # Что исправлено
    ├── PROJECT_CLEANUP_SUMMARY.md              # Уборка
    ├── KCP-README-STUB.md                      # Заглушка
    ├── MIGRATION_STEP1_PUSH_TO_PRIVATE.bat     # Шаг 1
    ├── MIGRATION_STEP2_UPDATE_WEBSITE.bat      # Шаг 2
    └── MIGRATION_STEP3_CLOSE_OLD_KCP.bat       # Шаг 3
```

---

## 🚀 Запуск миграции

**Когда готовы - выполнить по порядку:**

```
1. UPLOAD_MIGRATION_FILES.bat       (website/)
2. SSH: обновить .env
3. MIGRATION_STEP1_PUSH_TO_PRIVATE.bat
4. MIGRATION_STEP3_CLOSE_OLD_KCP.bat
5. Проверка работы
```

**Время:** 30 минут  
**Простой:** 0 минут

---

**ГОТОВЫ НАЧАТЬ МИГРАЦИЮ? 🎯**

---

**Автор:** AI Assistant  
**Дата:** 12 октября 2025  
**Статус:** ✅ ВСЁ ГОТОВО

