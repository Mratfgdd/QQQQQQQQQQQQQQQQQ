# Деплой Parket Planet на Vercel (безкоштовно) — АЛЬТЕРНАТИВНИЙ ВАРІАНТ

> **Основна інструкція — `DEPLOY.md`: фронтенд на Vercel, бекенд на Render.**
> Саме під неї налаштовані `vercel.json`, `.vercelignore` та `render.yaml`.
>
> Цей файл описує інший варіант: **усе на Vercel одним доменом**, де API
> працює serverless-функцією з теки `api/`. Він має свою перевагу — кука
> адмінки лишається first-party, тому вхід працює навіть у Safari.
>
> Щоб повернутися до нього, треба:
> 1. прибрати `api/`, `backend/` і `requirements.txt` із `.vercelignore`;
> 2. повернути у `vercel.json` секцію `"functions"` для `api/index.py`
>    та rewrite `/api/(.*)` → `/api/index`;
> 3. НЕ задавати `REACT_APP_API_URL` у Vercel — запити мають лишитися
>    відносними;
> 4. задати `PP_DATABASE_URL` (Postgres) у змінних Vercel.

Після деплою весь сайт — і фронтенд, і API, і адмін-панель — живе на
одній адресі виду `https://parket-planet.vercel.app`. Її можна просто
надіслати клієнту: жодного localhost, жодної залежності від вашої
мережі чи ввімкненого комп'ютера.

---

## Як це влаштовано

```
https://parket-planet.vercel.app
├── /                     → статична збірка React (тека build/)
├── /parquet, /cart, …    → та сама збірка (SPA-маршрутизація)
└── /api/*                → serverless-функція Python (api/index.py)
                             └── імпортує backend/app/main.py — той самий
                                 FastAPI, що запускається локально
```

Фронтенд і API на **одному домені**. Це дає три речі безкоштовно:

- **CORS не потрібен** — запити не крос-доменні;
- **кука адмінки працює** як звичайна first-party: `SameSite=lax` + `Secure`,
  без `SameSite=None`, який ріжуть Safari й режими блокування сторонніх кук;
- у бандлі **немає адреси бекенда** — усі запити відносні (`/api/...`).

---

## Що потрібно ОДИН раз створити

### 1. База даних Postgres (обов'язково)

SQLite на Vercel працювати не може: файлова система serverless доступна
лише для читання, а `/tmp` живе один виклик функції. Тому потрібна
зовнішня база. Безкоштовні варіанти:

| Сервіс | Безкоштовно | Де взяти рядок підключення |
|---|---|---|
| **Neon** (рекомендую) | 0.5 ГБ | neon.tech → Create project → Connection string |
| Vercel Postgres | є free-tier | у Vercel: Storage → Create Database → Postgres |
| Supabase | 0.5 ГБ | supabase.com → Project Settings → Database → URI |

Скопіюйте рядок виду:

```
postgres://user:password@ep-cool-name.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Формат `postgres://`, `postgresql://` чи вже з драйвером — не має значення,
бекенд сам приводить його до потрібного вигляду.

> Фотографії, завантажені в адмін-панелі, зберігаються **в цій же базі**
> (таблиця `uploaded_files`) і віддаються через `/api/files/...`. Окремий
> сервіс для файлів заводити не треба. 0.5 ГБ вистачає на сотні фото.

### 2. Змінні середовища у Vercel

Vercel → ваш проєкт → **Settings → Environment Variables**.
Додайте для всіх середовищ (Production, Preview, Development):

| Ім'я | Значення | Навіщо |
|---|---|---|
| `PP_DATABASE_URL` | рядок підключення з кроку 1 | **обов'язково.** Без нього API не підніметься |
| `PP_SECRET_KEY` | довгий випадковий рядок | **обов'язково.** Підпис сесії адміна. Без нього кожен холодний старт генерує новий ключ, і вас викидатиме з панелі |
| `PP_ADMIN_PASSWORD` | ваш пароль | пароль першого адміністратора. Якщо не задати — буде `parket` |
| `NOVA_POSHTA_API_KEY` | ключ із кабінету НП | не обов'язково: довідник відділень працює й без ключа, але з лімітами |

`PP_SECRET_KEY` можна згенерувати так:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

**CORS і адресу API задавати не треба.** Домен один, тому
`PP_ALLOWED_ORIGINS`, `PP_COOKIE_SAMESITE` і `REACT_APP_API_URL` не
потрібні — усе вже налаштовано в репозиторії.

---

## Команди для деплою (термінал VS Code)

### Варіант А — через GitHub (рекомендую)

Кожен `git push` автоматично передеплоює сайт.

```bash
# 1. Зафіксувати зміни
git add .
git commit -m "Підготовка до деплою на Vercel"
git push
```

Далі один раз у браузері: **vercel.com → Add New → Project → Import**
ваш репозиторій → Deploy. Змінні середовища додайте на кроці імпорту або
одразу після нього (див. таблицю вище), і натисніть **Redeploy**.

### Варіант Б — напряму з VS Code через Vercel CLI

```bash
# 1. Встановити CLI (один раз)
npm i -g vercel

# 2. Увійти (відкриє браузер)
vercel login

# 3. Прив'язати теку до проєкту — на всі питання можна тиснути Enter,
#    Vercel підхопить налаштування з vercel.json
vercel link

# 4. Додати змінні середовища
vercel env add PP_DATABASE_URL production
vercel env add PP_SECRET_KEY production
vercel env add PP_ADMIN_PASSWORD production

# 5. Бойовий деплой
vercel --prod
```

Після завершення CLI надрукує адресу — це і є посилання для клієнта.

---

## Після першого деплою

1. Відкрийте `https://<ваш-домен>.vercel.app/api/health` — має бути
   `{"status":"ok"}`. Якщо ні — дивіться логи: Vercel → Deployments →
   останній деплой → **Functions** → `api/index`.
2. Відкрийте `https://<ваш-домен>.vercel.app/admin`, увійдіть і **одразу
   змініть пароль** у розділі «Налаштування».
3. База наповнюється автоматично при першому запиті: категорії, товари,
   галерея. Нічого імпортувати вручну не треба.

---

## Що НЕ зміниться локально

Локальна розробка працює як раніше:

```bash
# бекенд
cd backend
py -m uvicorn app.main:app --reload --port 8000

# фронтенд (інший термінал)
npm start
```

`.env.development` і далі вказує на `http://localhost:8000`, база —
той самий `backend/parket_planet.db`.

---

## Часті проблеми

**Збірка падає з `ERR_OSSL_EVP_UNSUPPORTED`** — цього не станеться:
у `vercel.json` команда збірки вже містить потрібні змінні:

```
CI=false GENERATE_SOURCEMAP=false NODE_OPTIONS=--openssl-legacy-provider npx react-scripts build
```

- `NODE_OPTIONS=--openssl-legacy-provider` — webpack 4 із CRA 3 інакше не
  запускається на сучасному Node;
- `CI=false` — Vercel виставляє `CI=true`, а CRA у цьому режимі вважає
  будь-яке попередження помилкою; у 3D-частині проєкту їх багато, і
  збірка падала б без жодної реальної проблеми.

Ці змінні задані саме в `vercel.json`, а не в npm-скрипті, бо
`npm run` на Windows виконується через `cmd`, який такого синтаксису
не розуміє — скрипт ламав би локальну збірку.

**`/api/*` віддає 404** — перевірте, що теки `api/` і файл `vercel.json`
потрапили в коміт.

**API 500 одразу після деплою** — майже завжди не задано
`PP_DATABASE_URL`. У логах функції буде явне повідомлення про це.

**Виходить з адмінки саме по собі** — не задано `PP_SECRET_KEY`.
