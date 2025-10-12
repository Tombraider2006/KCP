# 🚀 ЗАПУСК МИГРАЦИИ - Пошаговая инструкция

**Дата:** 12 октября 2025  
**Время выполнения:** 30 минут  
**Готовность:** ✅ 100%

---

## 📊 Статус подготовки

```
✅ Уборка проекта              ГОТОВО
✅ Исправление кода            ГОТОВО
✅ API на сайте                ГОТОВО  
✅ Динамические страницы       ГОТОВО
✅ Документация                ГОТОВО
✅ Батники                     ГОТОВО
✅ Git changes staged          ГОТОВО

████████████████████████ 100%
```

---

## 🎯 ЧТО СЕЙЧАС ДЕЛАТЬ

### ШАГ 0: Подготовка GitHub (5 минут)

#### 0.1. Создать Personal Access Token

1. Открыть: https://github.com/settings/tokens
2. Нажать: **Generate new token (classic)**
3. Note: `3DPC-Private Access Token`
4. Expiration: `No expiration` (или 1 год)
5. Scopes: ✅ **repo** (Full control of private repositories)
6. Нажать: **Generate token**
7. **СКОПИРОВАТЬ И СОХРАНИТЬ ТОКЕН!** (больше не покажется)

```
Пример токена: ghp_abcd1234efgh5678ijkl9012mnop3456qrst
```

**Сохранить в:** PRIVATE_NOTES.md (временно)

---

#### 0.2. Создать приватный репозиторий

1. Открыть: https://github.com/new
2. Repository name: **3DPC-Private**
3. Description: `3D Printer Control Panel - Private Repository`
4. Visibility: **🔒 Private**
5. ❌ НЕ добавлять README
6. ❌ НЕ добавлять .gitignore
7. ❌ НЕ добавлять license
8. Нажать: **Create repository**

**Результат:** Пустой приватный репозиторий готов

---

### ШАГ 1: Загрузка на сервер (10 минут)

```batch
cd D:\3DC\website
.\UPLOAD_MIGRATION_FILES.bat
```

**Введите:** yes (когда спросит подтверждение)

**Что загрузится:**
- ✅ routes/api.js (новый API)
- ✅ routes/docs.js (документация)
- ✅ server.js (EJS setup)
- ✅ public/js/downloads.js (новый репо)
- ✅ views/**/*.ejs (шаблоны)
- ✅ docs-content/*.md (документация)
- ✅ npm dependencies

**Будет запрошен пароль:** несколько раз (для scp и ssh)

---

#### 1.1. Обновить .env на сервере (ВРУЧНУЮ!)

```bash
ssh root@tomich.fun
```

**Пароль:** [ваш пароль]

```bash
cd /opt/website
nano .env
```

**НАЙТИ и ИЗМЕНИТЬ:**
```bash
# Было:
GITHUB_REPO=KCP

# Стало:
GITHUB_REPO=3DPC-Private

# Было:
GITHUB_TOKEN=старый_токен

# Стало:
GITHUB_TOKEN=ghp_твой_новый_токен_из_шага_0.1
```

**Сохранить:**
- Нажать: `Ctrl+X`
- Нажать: `Y`
- Нажать: `Enter`

**Перезапустить Docker:**
```bash
docker compose restart
```

**Подождать:** 10 секунд

**Проверить API:**
```bash
curl http://localhost:3000/api/latest-version
```

**Должно вернуть:** JSON с версией

```bash
exit
```

---

#### 1.2. Проверить сайт

**Открыть в браузере:**
- https://tomich.fun/api/latest-version
- https://tomich.fun/docs/web-server

**Должно:** Работать без ошибок ✅

**Если не работает:**
- Проверить логи: `ssh root@tomich.fun "cd /opt/website && docker compose logs"`
- Проверить .env: токен правильный?
- Проверить dependencies: `ssh root@tomich.fun "cd /opt/website && npm list ejs marked"`

---

### ШАГ 2: Миграция кода (5 минут)

```batch
cd D:\3DC
.\MIGRATION_STEP1_PUSH_TO_PRIVATE.bat
```

**Что произойдёт:**
1. Коммит всех изменений
2. Переименование remote: `origin` → `old-origin`
3. Добавление нового remote: `3DPC-Private`
4. Push кода в новый репо
5. Push всех тегов

**Может запросить:** GitHub credentials (username + password/token)

**Проверить после выполнения:**
- Открыть: https://github.com/Tombraider2006/3DPC-Private
- Должен быть весь код ✅
- Должны быть теги ✅

---

### ШАГ 3: Закрытие старого KCP (5 минут)

```batch
cd D:\3DC
.\MIGRATION_STEP3_CLOSE_OLD_KCP.bat
```

**Выбрать вариант:** 1 (публичный с заглушкой)  
**Подтвердить force push:** yes

**Что произойдёт:**
1. Создание резервного тега `v1.5.34-before-migration`
2. Создание ветки `archive`
3. Удаление всех файлов (кроме README и LICENSE)
4. Замена README на заглушку
5. Force push в старый KCP

**Может запросить:** GitHub credentials

**Проверить после выполнения:**
- Открыть: https://github.com/Tombraider2006/KCP
- Должна быть заглушка со ссылкой на tomich.fun ✅

---

### ШАГ 4: Финальная проверка (5 минут)

#### 4.1. Проверка сайта

**API:**
```bash
curl https://tomich.fun/api/latest-version
```
**Должно вернуть:**
```json
{
  "version": "1.5.34",
  "name": "...",
  "notes": "...",
  "download_url": "https://tomich.fun/downloads"
}
```

**Документация:**
- [ ] https://tomich.fun/docs/web-server
- [ ] https://tomich.fun/docs/tuya-guide
- [ ] https://tomich.fun/docs/homeassistant-guide
- [ ] https://tomich.fun/license

**Скачивание:**
- [ ] https://tomich.fun/downloads
- [ ] Попробовать скачать любой файл

**Всё должно работать!** ✅

---

#### 4.2. Проверка GitHub

**Приватный репо:**
- [ ] https://github.com/Tombraider2006/3DPC-Private
- [ ] Visibility: Private 🔒
- [ ] Весь код на месте
- [ ] Теги перенесены

**Старый KCP:**
- [ ] https://github.com/Tombraider2006/KCP
- [ ] README - заглушка со ссылкой на tomich.fun
- [ ] LICENSE - остался
- [ ] Всё остальное удалено

---

#### 4.3. Проверка приложения

**Запустить v1.5.34:**
```batch
cd D:\3DC
npm start
```

**Проверить:**
- [ ] Меню → "Проверить обновления"
- [ ] Должна пройти проверка через tomich.fun ✅
- [ ] Должно показать текущую версию ✅

**Если показывает новую версию:** Всё работает правильно!  
**Если ошибка:** Проверить API на сайте

---

## ⚠️ Возможные проблемы и решения

### Проблема 1: API возвращает 404

**Причина:** .env не обновлён или токен неправильный

**Решение:**
```bash
ssh root@tomich.fun
cat /opt/website/.env | grep GITHUB
# Проверить GITHUB_REPO и GITHUB_TOKEN
nano /opt/website/.env
# Исправить
docker compose restart
```

---

### Проблема 2: npm dependencies не установились

**Причина:** Нет интернета на сервере или npm не работает

**Решение:**
```bash
ssh root@tomich.fun
cd /opt/website
npm install ejs marked highlight.js --save
docker compose restart
```

---

### Проблема 3: Git push не работает

**Причина:** Нет прав доступа или репо не создан

**Решение:**
1. Проверить что 3DPC-Private создан на GitHub
2. Проверить credentials: `git config --global user.name`
3. Попробовать вручную:
   ```bash
   git remote -v
   git push -u origin main
   ```

---

### Проблема 4: Документация не отображается

**Причина:** Файлы .md не загружены или роутер не подключен

**Решение:**
```bash
ssh root@tomich.fun
ls /opt/website/docs-content/
# Должно быть 4 файла: web-server.md, tuya-guide.md, homeassistant-guide.md, license.md

ls /opt/website/routes/docs.js
# Должен существовать

cat /opt/website/server.js | grep "docsRouter"
# Должно быть: const docsRouter = require('./routes/docs');
```

---

## 🔄 План отката (если что-то не так)

### Откат приложения:
```bash
cd D:\3DC
git reset --hard HEAD~1
# Вернуть к предыдущему коммиту
```

### Откат сайта:
```bash
ssh root@tomich.fun
cd /opt/website
git checkout routes/api.js routes/docs.js server.js public/js/downloads.js
# Вернуть файлы из git
docker compose restart
```

### Откат репозитория:
```bash
cd D:\3DC
git remote rename origin new-origin
git remote rename old-origin origin
# Вернуть старые названия
```

---

## 📞 После миграции

### Отправить уведомление в Telegram

**Канал/группа пользователей:**

```
🔔 Важное обновление!

Проект переехал на новую инфраструктуру:
✅ Улучшена безопасность
✅ Ускорена работа сайта
✅ Добавлена документация онлайн

📥 Скачать: https://tomich.fun/downloads
📚 Документация: https://tomich.fun/docs/web-server

⚠️ Если у вас версия ≤1.5.34:
Обновитесь до последней версии для корректной работы проверки обновлений.

🙏 Спасибо за использование!
```

---

### Выпустить v1.5.35 (через 1-2 дня)

**Что исправить:**
1. Некритичные ссылки в UI (renderer.js, index.html)
2. Обновить версию в package.json
3. Собрать: `npm run build`
4. Создать релиз в 3DPC-Private
5. Проверить что сайт показывает v1.5.35

---

## ✅ Чек-лист миграции

### Перед началом:
- [ ] GitHub Token создан и сохранён
- [ ] Приватный репо 3DPC-Private создан
- [ ] SSH доступ к серверу работает
- [ ] Есть 30 минут времени без перерывов

### Шаг 1: Сервер
- [ ] Запустить `UPLOAD_MIGRATION_FILES.bat`
- [ ] Обновить .env на сервере
- [ ] Проверить API: `curl https://tomich.fun/api/latest-version`
- [ ] Проверить docs: открыть в браузере

### Шаг 2: Код
- [ ] Запустить `MIGRATION_STEP1_PUSH_TO_PRIVATE.bat`
- [ ] Проверить что код в 3DPC-Private

### Шаг 3: KCP
- [ ] Запустить `MIGRATION_STEP3_CLOSE_OLD_KCP.bat`
- [ ] Выбрать вариант 1
- [ ] Подтвердить yes
- [ ] Проверить заглушку на GitHub

### Шаг 4: Проверка
- [ ] Сайт работает
- [ ] API отвечает
- [ ] Документация открывается
- [ ] Релизы загружаются
- [ ] Приложение проверяет обновления

### После миграции:
- [ ] Отправить уведомление в Telegram
- [ ] Запланировать v1.5.35
- [ ] Удалить архив (опционально)

---

## 🎉 ГОТОВЫ? НАЧИНАЕМ!

**Порядок выполнения:**
1. ✅ Шаг 0.1 - Токен
2. ✅ Шаг 0.2 - Репо
3. ✅ Шаг 1 - Сервер + .env
4. ✅ Шаг 2 - Код
5. ✅ Шаг 3 - KCP
6. ✅ Шаг 4 - Проверка

**Время:** 30 минут  
**Риски:** Минимальные  
**Откат:** Возможен на любом этапе

---

## 📂 Документы для справки

- `MIGRATION_READY_SUMMARY.md` - полная сводка
- `MIGRATION_DETAILED_ANALYSIS.md` - детальный анализ
- `GITHUB_LINKS_INSPECTION.md` - все ссылки
- `CRITICAL_FIXES_SUMMARY.md` - исправления
- `FINAL_CHECKLIST_BEFORE_MIGRATION.md` - чек-лист

---

**НАЧАТЬ МИГРАЦИЮ? 🚀**

Все готово. Просто следуйте шагам выше.

---

**Автор:** AI Assistant  
**Дата:** 12 октября 2025  
**Версия:** 1.0 - Инструкция запуска

