# DEMI DEVILLE — Railway PostgreSQL, uploads и почта

Эта сборка умеет работать в двух режимах:

- без `DATABASE_URL` — использует текущий `data/db.json` (удобно локально);
- с `DATABASE_URL` — использует PostgreSQL. При первом запуске автоматически создаётся таблица `app_state`; если она пустая, текущие данные из `data/db.json` импортируются в PostgreSQL. Старый JSON при этом не удаляется.

Такой способ намеренно сохраняет существующую структуру магазина и не требует переделывать дизайн/страницы.

## 1. Подключить PostgreSQL на Railway

1. Открой проект Railway, в котором находится сайт.
2. Нажми **+ New → Database → PostgreSQL**.
3. Дождись запуска сервиса PostgreSQL.
4. Открой именно **сервис сайта → Variables**.
5. Добавь reference variable:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
PGSSL=auto
PGPOOL_MAX=5
```

Если сервис базы называется не `Postgres`, подставь его имя. Например:

```env
DATABASE_URL=${{DemiPostgres.DATABASE_URL}}
```

6. Сделай Redeploy веб-сервиса.
7. После запуска открой:

```text
https://ТВОЙ-ДОМЕН/api/health
```

При правильном подключении будет:

```json
{"ok":true,"storage":"postgres",...}
```

При первом старте данные текущего `data/db.json` переносятся в PostgreSQL только если `app_state` ещё пустая. После этого источником данных является PostgreSQL.

## 2. Сохранение загруженных фото и видео между деплоями

Файлы, загруженные через админку, не стоит хранить только внутри deploy-контейнера Railway. Подключи Volume:

1. В Railway добавь Volume к **веб-сервису сайта**.
2. Mount Path укажи:

```text
/data
```

3. В Variables веб-сервиса добавь:

```env
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_MB=60
```

После этого загруженные через админку изображения/видео будут записываться в `/data/uploads` и сохраняться между redeploy/restart.

`MAX_UPLOAD_MB` можно изменить. Для фонов лучше заранее сжимать видео до MP4/WebM, потому что огромные файлы ухудшают скорость мобильной версии.

## 3. Подключить почту / SUPPORT / рассылки / входящие в админке

Для **отправки** писем нужен SMTP. В Railway → сервис сайта → **Variables** добавь:

```env
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=shop@your-domain.com
SMTP_PASS=YOUR_SMTP_PASSWORD
SMTP_SECURE=false
MAIL_FROM=DEMI DEVILLE <shop@your-domain.com>
SUPPORT_TO=support@your-domain.com
```

Если провайдер использует SMTP `465`:

```env
SMTP_PORT=465
SMTP_SECURE=true
```

Для **получения входящих прямо в Админка → ПОЧТА** нужен IMAP того же почтового ящика:

```env
IMAP_HOST=imap.provider.com
IMAP_PORT=993
IMAP_USER=shop@your-domain.com
IMAP_PASS=YOUR_IMAP_PASSWORD
IMAP_SECURE=true
IMAP_MAILBOX=INBOX
```

После добавления переменных сделай **Redeploy** сайта. В админке открой **ПОЧТА → Обновить входящие**. Письмо можно открыть и ответить на него прямо из панели: входящие читаются через IMAP, а ответ отправляется через SMTP.

### Если используешь Gmail

Для обычного Gmail/Google Workspace обычно используются:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_SECURE=true
SMTP_USER=your@gmail.com
IMAP_USER=your@gmail.com
```

Для `SMTP_PASS` и `IMAP_PASS` используй **пароль приложения (App Password)**, если он доступен в твоём аккаунте; обычный пароль аккаунта Google использовать не стоит. В некоторых почтовых сервисах IMAP нужно отдельно включить в настройках ящика.

### Что работает после подключения

- SUPPORT отправляет письмо на `SUPPORT_TO`;
- email клиента ставится в `Reply-To`;
- подтверждения и смена статуса заказа отправляются клиенту;
- **рассылка из админки отправляется всем клиентским email, которые есть в базе сайта** (админский аккаунт исключён, одинаковые email не дублируются);
- вкладка **ПОЧТА** показывает последние входящие через IMAP;
- из открытого письма можно написать ответ прямо в админке.

Реальные пароли почты **не записывай в код, `.env.example` или GitHub** — только в Railway Variables.

## 4. Что установить локально

В папке проекта:

```powershell
npm install
npm start
```

Пакеты `pg`, `nodemailer`, `imapflow` и `mailparser` уже указаны в `package.json`.

## 5. Быстрая проверка после деплоя

Проверь по порядку:

1. `/api/health` показывает `"storage":"postgres"`.
2. SHOP показывает существующие товары.
3. Админка видит товары/заказы/галерею.
4. Загрузи тестовую картинку или видео, сделай redeploy и убедись, что файл остался.
5. Отправь SUPPORT-сообщение.
6. Открой Админка → ПОЧТА → «Обновить входящие», открой письмо и отправь тестовый ответ.
7. Создай тестовый заказ и измени его статус в админке.

## Важно

- Не создавай вручную таблицу `app_state` — сервер создаёт её сам.
- Не удаляй текущий `data/db.json` до успешной проверки первого запуска с PostgreSQL: он используется как исходные данные для первой миграции, если база пустая.
- После успешной миграции все новые изменения магазина сохраняются в PostgreSQL.
