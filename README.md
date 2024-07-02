# Telegram Bot for Google Drive

## Описание

Данный бот каждый день в заданное время отправляет напоминание о необходимости пройти проверку. Далее бот по очереди запрашивает фотографию объекта. После сбора всех фотографий он создает папку на Google Drive и кладет туда все собранные фотографии пользователя.

## Основные функции и возможности

- Ежедневное напоминание о необходимости пройти проверку.
- Запрос и сбор фотографий от пользователя в соответствии с его ролью.
- Создание папки на Google Drive для хранения собранных фотографий для каждого отдельного пользователя.
- Создание папки с новой датой на Google Drive для хранения собранных фотографий.
- Автоматическая загрузка фотографий на Google Drive в папку пользователя под конкретную дату.
- Автоматическая очистка фотографий старше выставленного параметра даты.

## Требования

- Node.js > 14.21.3
- Google Drive API, настроенный и включенный в вашем проекте Google Cloud
- PostgreSQL, настроенный и запущенный

## Инструкции по установке

1. **Клонирование репозитория**
    ```sh
    git clone https://github.com/Original-pokemon/telegramBotGoogleDrive.git
    cd telegrambotgoogledrive
    ```

2. **Установка зависимостей**
    ```sh
    npm install
    ```

3. **Настройка Google Drive API**
    - Перейдите на [Google Cloud Console](https://console.cloud.google.com/).
    - Создайте новый проект.
    - Включите Google Drive API для вашего проекта.
    - Создайте OAuth 2.0 Client ID и загрузите JSON файл с учетными данными.
    - Поместите JSON файл в корень проекта и переименуйте его в `credentials.json`.

4. **Настройка Telegram Bot**
    - Перейдите в Telegram и найдите BotFather.
    - Создайте нового бота и получите токен.
    - Сохраните токен в файл `.env` в корне проекта:
    ```env
    BOT_TOKEN=your_telegram_token_here
    ```

5. **Настройка переменных окружения**
    Добавьте в файл `.env` следующие переменные окружения:
    ```env
    PG_HOST=''               # Адрес хоста базы данных PostgreSQL
    PG_PORT=''               # Порт для подключения к базе данных PostgreSQL
    PG_USER=''               # Имя пользователя для подключения к базе данных PostgreSQL
    PG_PASSWORD=''           # Пароль пользователя для подключения к базе данных PostgreSQL
    PG_DATABASE=''           # Имя базы данных PostgreSQL
    MAIN_ADMIN_ID=''         # Telegram ID основного администратора бота
    MAIN_FOLDER_NAME='TelegarmBotORTK'  # Название основной папки на Google Drive для хранения фотографий
    ```

6. **Запуск бота**
    ```sh
    npm start
    ```

7. **Авторизация в Google Drive**
    - При первом запуске перейдите по ссылке, которая появится в терминале, чтобы авторизовать доступ к вашему Google Drive.
    - Скопируйте код авторизации из открывшейся страницы и вставьте его в терминал.

## Структура проекта

```plaintext
telegrambotgoogledrive/
│
├── bot/
│   ├── admin.route.mjs
│   ├── question-setting.route.mjs
│   ├── schedule.route.mjs
│   ├── start.route.mjs
│   └── user.route.mjs
│
├── google-drive/
│   └── init-google-drive.mjs
│
├── middleware/
│   ├── auth.mw.mjs
│   └── response-time.mw.mjs
│
├── node_modules/
│
├── postgres-node/
│   ├── get-client.mjs
│   ├── init-base.mjs
│   ├── models.mjs
│   ├── send-query.mjs
│   ├── set-schema.mjs
│   └── set-table.mjs
│
├── repositories/
│   ├── group.repository.mjs
│   ├── photoFolder.mjs
│   ├── question.repository.mjs
│   └── user.repository.mjs
│
├── services/
│   ├── admin.service.mjs
│   ├── question-setting.service.mjs
│   ├── schedule.service.mjs
│   ├── start.service.mjs
│   └── user.service.mjs
│
├── vendor/
│
├── ecosystem.config.js
├── index.js
├── package-lock.json
└── package.json
```

## Описание директорий и файлов

- bot/: Отвечает за маршрутизацию (контроллеры).
- google-drive/: Отвечает за инициализацию Google Drive.
- middleware/: Содержит middleware для аутентификации и измерения времени ответа.
- postgres-node/: Содержит модули для работы с PostgreSQL.
- repositories/: Содержит репозитории для работы с данными.
- services/: Содержит сервисы для обработки логики приложения.
- index.js: Главный файл запуска приложения.
- ecosystem.config.js: Конфигурационный файл для управления процессами.
