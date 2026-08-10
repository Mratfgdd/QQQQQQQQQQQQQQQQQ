import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard, {
  CatalogPage,
  CatalogContent,
  CatalogTopMeta,
  CatalogHeading,
  ProductsGrid,
  HeartGlyph
} from '../components/CatalogLayout';
import { useCatalog } from '../data/catalogStore';
import { useShop } from '../state/shopStore';
import { media } from '../utils/responsive';

/**
 * Сторінка «Обране».
 *
 * Власного дизайну не має навмисно: це та сама розкладка й ті самі картки,
 * що й у каталозі (CatalogLayout.jsx). У сторі лежать лише id, а картка
 * товару підтягується з categoriesData.js — тому тут ніколи не з'явиться
 * застаріла копія даних.
 */

const EmptyState = styled.div`
  flex: 1;
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

export const GhostButton = styled.button`
  background: var(--pp-accent);
  color: #ffffff;
  border: 1px solid transparent;
  padding: 13px 30px;
  border-radius: 24px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.04em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s, transform 0.2s;

  &:hover {
    background: var(--pp-accent-strong);
    transform: translateY(-1px);
  }

  ${media.tablet} {
    min-height: 44px;
  }
`;

export default function Favorites() {
  const history = useHistory();
  const favorites = useShop(state => state.favorites);
  const productIndex = useCatalog(state => state.productIndex);

  /* id, яких уже немає в каталозі, просто не показуємо */
  const products = favorites.map(id => productIndex[id]).filter(Boolean);

  return (
    <CatalogPage $scrollable>
      <Header />
      <CatalogContent $scrollable>

        <CatalogTopMeta>
          <CatalogHeading>
            <div className="breadcrumbs">
              <span onClick={() => history.push('/')}>Головна</span> &gt; <span>Обране</span>
            </div>
            <h1>Обране</h1>
            <p>
              {products.length > 0
                ? `У вашому списку ${products.length} ${
                    products.length === 1 ? 'товар' : products.length < 5 ? 'товари' : 'товарів'
                  }.`
                : 'Тут збираються товари, які ви позначили серцем.'}
            </p>
          </CatalogHeading>
        </CatalogTopMeta>

        {products.length > 0 ? (
          <ProductsGrid $scrollable>
            {products.map(product => (
              <ProductCard key={product.detailId} product={product} scrollable />
            ))}
          </ProductsGrid>
        ) : (
          <EmptyState>
            <div className="glyph">
              <HeartGlyph />
            </div>
            <h2>Ви ще не додали жодного товару до обраного</h2>
            <p>
              Натисніть на серце на будь-якій картці товару — і він з'явиться тут,
              навіть після перезавантаження сторінки.
            </p>
            <GhostButton onClick={() => history.push('/catalog')}>
              Переглянути каталог <span>→</span>
            </GhostButton>
          </EmptyState>
        )}
      </CatalogContent>
    </CatalogPage>
  );
}
