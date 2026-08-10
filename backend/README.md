# Parket Planet — бекенд

FastAPI + SQLite + SQLAlchemy. Обслуговує і публічний сайт, і адмін-панель.

## Запуск

```bash
cd backend
py -m pip install -r requirements.txt     # один раз
py -m uvicorn app.main:app --reload --port 8000
```

При першому старті автоматично:

* створюється `parket_planet.db`;
* заводиться адміністратор `admin` / `parket` (у базі лише bcrypt-хеш);
* каталог наповнюється реальними даними сайту з `app/seed_data.json`;
* створюється каталог `uploads/` для фотографій.

Документація API: http://localhost:8000/docs

## Змінні середовища (необов'язкові)

| Змінна | Призначення | За замовчуванням |
|---|---|---|
| `PP_SECRET_KEY` | ключ підпису JWT | генерується у `backend/.secret` |
| `PP_ADMIN_USER` | логін першого адміністратора | `admin` |
| `PP_ADMIN_PASSWORD` | його початковий пароль | `parket` |
| `PP_DATABASE_URL` | рядок підключення | `sqlite:///parket_planet.db` |
| `PP_ALLOWED_ORIGINS` | дозволені origin для CORS | `http://localhost:3000,...` |

## Що не потрапляє в репозиторій

`parket_planet.db`, `uploads/`, `.secret` — див. `.gitignore`.
