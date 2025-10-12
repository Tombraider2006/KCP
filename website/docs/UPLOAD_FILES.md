# 📤 Загрузка обновлений на сервер

Выполните эти команды в **PowerShell** (по очереди, вводите пароль `SMU1t1_yKM` когда попросит):

## 1️⃣ Загрузите api.js

```powershell
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\routes\api.js root@tomich.fun:/opt/website/routes/
```

## 2️⃣ Загрузите downloads.js

```powershell
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\public\js\downloads.js root@tomich.fun:/opt/website/public/js/
```

## 3️⃣ Перезапустите контейнер на сервере

```powershell
ssh root@tomich.fun "cd /opt/website && docker compose restart website && sleep 5 && docker compose logs --tail 30 website"
```

## ✅ Что изменилось

После этих изменений:

- ✅ **Все ссылки на GitHub** удалены со страниц
- ✅ **Скачивание файлов** теперь идет через ваш сервер (прокси)
- ✅ **Работает с приватными репозиториями** - ваш сервер использует токен для доступа
- ✅ **Пользователи не видят прямых ссылок** на GitHub

### Как это работает:

**До (не работало бы с приватным repo):**
```
Пользователь → https://github.com/user/repo/releases/download/file.exe → ❌ 401 Unauthorized
```

**После (работает с приватным repo):**
```
Пользователь → https://tomich.fun/api/download/owner/repo/tag/file.exe → 
→ Ваш сервер → GitHub API (с токеном) → Файл отдается пользователю ✅
```

---

## 🔐 Когда закроете репозиторий

1. **Перейдите в Settings репозитория**: https://github.com/Tombraider2006/KCP/settings
2. **Scroll вниз** → **Danger Zone**
3. **Change repository visibility** → **Make private**

Пользователи всё равно смогут скачивать файлы с вашего сайта! 🎉



