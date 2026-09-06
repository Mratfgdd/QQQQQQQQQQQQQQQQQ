/**
 * Тонкий клієнт до FastAPI-бекенда.
 *
 * credentials: 'include' обов'язковий — сесія адміністратора живе в
 * HttpOnly-куці, і без цього браузер її не надішле. Токен у localStorage
 * ми свідомо не зберігаємо.
 *
 * Базова адреса береться з REACT_APP_API_URL, а за замовчуванням — це
 * localhost:8000, де піднімається бекенд у режимі розробки.
 */

/**
 * Базова адреса API.
 *
 * У продакшн-збірці REACT_APP_API_URL порожній (див. .env.production):
 * фронтенд і бекенд на Vercel живуть на одному домені, тому запити йдуть
 * відносними шляхами й самі потрапляють на потрібний хост. localhost у
 * продакшн-бандл не потрапляє.
 *
 * Увага на перевірку: саме `=== undefined`, а не `||`. Порожній рядок —
 * це валідне й осмислене значення «той самий домен», і з `||` він
 * помилково підмінявся б на localhost.
 */
const RAW_API_URL =
  process.env.REACT_APP_API_URL === undefined
    ? 'http://localhost:8000'
    : process.env.REACT_APP_API_URL;

export const API_URL = RAW_API_URL.replace(/\/$/, '');

/**
 * Абсолютна адреса файлу.
 *
 * /api/files/... — завантажене адміністратором зображення (лежить у базі),
 * /uploads/...   — те саме, але зі старих часів, коли файли писались на диск,
 * /photo.jpg     — файл із public/, його віддає сам фронтенд.
 */
export const mediaUrl = url => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.indexOf('/uploads/') === 0 || url.indexOf('/api/files/') === 0) {
    return API_URL + url;
  }
  return url;
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch(path, options = {}) {
  const { body, headers, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const response = await fetch(API_URL + path, {
    credentials: 'include',
    headers: isFormData
      ? headers
      : Object.assign({ 'Content-Type': 'application/json' }, headers),
    body: isFormData || body === undefined ? body : JSON.stringify(body),
    ...rest
  });

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    /* Технічні подробиці бекенда користувачу не показуємо — лише detail,
       який ми самі й формулюємо українською */
    const detail = payload && typeof payload.detail === 'string' ? payload.detail : null;
    throw new ApiError(detail || 'Не вдалося виконати запит', response.status);
  }

  return payload;
}

export const api = {
  get: path => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: 'POST', body }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body }),
  del: path => apiFetch(path, { method: 'DELETE' }),
  upload: file => {
    const form = new FormData();
    form.append('file', file);
    return apiFetch('/api/admin/uploads', { method: 'POST', body: form });
  }
};

export default api;
