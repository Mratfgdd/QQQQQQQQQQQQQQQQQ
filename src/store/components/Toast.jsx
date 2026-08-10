import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useShop } from '../state/shopStore';
import { media } from '../utils/responsive';

/**
 * Ненав'язливе сповіщення «Додано до кошика / до обраного».
 *
 * Монтується один раз у src/index.js поруч із роутером, тому працює на
 * будь-якій сторінці. Замість alert() — коротка пігулка знизу по центру,
 * яка сама зникає через TOAST_LIFETIME. Кольори беруться з тих самих
 * CSS-змінних теми, тож у нічному режимі вона теж на місці.
 */

const TOAST_LIFETIME = 2600;

const Pill = styled.div`
  position: fixed;
  left: 50%;
  bottom: 32px;
  z-index: 120;
  transform: translate(-50%, ${props => (props.$visible ? '0' : '16px')});
  opacity: ${props => (props.$visible ? 1 : 0)};
  transition: opacity 0.32s ease, transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;

  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100vw - 32px);
  padding: 12px 22px;
  border-radius: 999px;
  box-sizing: border-box;

  background: linear-gradient(180deg, var(--pp-chrome-top) 0%, var(--pp-chrome-bottom) 100%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.32);

  font-family: 'Helvetica Neue', sans-serif;
  font-size: 13.5px;
  letter-spacing: 0.02em;
  color: #ffffff;
  white-space: nowrap;

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: var(--pp-accent);
    flex-shrink: 0;
  }

  ${media.mobile} {
    bottom: 20px;
    padding: 11px 18px;
    font-size: 13px;
    white-space: normal;
  }
`;

export default function Toast() {
  const toast = useShop(state => state.toast);
  const hideToast = useShop(state => state.hideToast);

  /* Тримаємо текст локально, щоб пігулка встигла плавно згаснути,
     а не зникла разом зі значенням у сторі */
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;

    setMessage(toast.message);
    setVisible(true);

    const hideTimer = window.setTimeout(() => setVisible(false), TOAST_LIFETIME);
    const clearTimer = window.setTimeout(hideToast, TOAST_LIFETIME + 400);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearTimer);
    };
  }, [toast, hideToast]);

  if (!message) return null;

  return (
    <Pill $visible={visible} role="status" aria-live="polite">
      <span className="dot" />
      {message}
    </Pill>
  );
}
