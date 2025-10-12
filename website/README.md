# 🌐 Сайт продукта 3D Printer Control Panel

## ✅ Статус: Развернут и работает

- **URL:** https://tomich.fun
- **Админка:** https://tomich.fun/admin/login
- **SSL:** ✅ Let's Encrypt
- **Сервер:** tomich.fun (Hostkey.ru VPS)

---

## 📚 Документация

### 🎯 Основные инструкции

1. **[README_RU.md](README_RU.md)** - 📖 Главная инструкция и описание проекта
2. **[QUICK_COMMANDS.md](QUICK_COMMANDS.md)** - ⚡ Быстрые команды (шпаргалка)
3. **[UPDATE_SERVER.md](UPDATE_SERVER.md)** - 🔄 Как обновлять сайт

### 🛠️ Дополнительные файлы

- **install-on-server.sh** - Скрипт автоматической установки
- **docker-compose.yml** - Конфигурация Docker
- **env-template.txt** - Шаблон конфигурации

---

## 🚀 Быстрый старт

### Обновить сайт

```bash
# На сервере
ssh root@tomich.fun
cd /opt/website
git pull origin main
docker compose down && docker compose up -d --force-recreate
```

### Скопировать файл с Windows

```powershell
# Windows PowerShell
scp D:\3DC\website\server.js root@tomich.fun:/opt/website/
ssh root@tomich.fun "cd /opt/website && docker compose restart website"
```

### Просмотр логов

```bash
ssh root@tomich.fun
cd /opt/website
docker compose logs -f website
```

---

## 🔑 Доступы

### Админ-панель
- **URL:** https://tomich.fun/admin/login
- **Логин:** `admin`
- **Пароль:** в файле `/opt/website/.env`

### GitHub Token
- Настроен для работы с приватными репозиториями
- Будет работать когда репозиторий станет приватным
- Редактировать: Админка → Настройки

---

## 🏗️ Архитектура

```
Traefik (порты 80/443) - Reverse Proxy + SSL
    ↓
    ├── https://tomich.fun → Website (Docker, порт 8080)
    ├── telemetry.tomich.fun → Telemetry (PM2, порт 3000)
    └── VPN, n8n и другие сервисы
```

**Конфликтов нет!** Все сервисы работают одновременно.

---

## 📞 Контакты

- **Telegram:** @Tom_Tomich
- **Email:** utolyana@ya.ru
- **GitHub:** https://github.com/Tombraider2006/KCP

---

## 📋 Структура файлов

```
website/
├── README.md ⭐               # Этот файл (навигация)
├── README_RU.md ⭐           # Полная инструкция
├── QUICK_COMMANDS.md ⭐      # Быстрые команды
├── UPDATE_SERVER.md ⭐       # Обновление сервера
│
├── server.js                 # Главный сервер
├── database.js              # База данных
├── package.json             # Зависимости
├── docker-compose.yml       # Docker
├── .env                     # Конфигурация (НЕ в Git!)
├── install-on-server.sh     # Скрипт установки
│
├── routes/                  # Express routes
├── public/                  # Статические файлы
│   ├── css/                # Стили
│   ├── js/                 # JavaScript
│   ├── admin/              # Админ-панель
│   └── screenshots/        # Скриншоты продукта
│
└── website.db              # SQLite база (создается автоматически)
```

---

**Сайт полностью готов к работе! 🎉**

Начните с чтения **[README_RU.md](README_RU.md)** для полной информации.



