# DEMI DEVILLE — подключение Railway PostgreSQL и почты

## 1. PostgreSQL

1. Откройте проект DEMI DEVILLE в Railway.
2. Нажмите **+ New → Database → PostgreSQL**.
3. Откройте сервис сайта → **Variables**.
4. Добавьте переменную:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Если сервис базы называется не `Postgres`, замените `Postgres` на его точное имя, например:

```text
DATABASE_URL=${{demi-db.DATABASE_URL}}
```

5. Добавьте:

```text
PGSSL=auto
PGPOOL_MAX=5
```

6. Перезапустите сервис сайта.

При первом запуске с пустой PostgreSQL приложение само создаёт таблицу `app_state` и переносит в неё текущее содержимое `data/db.json`. После этого рабочие данные читаются и сохраняются в PostgreSQL. Если строка в PostgreSQL уже существует, `data/db.json` её не перезаписывает.

## 2. Установка зависимостей

В `package.json` уже добавлены `pg` и `nodemailer`. Railway при сборке должен выполнить обычный `npm install`, а запускать проект командой:

```text
npm start
```

## 3. Постоянное хранение загруженных фото и видео

PostgreSQL хранит данные сайта, но сами загруженные файлы не нужно складывать в БД. Чтобы загруженные через админку фото/видео не исчезали после redeploy:

1. В Railway добавьте **Volume** к сервису сайта.
2. Укажите Mount Path, например:

```text
/data
```

3. В Variables сайта добавьте:

```text
UPLOAD_DIR=/data/uploads
MAX_UPLOAD_MB=60
```

После этого `/uploads/...` продолжает работать как раньше, но файлы физически лежат на постоянном Railway Volume.

## 4. Почта / SUPPORT / рассылки

Подключите SMTP-провайдера и добавьте в Variables:

```text
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-password
SMTP_SECURE=false
MAIL_FROM=DEMI DEVILLE <shop@example.com>
SUPPORT_TO=support@example.com
```

Для SMTP через порт `465` обычно нужно:

```text
SMTP_SECURE=true
```

После подключения:
- сообщения SUPPORT отправляются на `SUPPORT_TO`;
- в письме SUPPORT выставляется Reply-To клиента, поэтому на вопрос можно ответить обычной кнопкой Reply;
- подтверждение нового заказа отправляется покупателю на email;
- в админке **ПОЧТА** можно отправлять рассылку зарегистрированным пользователям, которые согласились получать новости.

## 5. Проверка после deploy

Откройте Railway → Deploy Logs. При успешном соединении с PostgreSQL в логах будет:

```text
PostgreSQL storage enabled.
DEMI DEVILLE running: http://localhost:...
```

Проверьте:
1. вход в `/admin`;
2. изменение любого текста/настройки и сохранение;
3. redeploy сервиса;
4. убедитесь, что изменение осталось — значит PostgreSQL работает;
5. загрузите тестовую картинку через админку, сделайте redeploy и убедитесь, что она осталась — значит Volume подключён правильно.

## 6. Важно

Не храните `DATABASE_URL`, `SMTP_PASS` и другие пароли в GitHub или в коде. Они должны находиться только в Railway Variables.
