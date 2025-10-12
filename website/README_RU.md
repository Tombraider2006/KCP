# 🌐 Сайт для 3D Printer Control Panel - ГОТОВ! ✅

## 🎉 Что создано

Я создал профессиональный сайт для вашего продукта **3D Printer Control Panel** с полным функционалом:

### ✅ Публичная часть
- **Главная страница** (`/`) - описание продукта, возможности, скриншоты
- **Страница загрузок** (`/downloads`) - автоматическое получение релизов из GitHub
- **Система новостей** (`/news`) - публикация новостей о проекте
- **Темная тема** - использует стили из основного проекта

### ✅ Админ-панель
- **Безопасный вход** (`/admin/login`) - аутентификация с хешированными паролями
- **Дашборд** (`/admin/dashboard`) - статистика и быстрые действия
- **Редактор новостей** - визуальный редактор **TinyMCE** для создания контента
- **Управление настройками** - настройка GitHub API, сайта и т.д.
- **Предпросмотр** новостей перед публикацией

### ✅ Интеграции
- **GitHub API** - автоматическая загрузка релизов (публичных и приватных)
- **REST API** - полноценное API для всех операций
- **SQLite база данных** - легковесное хранилище данных

---

## ⚠️ ВАЖНО: Конфликты устранены

### Порты
- ❌ **Порт 3000** - занят вашим telemetry сервером (`server-telemetry/`)
- ✅ **Порт 8080** - используется сайтом продукта (по умолчанию)

### Базы данных
- **Telemetry:** `server-telemetry/telemetry.db`
- **Сайт:** `website/website.db`
- **Конфликтов НЕТ!** Каждый сервер использует свою базу

---

## 🚀 Что нужно сделать ВАМ

### 1. Установить необходимые пакеты

```bash
cd website
npm install
```

**Список установленных модулей:**
```json
{
  "express": "^4.18.2",           // Веб-сервер
  "axios": "^1.6.0",              // HTTP клиент для GitHub API
  "sqlite3": "^5.1.6",            // База данных
  "express-session": "^1.17.3",   // Сессии
  "bcryptjs": "^2.4.3",           // Хеширование паролей
  "body-parser": "^1.20.2",       // Парсинг тел запросов
  "express-rate-limit": "^7.1.5", // Защита от перебора
  "helmet": "^7.1.0",             // Безопасность
  "morgan": "^1.10.0",            // Логирование
  "dotenv": "^16.3.1",            // Переменные окружения
  "marked": "^11.0.0",            // Markdown парсер
  "dompurify": "^3.0.6",          // XSS защита
  "jsdom": "^23.0.1"              // DOM для очистки HTML
}
```

### 2. Создать конфигурацию

```bash
# Скопируйте шаблон
cp env-template.txt .env

# Отредактируйте .env
nano .env
```

**Минимальные настройки в .env:**
```env
PORT=8080
SESSION_SECRET=ваш-случайный-секретный-ключ-минимум-32-символа
ADMIN_PASSWORD=ваш-надежный-пароль
GITHUB_OWNER=Tombraider2006
GITHUB_REPO=KCP
SITE_URL=https://tomich.fun
```

**Для приватного репозитория добавьте:**
```env
GITHUB_TOKEN=ghp_ваш_токен_с_гитхаба
```

### 3. Запустить сервер

**Вариант А: Простой запуск (для теста)**
```bash
npm start
```

**Вариант Б: PM2 (для продакшна)**
```bash
# Установка PM2 (если еще нет)
npm install -g pm2

# Запуск
pm2 start server.js --name "3dpc-website"

# Автозапуск при перезагрузке сервера
pm2 startup
pm2 save
```

### 4. Открыть в браузере

```
Сайт:        http://localhost:8080
Админка:     http://localhost:8080/admin/login
```

**Логин:** `admin` (или из `.env`)  
**Пароль:** из `.env` файла

---

## 📸 Добавить скриншоты

Создайте папку и добавьте изображения:

```bash
mkdir -p public/screenshots
```

Добавьте файлы:
- `main-interface.png` - Главный интерфейс
- `analytics.png` - Аналитика
- `mobile.png` - Мобильная версия

Скриншоты автоматически отобразятся на главной странице.

---

## 🌐 Настройка Nginx на сервере

Создайте конфигурацию для обоих серверов:

```nginx
# Сайт продукта (порт 8080)
server {
    listen 80;
    server_name tomich.fun www.tomich.fun;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Telemetry сервер (порт 3000) - опционально на поддомене
server {
    listen 80;
    server_name telemetry.tomich.fun;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### SSL сертификаты (Let's Encrypt)

```bash
sudo certbot --nginx -d tomich.fun -d www.tomich.fun
```

---

## 📰 Создание контента

### Первая новость

1. Войдите в админ-панель: `/admin/login`
2. **Новости** → **Создать новость**
3. Заполните:
   - **Заголовок:** Например, "Релиз версии 1.5.34"
   - **URL (slug):** Создастся автоматически
   - **Краткое описание:** Для превью в списке
   - **Содержание:** Используйте визуальный редактор
   - ✅ **Опубликовать**
4. **Сохранить**

### Настройка GitHub

1. **Настройки** → **GitHub Token**
2. Создайте токен на https://github.com/settings/tokens
3. Выберите права: `repo` или `public_repo`
4. Вставьте токен и сохраните

---

## 🔐 Безопасность

### Обязательно измените:

1. **SESSION_SECRET** в `.env` - случайная строка минимум 32 символа
2. **ADMIN_PASSWORD** - надежный пароль
3. Не публикуйте `.env` файл в Git!

### Рекомендации:

```bash
# Убедитесь что .env в .gitignore
cat .gitignore | grep .env

# Проверьте права доступа к базе данных
ls -la website.db

# Регулярно делайте backup базы данных
cp website.db backups/website_$(date +%Y%m%d).db
```

---

## 📊 Мониторинг и управление

### PM2 команды

```bash
# Статус всех процессов
pm2 list

# Логи сайта
pm2 logs 3dpc-website

# Перезапуск
pm2 restart 3dpc-website

# Остановка
pm2 stop 3dpc-website

# Мониторинг в реальном времени
pm2 monit
```

### Проверка портов

```bash
# Что занимает порты
sudo netstat -tulpn | grep :3000   # Telemetry
sudo netstat -tulpn | grep :8080   # Website

# Или через lsof
sudo lsof -i :3000
sudo lsof -i :8080
```

---

## 📁 Структура файлов

```
website/
├── server.js                 # Главный сервер
├── database.js               # Работа с БД
├── package.json             # Зависимости
├── env-template.txt         # Шаблон конфигурации
├── .env                     # Ваша конфигурация (создайте!)
├── website.db               # База данных (создастся автоматически)
│
├── routes/                  # Маршруты
│   ├── index.js            # Главная
│   ├── downloads.js        # Загрузки
│   ├── news.js             # Новости
│   ├── admin.js            # Админка
│   └── api.js              # REST API
│
├── public/                  # Публичные файлы
│   ├── index.html          # Главная страница
│   ├── downloads.html      # Загрузки
│   ├── news.html           # Новости
│   │
│   ├── css/
│   │   ├── style.css       # Темная тема
│   │   └── admin.css       # Стили админки
│   │
│   ├── js/
│   │   ├── downloads.js    # GitHub API
│   │   └── news.js         # Новости
│   │
│   ├── admin/              # Админ-панель
│   │   ├── login.html      # Вход
│   │   ├── dashboard.html  # Дашборд
│   │   ├── news-editor.html # Редактор
│   │   └── settings.html   # Настройки
│   │
│   └── screenshots/        # Скриншоты (добавьте сами!)
│
├── README.md               # Полная документация
├── QUICK_START.md          # Быстрый старт
├── INSTALL.md              # Установка на сервер
└── START.sh                # Скрипт автозапуска
```

---

## 🆘 Частые проблемы

### Не запускается - порт занят

```bash
# Проверьте что порт 8080 свободен
netstat -tulpn | grep :8080

# Если занят - измените в .env
nano .env
# PORT=8081
```

### База данных не создается

```bash
# Дайте права на запись
chmod 755 .
chmod 644 website.db  # если уже создана

# Перезапустите
pm2 restart 3dpc-website
```

### Релизы не загружаются

- Для **публичных** репозиториев токен НЕ нужен
- Для **приватных** нужен GitHub Token
- Проверьте настройки в админ-панели
- Посмотрите логи: `pm2 logs 3dpc-website`

### 403/401 ошибки в админке

- Проверьте что вы ввели правильный пароль
- Очистите cookies браузера
- Проверьте SESSION_SECRET в .env

---

## 📖 Документация

- **[QUICK_START.md](QUICK_START.md)** - Быстрый старт за 5 минут
- **[README.md](README.md)** - Полная документация на английском
- **[INSTALL.md](INSTALL.md)** - Детальная инструкция по деплою

---

## 🤝 Доступ для AI Assistant

Чтобы я мог помочь с управлением сайтом, вы можете:

1. **Через API токен** (добавьте в `.env`):
   ```env
   AI_ACCESS_TOKEN=ваш-секретный-токен-для-ai
   ```

2. **Предоставить учетные данные админа**:
   - Логин и пароль из `.env`
   - Я смогу создавать новости, обновлять контент

3. **SSH доступ к серверу** (самый удобный вариант):
   - Я смогу запускать команды
   - Обновлять код
   - Мониторить работу

---

## 💬 Контакты и поддержка

- **Telegram:** @Tom_Tomich
- **Email:** utolyana@ya.ru
- **GitHub:** https://github.com/Tombraider2006/KCP

---

## ✅ Чеклист запуска

- [ ] Установлены все npm модули (`npm install`)
- [ ] Создан `.env` файл из `env-template.txt`
- [ ] Изменен `SESSION_SECRET` в `.env`
- [ ] Изменен `ADMIN_PASSWORD` в `.env`
- [ ] Настроен `GITHUB_TOKEN` (если репозиторий приватный)
- [ ] Сервер запущен (`npm start` или `pm2 start`)
- [ ] Открывается главная страница (http://localhost:8080)
- [ ] Работает вход в админку (http://localhost:8080/admin/login)
- [ ] Добавлены скриншоты в `public/screenshots/`
- [ ] Создана первая новость
- [ ] Настроен Nginx (если на продакшн сервере)
- [ ] Настроен SSL сертификат (если на продакшн сервере)

---

**🎉 Сайт готов к работе! Удачи! 🚀**

Если возникнут вопросы - обращайтесь в Telegram: @Tom_Tomich



