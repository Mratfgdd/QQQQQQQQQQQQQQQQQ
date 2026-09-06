import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import {
  CatalogPage,
  CatalogContent,
  CatalogTopMeta,
  CatalogHeading,
  HeartGlyph,
  CartGlyph
} from '../components/CatalogLayout';
import { GhostButton } from './Favorites';
import { useCatalog } from '../data/catalogStore';
import { useShop, selectIsFavorite } from '../state/shopStore';
import { media, TOUCH_TARGET } from '../utils/responsive';

/**
 * Сторінка «Кошик».
 *
 * Фон, шапка та типографіка — ті самі, що в каталозі (CatalogLayout.jsx),
 * тому сторінка виглядає рідною. У сторі лежать лише { id, qty }; назва,
 * фото й ціна беруться з categoriesData.js та productsData.js.
 *
 * Суми не зберігаються ніде: subtotal і total рахуються на кожному
 * рендері з поточного стану, тому оновлюються миттєво після +, − чи
 * видалення й не можуть розійтися з даними.
 */

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;

  ${media.tablet} {
    grid-template-columns: 1fr;
  }
`;

const Lines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Line = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;

  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 14px;
  box-sizing: border-box;

  .photo {
    width: 120px;
    height: 96px;
    border-radius: 14px;
    background-image: url(${props => props.bg});
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
  }

  .info {
    min-width: 0;

    .category {
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.45);
    }

    h3 {
      font-family: 'Times New Roman', serif;
      font-size: 21px;
      font-weight: 400;
      color: #ffffff;
      margin: 4px 0 6px 0;
      line-height: 1.2;
    }

    .price {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.65);
    }
  }

  .actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .subtotal {
    font-size: 16px;
    color: #ffffff;
    white-space: nowrap;
  }

  /* ── ТЕЛЕФОН: фото зверху ліворуч, керування — окремим рядком ── */
  ${media.mobile} {
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 14px;
    padding: 12px;

    .photo {
      width: 92px;
      height: 92px;
    }

    .info h3 {
      font-size: 18px;
    }

    .actions {
      grid-column: 1 / -1;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 10px;
      width: 100%;
    }

    /* Сума тримається ліворуч, а якщо рядок не влазить (320px) —
       елементи переносяться, а не вилазять за екран */
    .subtotal {
      margin-right: auto;
    }
  }
`;

const QtyControl = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 3px;

  button {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    font-family: inherit;
    font-size: 17px;
    line-height: 1;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.25s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.16);
    }

    &:disabled {
      opacity: 0.35;
      cursor: default;
    }
  }

  .value {
    min-width: 30px;
    text-align: center;
    font-size: 14px;
    color: #ffffff;
  }

  ${media.mobile} {
    button {
      width: ${TOUCH_TARGET};
      height: ${TOUCH_TARGET};
      font-size: 19px;
    }

    .value {
      min-width: 34px;
      font-size: 15px;
    }
  }
`;

const IconButton = styled.button`
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  svg {
    width: 16px;
    height: 16px;
    fill: ${props => (props.$active ? 'var(--pp-accent)' : 'none')};
    stroke: ${props => (props.$active ? 'var(--pp-accent)' : 'rgba(255, 255, 255, 0.75)')};
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.06);
  }

  ${media.mobile} {
    width: ${TOUCH_TARGET};
    height: ${TOUCH_TARGET};
  }
`;

const Summary = styled.aside`
  background: rgba(86, 68, 52, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 22px;
  box-sizing: border-box;
  position: sticky;
  top: 24px;

  h3 {
    font-family: 'Times New Roman', serif;
    font-size: 22px;
    font-weight: 400;
    color: #ffffff;
    margin: 0 0 18px 0;
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 10px;

    span:last-child {
      color: #ffffff;
      white-space: nowrap;
    }
  }

  .total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
    margin-top: 16px;
    padding-top: 16px;

    span:first-child {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.75);
    }

    span:last-child {
      font-family: 'Times New Roman', serif;
      font-size: 26px;
      color: #ffffff;
      white-space: nowrap;
    }
  }

  button {
    width: 100%;
    justify-content: center;
    margin-top: 20px;
  }

  ${media.tablet} {
    position: static;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px 80px 20px;

  .glyph {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;

    svg {
      width: 26px;
      height: 26px;
      stroke: var(--pp-accent);
      fill: none;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  h2 {
    font-family: 'Times New Roman', serif;
    font-size: 28px;
    font-weight: 400;
    color: #ffffff;
    margin: 0 0 12px 0;
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.6);
    max-width: 42ch;
    margin: 0 0 28px 0;
  }

  ${media.mobile} {
    padding: 40px 12px 60px 12px;

    h2 { font-size: 23px; }
    p { font-size: 13.5px; }
  }
`;

const formatPrice = value => `${Math.round(value).toLocaleString('uk-UA')} грн`;

function CartLine({ item }) {
  const product = useCatalog(state => state.productIndex)[item.id];
  const priceInfo = useCatalog(state => state.products)[item.id] || {};
  const changeQty = useShop(state => state.changeQty);
  const removeFromCart = useShop(state => state.removeFromCart);
  const toggleFavorite = useShop(state => state.toggleFavorite);
  const favorite = useShop(selectIsFavorite(item.id));

  const price = priceInfo.pricePerM2 || 0;

  if (!product) return null;

  return (
    <Line bg={product.image}>
      <div className="photo" />

      <div className="info">
        <span className="category">{product.categoryTitle}</span>
        <h3>{product.titleLines.join(' ')}</h3>
        <span className="price">
          {formatPrice(price)} / {product.unit}
        </span>
      </div>

      <div className="actions">
        <QtyControl>
          <button
            type="button"
            onClick={() => changeQty(item.id, -1)}
            disabled={item.qty <= 1}
            aria-label="Зменшити кількість"
          >
            −
          </button>
          <span className="value">{item.qty}</span>
          <button type="button" onClick={() => changeQty(item.id, 1)} aria-label="Збільшити кількість">
            +
          </button>
        </QtyControl>

        <span className="subtotal">{formatPrice(price * item.qty)}</span>

        <IconButton
          type="button"
          $active={favorite}
          onClick={() => toggleFavorite(item.id)}
          aria-label={favorite ? 'Видалити з обраного' : 'Додати до обраного'}
          title={favorite ? 'В обраному' : 'До обраного'}
        >
          <HeartGlyph filled={favorite} />
        </IconButton>

        <IconButton
          type="button"
          onClick={() => removeFromCart(item.id)}
          aria-label="Видалити товар"
          title="Видалити"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" />
          </svg>
        </IconButton>
      </div>
    </Line>
  );
}

export default function Cart() {
  const history = useHistory();
  const cart = useShop(state => state.cart);
  const productIndex = useCatalog(state => state.productIndex);
  const priceIndex = useCatalog(state => state.products);

  const items = cart.filter(item => productIndex[item.id]);

  const total = items.reduce(
    (sum, item) => sum + ((priceIndex[item.id] || {}).pricePerM2 || 0) * item.qty,
    0
  );

  const units = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CatalogPage $scrollable>
      <Header />
      <CatalogContent $scrollable>

        <CatalogTopMeta>
          <CatalogHeading>
            <div className="breadcrumbs">
              <span onClick={() => history.push('/')}>Головна</span> &gt; <span>Кошик</span>
            </div>
            <h1>Кошик</h1>
            <p>
              {items.length > 0
                ? `${items.length} позиц${items.length === 1 ? 'ія' : items.length < 5 ? 'ії' : 'ій'} · ${units} од.`
                : 'Тут з’являться товари, які ви додали до замовлення.'}
            </p>
          </CatalogHeading>
        </CatalogTopMeta>

        {items.length > 0 ? (
          <Layout>
            <Lines>
              {items.map(item => (
                <CartLine key={item.id} item={item} />
              ))}
            </Lines>

            <Summary>
              <h3>Разом</h3>

              {items.map(item => {
                const product = productIndex[item.id];
                const price = (priceIndex[item.id] || {}).pricePerM2 || 0;

                return (
                  <div className="row" key={item.id}>
                    <span>
                      {product.titleLines.join(' ')} × {item.qty}
                    </span>
                    <span>{formatPrice(price * item.qty)}</span>
                  </div>
                );
              })}

              <div className="total">
                <span>До сплати</span>
                <span>{formatPrice(total)}</span>
              </div>

              <GhostButton onClick={() => history.push('/checkout')}>
                Оформити замовлення <span>→</span>
              </GhostButton>
            </Summary>
          </Layout>
        ) : (
          <EmptyState>
            <div className="glyph">
              <CartGlyph />
            </div>
            <h2>Ваш кошик порожній</h2>
            <p>Додайте товари, які вам сподобалися, щоб оформити замовлення.</p>
            <GhostButton onClick={() => history.push('/catalog')}>
              Перейти до каталогу <span>→</span>
            </GhostButton>
          </EmptyState>
        )}
      </CatalogContent>
    </CatalogPage>
  );
}
