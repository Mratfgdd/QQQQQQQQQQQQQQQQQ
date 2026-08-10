import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { api } from '../api/client';
import { media } from '../utils/responsive';

/**
 * Спільні примітиви адмін-панелі та хук сесії.
 *
 * Кольори — виключно існуючі CSS-змінні теми (--pp-*), тому адмінка
 * автоматично підтримує Day/Night і не має власної палітри.
 */

/* ── Сесія ──
   Стан авторизації визначає ТІЛЬКИ бекенд: ми питаємо /api/auth/me,
   який читає HttpOnly-куку. Жодного пароля чи токена у фронтенді немає. */
export function useAdminSession() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await api.get('/api/auth/me'));
    } catch (error) {
      setUser(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, checking, refresh, setUser };
}

export const AdminShell = styled.div`
  min-height: 100vh;
  background-color: var(--pp-bg-alt);
  color: var(--pp-text);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  display: flex;

  ${media.tablet} {
    flex-direction: column;
  }
`;

export const Panel = styled.section`
  background-color: var(--pp-surface);
  border: 1px solid var(--pp-divider);
  border-radius: 16px;
  padding: 22px;
  box-sizing: border-box;

  ${media.mobile} {
    padding: 16px;
    border-radius: 14px;
  }
`;

export const PageTitle = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;

  h1 {
    font-family: 'Times New Roman', serif;
    font-size: clamp(26px, 3vw, 38px);
    font-weight: 400;
    color: var(--pp-text);
    margin: 0 0 4px 0;
  }

  p {
    font-size: 13.5px;
    color: var(--pp-text-3);
    margin: 0;
  }
`;

const buttonBase = css`
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  border-radius: 10px;
  padding: 10px 18px;
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.25s ease, border-color 0.25s ease, opacity 0.25s ease;

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }

  ${media.mobile} {
    min-height: 44px;
  }
`;

export const Button = styled.button`
  ${buttonBase};
  background-color: var(--pp-accent);
  color: #ffffff;

  &:hover:not(:disabled) {
    background-color: var(--pp-accent-strong);
  }
`;

export const GhostBtn = styled.button`
  ${buttonBase};
  background-color: transparent;
  border-color: var(--pp-divider);
  color: var(--pp-text);

  &:hover:not(:disabled) {
    border-color: var(--pp-accent);
  }
`;

export const DangerBtn = styled.button`
  ${buttonBase};
  background-color: transparent;
  border-color: rgba(178, 58, 46, 0.45);
  color: #b23a2e;

  &:hover:not(:disabled) {
    background-color: rgba(178, 58, 46, 0.08);
  }
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  span.label {
    font-size: 11.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--pp-text-3);
  }

  input,
  textarea,
  select {
    font-family: inherit;
    font-size: 14px;
    color: var(--pp-text);
    background-color: var(--pp-bg);
    border: 1px solid var(--pp-divider);
    border-radius: 10px;
    padding: 11px 13px;
    box-sizing: border-box;
    width: 100%;

    &:focus {
      outline: none;
      border-color: var(--pp-accent);
    }
  }

  textarea {
    min-height: 96px;
    resize: vertical;
  }

  ${media.mobile} {
    input,
    select {
      min-height: 44px;
    }
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns || 2}, minmax(0, 1fr));
  gap: 16px;

  ${media.mobile} {
    /* На телефоні форма завжди в одну колонку */
    grid-template-columns: 1fr;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;

  input[type='search'],
  select {
    font-family: inherit;
    font-size: 13.5px;
    color: var(--pp-text);
    background-color: var(--pp-surface);
    border: 1px solid var(--pp-divider);
    border-radius: 10px;
    padding: 10px 12px;
  }

  input[type='search'] {
    flex: 1;
    min-width: 180px;
  }

  ${media.mobile} {
    input[type='search'],
    select {
      min-height: 44px;
      width: 100%;
    }
  }
`;

/* Таблиця на десктопі, картки на телефоні */
export const Rows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 64px minmax(0, 2fr) minmax(0, 1fr) 120px 110px auto;
  gap: 14px;
  align-items: center;
  background-color: var(--pp-surface);
  border: 1px solid var(--pp-divider);
  border-radius: 14px;
  padding: 12px 14px;

  .thumb {
    width: 64px;
    height: 52px;
    border-radius: 8px;
    background-color: var(--pp-surface-2);
    background-size: cover;
    background-position: center;
  }

  .name {
    min-width: 0;

    strong {
      display: block;
      font-weight: 500;
      font-size: 14.5px;
      color: var(--pp-text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      font-size: 11.5px;
      color: var(--pp-text-3);
    }
  }

  .muted {
    font-size: 13px;
    color: var(--pp-text-2);
  }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  ${media.tablet} {
    grid-template-columns: 64px minmax(0, 1fr);
    grid-auto-rows: min-content;

    .actions {
      grid-column: 1 / -1;
      justify-content: flex-start;
    }

    .muted {
      grid-column: 2;
    }
  }
`;

export const Badge = styled.span`
  display: inline-block;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid var(--pp-divider);
  color: ${props => (props.$on ? 'var(--pp-accent)' : 'var(--pp-text-3)')};
  border-color: ${props => (props.$on ? 'var(--pp-accent)' : 'var(--pp-divider)')};
  white-space: nowrap;
`;

export const Notice = styled.div`
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 13.5px;
  margin-bottom: 16px;
  border: 1px solid
    ${props => (props.$error ? 'rgba(178, 58, 46, 0.4)' : 'var(--pp-accent)')};
  color: ${props => (props.$error ? '#b23a2e' : 'var(--pp-text)')};
  background-color: ${props =>
    props.$error ? 'rgba(178, 58, 46, 0.07)' : 'rgba(185, 147, 90, 0.1)'};
`;

/* Підтвердження замість window.confirm */
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(12, 9, 7, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 200;
`;

const Dialog = styled(Panel)`
  max-width: 420px;
  width: 100%;

  h3 {
    font-family: 'Times New Roman', serif;
    font-size: 22px;
    font-weight: 400;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 14px;
    line-height: 1.55;
    color: var(--pp-text-2);
    margin: 0 0 20px 0;
  }

  .buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
`;

export function ConfirmDialog({ title, text, confirmLabel, onConfirm, onCancel }) {
  return (
    <Backdrop onClick={onCancel}>
      <Dialog onClick={event => event.stopPropagation()}>
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="buttons">
          <GhostBtn type="button" onClick={onCancel}>
            Скасувати
          </GhostBtn>
          <DangerBtn type="button" onClick={onConfirm}>
            {confirmLabel || 'Видалити'}
          </DangerBtn>
        </div>
      </Dialog>
    </Backdrop>
  );
}
