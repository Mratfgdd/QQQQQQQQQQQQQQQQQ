import React from 'react';
import styled, { css } from 'styled-components';
import { media } from '../utils/responsive';

/**
 * Кнопка головних дій Parket Planet.
 *
 * Одна на дві ключові кнопки сайту — «Переглянути колекцію» на першому
 * екрані та «3D Візуалізація» в шапці, — щоб вони читалися як пара.
 *
 * ЛОГІКА ДИЗАЙНУ: стриманість замість блиску.
 *
 * Кнопка в спокої — це майже нічого: волосяна рамка, капітель із широким
 * трекінгом і повітря навколо. Кольором вона наливається лише у відповідь
 * на курсор — заливка акцентом виїжджає зліва направо, а текст на ній
 * стає темним. Такий прийом (порожньо → залито) виглядає дорожче за
 * будь-який градієнт, бо тримає паузу: у спокої кнопка не сперечається ні
 * з фотографією інтер'єру, ні з логотипом.
 *
 * Свідомо НЕ використано: золоті градієнти, зовнішнє світіння, білий
 * «зайчик» по діагоналі, великі розміри. Саме ці прийоми здешевлюють
 * вигляд і роблять кнопку схожою на стандартний UI-кіт.
 *
 * ТЕХНІЧНІ ДЕТАЛІ, ЯКІ ЛЕГКО ВТРАТИТИ:
 *
 * • `background-color: transparent` — обов'язковий. `appearance: none`
 *   НЕ прибирає власний фон кнопки: Chrome лишає системний `buttonface`
 *   (#f0f0f0), і напівпрозорий варіант перетворюється на білу пляму зі
 *   світлим текстом. Це вже траплялося — не прибирати цей рядок.
 *
 * • Заливка — окремий шар `::before` зі `scaleX`, а не зміна
 *   `background-color`: трансформації малюються на композиторі, тому
 *   анімація не чіпає layout і тримає 60 FPS на телефоні.
 *
 * • На тач-екранах :hover не існує, тому мобільна версія одразу має
 *   видимий, самодостатній вигляд і hit-area не менше 48px.
 */

const variants = {
  /* На фотографії: темне димчасте скло + світла рамка.
     Заливка на hover — теплий акцент, текст стає майже чорним. */
  glass: css`
    color: #f6f1ea;
    border-color: rgba(255, 255, 255, 0.38);
    background-color: rgba(18, 14, 10, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    &::before {
      background-color: var(--pp-accent);
    }

    &:hover {
      color: #171008;
      border-color: var(--pp-accent);
    }
  `,

  /* У темній шапці: повністю прозоро, лише волосяна золота рамка */
  outline: css`
    color: rgba(246, 241, 234, 0.92);
    border-color: rgba(201, 164, 106, 0.5);
    background-color: transparent;

    &::before {
      background-color: var(--pp-accent);
    }

    &:hover {
      color: #171008;
      border-color: var(--pp-accent);
    }
  `
};

const Root = styled.button`
  /* ── Скидання системного вигляду кнопки ── */
  appearance: none;
  -webkit-appearance: none;
  /* Не прибирати: без цього крізь напівпрозорі варіанти світиться
     системний сірий фон кнопки (#f0f0f0) */
  background-color: transparent;
  background-image: none;
  margin: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;

  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;

  border: 1px solid transparent;
  border-radius: 999px;
  padding: ${props => (props.$size === 'lg' ? '15px 32px' : '11px 22px')};

  font-size: ${props => (props.$size === 'lg' ? '11.5px' : '10.5px')};
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  white-space: nowrap;
  /* Широкий трекінг додає порожнечу праворуч — компенсуємо, щоб напис
     стояв в оптичному центрі */
  text-indent: 0.2em;

  transition:
    color 420ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 420ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 260ms cubic-bezier(0.16, 1, 0.3, 1);

  /* Шар заливки: у спокої стиснутий у нуль біля лівого краю */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    border-radius: inherit;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  ${props => variants[props.$variant] || variants.glass};

  .pp-btn-label {
    position: relative;
  }

  .pp-btn-arrow {
    position: relative;
    display: inline-flex;
    /* Стрілка трохи тонша за текст — так вона не перетягує увагу */
    opacity: 0.85;
    transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1), opacity 420ms ease;
  }

  &:hover::before {
    transform: scaleX(1);
  }

  &:hover .pp-btn-arrow {
    opacity: 1;
    transform: translate3d(3px, 0, 0);
  }

  /* Натискання: коротке, майже непомітне — саме тому воно й відчувається
     дорогим, а не «пружинним» */
  &:active {
    transform: scale(0.985);
    transition-duration: 90ms;
  }

  &:focus-visible {
    outline: none;
    border-color: var(--pp-accent);
    box-shadow: 0 0 0 3px rgba(201, 164, 106, 0.28);
  }

  ${media.tablet} {
    padding: ${props => (props.$size === 'lg' ? '14px 26px' : '11px 18px')};
    letter-spacing: 0.14em;
    text-indent: 0.14em;
    min-height: 44px;
  }

  ${media.mobile} {
    min-height: 48px;
    font-size: 11px;

    /* Головна дія на телефоні розтягується на доступну ширину:
       максимальна площа влучання і акуратний блок під текстом */
    ${props =>
      props.$block &&
      css`
        width: 100%;
        max-width: 320px;
      `};

    /* Курсора немає — кнопка має бути самодостатньою одразу, тому
       заливка показується постійно, а не на hover */
    &::before {
      transform: scaleX(1);
    }

    color: #171008;
    border-color: var(--pp-accent);

    &:hover {
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: color 200ms ease, border-color 200ms ease;

    &::before,
    .pp-btn-arrow {
      transition: none;
    }

    &:active {
      transform: none;
    }
  }
`;

const ArrowGlyph = () => (
  <svg width="14" height="9" viewBox="0 0 14 9" fill="none" aria-hidden="true">
    <path
      d="M0.5 4.5h12M9 1l3.5 3.5L9 8"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PremiumButton({
  children,
  variant = 'glass',
  size = 'md',
  arrow = false,
  block = false,
  ...rest
}) {
  return (
    <Root type="button" $variant={variant} $size={size} $block={block} {...rest}>
      <span className="pp-btn-label">{children}</span>
      {arrow && (
        <span className="pp-btn-arrow">
          <ArrowGlyph />
        </span>
      )}
    </Root>
  );
}

export { Root as PremiumButtonRoot };
