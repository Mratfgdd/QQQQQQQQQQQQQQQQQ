import React, { useState } from 'react';
import styled from 'styled-components';
import { api } from '../api/client';
import { Button, Field, Notice } from './AdminUI';
import { media } from '../utils/responsive';

/**
 * Вхід до адмін-панелі.
 *
 * Пароль сюди тільки вводиться й одразу відправляється на бекенд.
 * У коді фронтенду немає ані пароля, ані порівняння з ним — перевірка
 * відбувається виключно в FastAPI, а сесія повертається HttpOnly-кукою.
 */

const Screen = styled.div`
  min-height: 100vh;
  background-color: var(--pp-bg-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  font-family: 'Helvetica Neue', Arial, sans-serif;
`;

const Card = styled.form`
  width: 100%;
  max-width: 420px;
  background-color: var(--pp-surface);
  border: 1px solid var(--pp-divider);
  border-radius: 20px;
  padding: 40px 36px;
  box-sizing: border-box;
  box-shadow: 0 30px 70px rgba(26, 22, 19, 0.12);

  .brand {
    text-align: center;
    margin-bottom: 30px;

    .mark {
      width: 38px;
      height: 38px;
      margin: 0 auto 16px auto;
      border: 1.5px solid var(--pp-accent);
      border-radius: 50%;
    }

    h1 {
      font-family: 'Times New Roman', serif;
      font-size: 27px;
      font-weight: 400;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--pp-text);
      margin: 0 0 6px 0;
    }

    span {
      font-size: 11.5px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--pp-accent);
    }
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .reveal {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--pp-text-2);
    margin-top: 12px;
    cursor: pointer;
    user-select: none;

    input {
      width: 16px;
      height: 16px;
      accent-color: var(--pp-accent);
    }
  }

  button[type='submit'] {
    width: 100%;
    margin-top: 24px;
    padding: 13px;
    font-size: 14px;
  }

  ${media.mobile} {
    padding: 30px 22px;
  }
`;

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await api.post('/api/auth/login', { username, password });
      await onSuccess();
    } catch (apiError) {
      /* Технічних подробиць не показуємо — лише зрозуміле повідомлення */
      setError(
        apiError.status === 401
          ? 'Невірний логін або пароль'
          : 'Сервер недоступний. Перевірте, чи запущено бекенд.'
      );
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Card onSubmit={submit}>
        <div className="brand">
          <div className="mark" />
          <h1>Parket Planet</h1>
          <span>Адмін-панель</span>
        </div>

        {error && <Notice $error>{error}</Notice>}

        <div className="fields">
          <Field>
            <span className="label">Логін</span>
            <input
              type="text"
              value={username}
              onChange={event => setUsername(event.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </Field>

          <Field>
            <span className="label">Пароль</span>
            <input
              type={reveal ? 'text' : 'password'}
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
        </div>

        <label className="reveal">
          <input
            type="checkbox"
            checked={reveal}
            onChange={event => setReveal(event.target.checked)}
          />
          Показати пароль
        </label>

        <Button type="submit" disabled={busy}>
          {busy ? 'Перевіряємо…' : 'Увійти'}
        </Button>
      </Card>
    </Screen>
  );
}
