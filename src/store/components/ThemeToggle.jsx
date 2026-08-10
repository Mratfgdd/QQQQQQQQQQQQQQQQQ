import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { media } from '../utils/responsive';

/**
 * Перемикач DAY / NIGHT і весь стан теми в одному файлі.
 *
 * Тема — це атрибут data-theme="night" на <html>; самі кольори живуть
 * у CSS-змінних (--pp-*) у src/styles.css. Тут лише перемикання й пам'ять.
 *
 * Вибір зберігається в localStorage під ключем 'pp-theme'. Початкове
 * значення виставляє маленький інлайновий скрипт у public/index.html —
 * ще до першого малювання, тому спалаху світлої теми немає. Тут ми його
 * лише зчитуємо й тримаємо синхронним із React.
 *
 * Стан навмисно поза React-контекстом: перемикач стоїть і в шапці, і в
 * мобільному меню, а модульний список підписників дешевший за ще один
 * Provider навколо всього застосунку.
 */

const STORAGE_KEY = 'pp-theme';
const NIGHT = 'night';
const DAY = 'day';

const subscribers = [];

const readStored = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === NIGHT ? NIGHT : DAY;
  } catch (error) {
    /* приватний режим або вимкнене сховище */
    return DAY;
  }
};

let currentTheme = typeof window === 'undefined' ? DAY : readStored();

const applyTheme = theme => {
  const root = document.documentElement;

  if (theme === NIGHT) {
    root.setAttribute('data-theme', NIGHT);
  } else {
    root.removeAttribute('data-theme');
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    /* не змогли зберегти — тема все одно застосована на цю сесію */
  }
};

export function useTheme() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    subscribers.push(setTheme);

    /* Якщо інлайновий скрипт не відпрацював — доводимо DOM до стану, який
       вважає правильним localStorage */
    if (theme !== currentTheme) setTheme(currentTheme);
    applyTheme(currentTheme);

    return () => {
      const index = subscribers.indexOf(setTheme);
      if (index !== -1) subscribers.splice(index, 1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return theme;
}

export function toggleTheme() {
  currentTheme = currentTheme === NIGHT ? DAY : NIGHT;
  applyTheme(currentTheme);
  subscribers.forEach(notify => notify(currentTheme));
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
  </svg>
);

const Switch = styled.button`
  position: relative;
  width: 62px;
  height: 30px;
  flex-shrink: 0;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.06);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  -webkit-tap-highlight-color: transparent;

  &:hover,
  &:focus-visible {
    border-color: var(--pp-accent);
  }

  /* Рухома «пігулка» під активною іконкою */
  .knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 24px;
    height: 22px;
    border-radius: 999px;
    background-color: var(--pp-accent);
    transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateX(${props => (props.$night ? '32px' : '0')});
  }

  .icons {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 7px;
  }

  svg {
    width: 14px;
    height: 14px;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    transition: stroke 0.42s ease, opacity 0.42s ease;
  }

  /* Іконка під пігулкою — темна, друга — приглушено світла */
  .sun svg {
    stroke: ${props => (props.$night ? 'rgba(255, 255, 255, 0.55)' : '#14100c')};
  }

  .moon svg {
    stroke: ${props => (props.$night ? '#14100c' : 'rgba(255, 255, 255, 0.55)')};
  }

  ${media.tablet} {
    width: 58px;
    height: 30px;

    .knob {
      transform: translateX(${props => (props.$night ? '28px' : '0')});
    }
  }

  /* Телефон: шапка вузька, тому перемикач компактніший, але лишається на місці */
  ${media.mobile} {
    width: 50px;
    height: 28px;

    .knob {
      width: 21px;
      height: 20px;
      transform: translateX(${props => (props.$night ? '24px' : '0')});
    }

    .icons {
      padding: 0 6px;
    }

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

export default function ThemeToggle({ className }) {
  const theme = useTheme();
  const night = theme === NIGHT;

  return (
    <Switch
      type="button"
      className={className}
      $night={night}
      onClick={toggleTheme}
      role="switch"
      aria-checked={night}
      aria-label={night ? 'Увімкнути денну тему' : 'Увімкнути нічну тему'}
      title={night ? 'Денна тема' : 'Нічна тема'}
    >
      <span className="knob" />
      <span className="icons">
        <span className="sun">
          <SunIcon />
        </span>
        <span className="moon">
          <MoonIcon />
        </span>
      </span>
    </Switch>
  );
}
