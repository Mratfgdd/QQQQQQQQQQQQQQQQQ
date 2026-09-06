import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useShop, selectFavoritesCount, selectCartCount } from '../state/shopStore';
import { media } from '../utils/responsive';

/**
 * Кнопки «Обране» і «Кошик» для шапки.
 *
 * Стилі перенесені ОДИН В ОДИН із головної сторінки (styled-компонент
 * CartIcon у components/Header.jsx) — сюди їх винесено тільки для того,
 * щоб шапка головної та шапка сторінки товару використовували одну й ту
 * саму реалізацію, а не дві схожі копії. Вигляд на головній не змінився.
 *
 * Логіка кошика тут не живе: кількість береться з того самого
 * shopStore, а клік веде на ті самі маршрути /favorites і /cart.
 * Додавання, видалення, підрахунок і localStorage — усе лишилося там,
 * де було.
 */

export const HeaderActionButton = styled.div`
  position: relative; /* якір для лічильника */
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.9;
  transition: transform 0.2s;

  svg {
    stroke: #ffffff;
    fill: none;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    transform: scale(1.05);
    opacity: 1;
  }

  /* Маленький бейдж із кількістю. З'являється лише коли є що рахувати. */
  .badge {
    position: absolute;
    top: -6px;
    right: -8px;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    border-radius: 999px;
    background-color: var(--pp-accent);
    color: #ffffff;
    font-size: 10.5px;
    font-weight: 600;
    line-height: 17px;
    text-align: center;
    box-sizing: border-box;
    pointer-events: none;
  }

  /* Збільшуємо зону натискання під палець */
  ${media.tablet} {
    width: 44px;
    height: 44px;
    justify-content: center;
    flex-shrink: 0;

    .badge {
      top: 2px;
      right: 0;
    }
  }

  /* Телефон: у шапці тепер три контроли — трохи стискаємо */
  ${media.mobile} {
    width: 38px;
    height: 38px;

    svg {
      width: 21px;
      height: 21px;
    }
  }
`;

const HeartGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path d="M12 20.5s-7.5-4.7-7.5-10a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8c0 5.3-7.5 10-7.5 10z" />
  </svg>
);

const CartGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

export function FavoritesButton() {
  const history = useHistory();
  const count = useShop(selectFavoritesCount);

  return (
    <HeaderActionButton
      onClick={() => history.push('/favorites')}
      role="button"
      tabIndex={0}
      aria-label={`Обране${count ? `: ${count}` : ''}`}
      title="Обране"
    >
      <HeartGlyph />
      {count > 0 && <span className="badge">{count}</span>}
    </HeaderActionButton>
  );
}

export function CartButton() {
  const history = useHistory();
  const count = useShop(selectCartCount);

  return (
    <HeaderActionButton
      onClick={() => history.push('/cart')}
      role="button"
      tabIndex={0}
      aria-label={`Кошик${count ? `: ${count}` : ''}`}
      title="Кошик"
    >
      <CartGlyph />
      {count > 0 && <span className="badge">{count}</span>}
    </HeaderActionButton>
  );
}
