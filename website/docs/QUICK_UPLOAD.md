# 🚀 Быстрая загрузка обновлений

## Вариант 1: Через bat-файл (РЕКОМЕНДУЕТСЯ)

1. **Откройте обычный терминал** (не через Cursor)
2. **Запустите:**
   ```
   D:\3DC\website\upload.bat
   ```
3. **Вводите пароль** `SMU1t1_yKM` когда попросит (3 раза)

---

## Вариант 2: Вручную через PowerShell

Откройте **PowerShell** и выполните по очереди:

### 1️⃣ Загрузите api.js
```powershell
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\routes\api.js root@tomich.fun:/opt/website/routes/
```
*Введите пароль:* `SMU1t1_yKM`

### 2️⃣ Загрузите downloads.js
```powershell
C:\Windows\System32\OpenSSH\scp.exe D:\3DC\website\public\js\downloads.js root@tomich.fun:/opt/website/public/js/
```
*Введите пароль:* `SMU1t1_yKM`

### 3️⃣ Перезапустите контейнер
```powershell
ssh root@tomich.fun "cd /opt/website && docker compose restart website && sleep 5 && docker compose logs --tail 30 website"
```
*Введите пароль:* `SMU1t1_yKM`

---

## ✅ После выполнения

Откройте **https://tomich.fun/downloads** и проверьте:
- ✅ Релизы отображаются
- ✅ При наведении на кнопку "Скачать" ссылка выглядит как `/api/download/...` (а не `github.com`)
- ✅ Скачивание работает

---

## 🔒 Теперь можно закрыть репозиторий!

После того как всё заработает, можете смело делать репозиторий **приватным**:

1. Перейдите: https://github.com/Tombraider2006/KCP/settings
2. Scroll вниз → **Danger Zone**
3. **Change repository visibility** → **Make private**

**Скачивание файлов продолжит работать!** Ваш сервер будет использовать GitHub токен для доступа к приватному репозиторию и отдавать файлы пользователям. 🎉



