# 📝 Краткая сводка - Сайт на tomich.fun

## ✅ Что установлено

### Сервисы на сервере
- **Website** → https://tomich.fun (Docker, порт 8080)
- **Telemetry** → порт 3000 (PM2)
- **Traefik** → порты 80/443 (SSL, reverse proxy)

### Файлы и база данных
- **Код:** `/opt/website/`
- **База данных:** `/opt/website/website.db`
- **Конфигурация:** `/opt/website/.env`

---

## 🔑 Доступы

### Админ-панель
- **URL:** https://tomich.fun/admin/login
- **Логин:** `admin`
- **Пароль:** `Tolik!@#$%^` (в `.env`)

### SSH
```bash
ssh root@tomich.fun
cd /opt/website
```

---

## 📖 Документация

**Читайте в таком порядке:**

1. **[README.md](README.md)** ⭐ - Навигация (начните здесь!)
2. **[README_RU.md](README_RU.md)** - Полная инструкция
3. **[QUICK_COMMANDS.md](QUICK_COMMANDS.md)** - Быстрые команды
4. **[UPDATE_SERVER.md](UPDATE_SERVER.md)** - Обновление и копирование файлов

---

## ⚡ Самые важные команды

### Обновить сайт (Git)
```bash
cd /opt/website
git pull origin main
docker compose down && docker compose up -d --force-recreate
```

### Скопировать файл с Windows
```powershell
scp D:\3DC\website\server.js root@tomich.fun:/opt/website/
ssh root@tomich.fun "cd /opt/website && docker compose restart website"
```

### Логи
```bash
docker compose logs -f website
```

### Перезапуск
```bash
docker compose restart website
```

---

## 🔐 GitHub Token

✅ Токен настроен в админке  
✅ Работает для **публичных** репозиториев  
✅ Будет работать когда сделаете **приватным**  
✅ Менять ничего не нужно!

**Где настроить:**
- Админка → Настройки → GitHub Token
- Или в файле: `/opt/website/.env`

---

## 📞 Контакты

- **Telegram:** @Tom_Tomich  
- **GitHub:** https://github.com/Tombraider2006/KCP

---

**Сайт работает! 🚀**

Дата установки: 11 октября 2025



