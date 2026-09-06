import React, { useCallback, useEffect, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { media, TOUCH_TARGET } from '../utils/responsive';

/**
 * Повноекранний перегляд фотографії.
 *
 * Керується ззовні: батьківський компонент тримає індекс відкритого фото
 * (null — закрито) і передає onChange/onClose. Власного стану тут майже
 * немає, тому зайвих ре-рендерів не виникає.
 *
 * Без бібліотек — лише React і CSS.
 *
 * Керування: клік по фону, кнопка ×, Esc, стрілки ← →, кнопки ‹ ›,
 * горизонтальний свайп на тачскріні.
 */

/* Мінімальний горизонтальний зсув пальця, який вважаємо свайпом */
const SWIPE_THRESHOLD = 48;

/* Поки lightbox відкритий, сторінка під ним не скролиться.
   Селектор продубльований (.body-store-mode.body-store-mode) навмисно —
   так специфічність перебиває глобальний `overflow-y: auto !important`
   з src/index.js незалежно від порядку інжекту стилів.

   --pp-lock-pad компенсує ширину зниклої смуги прокрутки, інакше в
   момент відкриття весь макет стрибнув би праворуч на ~15px. */
const ScrollLock = createGlobalStyle`
  html.body-store-mode.body-store-mode {
    overflow: hidden !important;
  }

  body.body-store-mode.body-store-mode {
    padding-right: var(--pp-lock-pad, 0px);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const zoomIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.965);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 56px);
  box-sizing: border-box;
  /* Тепла глибока підкладка — однакова в денній і нічній темі:
     повноекранний перегляд завжди темний, це не третя тема */
  background: rgba(18, 14, 10, 0.94);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  animation: ${fadeIn} 320ms cubic-bezier(0.16, 1, 0.3, 1);
  -webkit-tap-highlight-color: transparent;
  /* Свайп по фото не має тягнути сторінку під ним */
  touch-action: pan-y;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  ${media.mobile} {
    padding: 0;
  }
`;

const Frame = styled.figure`
  margin: 0;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    display: block;
    max-width: min(92vw, 1400px);
    max-height: 86vh;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 10px;
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
    animation: ${zoomIn} 420ms cubic-bezier(0.16, 1, 0.3, 1);

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  ${media.mobile} {
    width: 100%;
    height: 100%;

    img {
      max-width: 100vw;
      max-height: 100vh;
      border-radius: 0;
      box-shadow: none;
    }
  }
`;

const Control = styled.button`
  position: absolute;
  z-index: 2;
  width: 52px;
  height: 52px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.07);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  color: #ffffff;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 380ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 380ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 380ms cubic-bezier(0.16, 1, 0.3, 1);

  svg {
    width: 22px;
    height: 22px;
    stroke: currentColor;
    fill: none;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @media (hover: hover) {
    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.4);
    }
  }

  &:active {
    transform: scale(0.94);
  }

  &:focus-visible {
    outline: 2px solid var(--pp-accent);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  ${media.mobile} {
    width: ${TOUCH_TARGET};
    height: ${TOUCH_TARGET};

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const CloseButton = styled(Control)`
  top: clamp(14px, 2.4vw, 30px);
  right: clamp(14px, 2.4vw, 30px);
`;

const PrevButton = styled(Control)`
  left: clamp(10px, 2.4vw, 30px);
  top: 50%;
  transform: translateY(-50%);

  &:active {
    transform: translateY(-50%) scale(0.94);
  }
`;

const NextButton = styled(Control)`
  right: clamp(10px, 2.4vw, 30px);
  top: 50%;
  transform: translateY(-50%);

  &:active {
    transform: translateY(-50%) scale(0.94);
  }
`;

export default function Lightbox({ photos = [], index = null, onClose, onChange }) {
  const isOpen = index !== null && index >= 0 && index < photos.length;

  const closeRef = useRef(null);
  const touchRef = useRef(null);

  const go = useCallback(
    step => {
      if (!photos.length) return;
      /* + photos.length — щоб від першого фото «назад» вело на останнє */
      onChange((index + step + photos.length) % photos.length);
    },
    [index, onChange, photos.length]
  );

  /* Клавіатура: Esc закриває, стрілки гортають */
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = event => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(-1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, go, onClose]);

  /* Компенсація ширини смуги прокрутки, щоб макет не стрибнув.

     Ширину міряємо окремим невидимим елементом, а НЕ різницею
     window.innerWidth і documentElement.clientWidth: коли спрацьовує цей
     ефект, ScrollLock уже встиг застосувати overflow: hidden, смуги вже
     немає, і різниця дала б 0 — тобто компенсації не було б, а саме її
     відсутність і викликає стрибок. Проба ж не залежить від того,
     застосований лок чи ні. */
  useEffect(() => {
    if (!isOpen) return undefined;

    const root = document.documentElement;

    /* Компенсуємо тільки якщо сторінка справді довша за екран —
       інакше смуги прокрутки не було й компенсувати нічого */
    if (root.scrollHeight <= root.clientHeight) return undefined;

    const probe = document.createElement('div');
    probe.style.cssText =
      'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll;';
    document.body.appendChild(probe);
    const scrollbar = probe.offsetWidth - probe.clientWidth;
    document.body.removeChild(probe);

    /* На мобільних смуга накладена поверх контенту й має нульову
       ширину — там компенсувати теж нічого */
    if (scrollbar <= 0) return undefined;

    root.style.setProperty('--pp-lock-pad', `${scrollbar}px`);
    return () => root.style.removeProperty('--pp-lock-pad');
  }, [isOpen]);

  /* Фокус переводимо на кнопку закриття, щоб Esc і Tab працювали одразу */
  useEffect(() => {
    if (isOpen && closeRef.current) closeRef.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const photo = photos[index];

  const onTouchStart = event => {
    const point = event.touches[0];
    touchRef.current = { x: point.clientX, y: point.clientY };
  };

  const onTouchEnd = event => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;

    const point = event.changedTouches[0];
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;

    /* Реагуємо лише на явно горизонтальний жест — вертикальний
       рух не має випадково гортати фото */
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    }
  };

  return (
    <React.Fragment>
      <ScrollLock />

      <Overlay
        role="dialog"
        aria-modal="true"
        aria-label="Перегляд фотографії"
        /* Клік по підкладці закриває, клік по самому фото — ні */
        onClick={event => {
          if (event.target === event.currentTarget) onClose();
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <CloseButton
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          title="Закрити"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </CloseButton>

        {photos.length > 1 && (
          <PrevButton
            type="button"
            onClick={() => go(-1)}
            aria-label="Попереднє фото"
            title="Попереднє фото"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="15 5 8 12 15 19" />
            </svg>
          </PrevButton>
        )}

        <Frame onClick={event => event.stopPropagation()}>
          {/* key={index} перезапускає появу при перегортанні */}
          <img key={photo.src} src={photo.src} alt={photo.alt} draggable="false" />
        </Frame>

        {photos.length > 1 && (
          <NextButton
            type="button"
            onClick={() => go(1)}
            aria-label="Наступне фото"
            title="Наступне фото"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="9 5 16 12 9 19" />
            </svg>
          </NextButton>
        )}
      </Overlay>
    </React.Fragment>
  );
}
