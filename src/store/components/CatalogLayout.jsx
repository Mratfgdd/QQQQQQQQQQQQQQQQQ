import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useCatalog } from '../data/catalogStore';
import { useShop, selectIsFavorite, selectCartQty } from '../state/shopStore';
import { SORT_OPTIONS, getSortLabel } from '../utils/sorting';
import { media } from '../utils/responsive';

/**
 * Спільна розкладка каталогу та картка товару.
 *
 * Усі styled-components нижче перенесені зі сторінки «Паркет» БЕЗ ЗМІН —
 * фон, розміри, border-radius, відступи, типографіка, hover і всі
 * медіазапити ті самі. Винесені сюди тільки для того, щоб «Каталог»,
 * «Обране» та «Кошик» використовували одну й ту саму картку, а не три
 * схожі копії.
 *
 * Нового в картці лише два контроли: ❤️ у кутку фото та «В кошик» поруч
 * із «Детальніше». Обидва працюють через спільний стан у shopStore.
 */

export const CatalogPage = styled.div`
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)),
              url('/catalog-hero.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  height: 100vh;
  width: 100vw;
  color: #ffffff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* Сторінки зі списком змінної довжини (обране, кошик) мають рости,
     а не обрізатися по висоті екрана */
  ${props =>
    props.$scrollable &&
    `
    height: auto;
    min-height: 100vh;
    overflow: visible;
  `}

  ${media.tablet} {
    height: auto;
    min-height: 100vh;
    width: 100%;
    max-width: 100%;
    overflow: visible;
    background-attachment: scroll;
  }
`;

export const CatalogContent = styled.div`
  flex: 1;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 40px 30px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${props => props.$scrollable && 'justify-content: flex-start; padding-bottom: 60px;'}

  ${media.tablet} {
    flex: none;
    justify-content: flex-start;
    padding: 24px 32px 48px 32px;
  }

  @media (max-width: 768px) {
    padding: 20px 20px 40px 20px;
  }

  ${media.smallMobile} {
    padding: 16px 16px 32px 16px;
  }
`;

export const CatalogTopMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  width: 100%;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-bottom: 18px;
  }
`;

export const CatalogHeading = styled.div`
  min-width: 0;

  .breadcrumbs {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 4px;
    span { cursor: pointer; &:hover { color: #fff; } }
  }

  h1 {
    font-family: 'Times New Roman', serif;
    font-size: 38px;
    font-weight: 400;
    margin: 0 0 6px 0;
    letter-spacing: 0.5px;
  }

  p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    max-width: 600px;
    line-height: 1.4;
    margin: 0;
  }

  ${media.tablet} {
    h1 { font-size: 32px; }
  }

  ${media.mobile} {
    h1 { font-size: 27px; }
    p { font-size: 12.5px; max-width: 100%; }
  }

  ${media.smallMobile} {
    h1 { font-size: 23px; }
  }
`;

export const SortSelect = styled.button`
  /* Стиль тригера НЕ змінювався — це той самий вигляд, що був у каталозі.
     Додані тільки appearance/font, бо тепер це <button>, і position:relative
     як якір для випадної панелі. */
  appearance: none;
  font-family: inherit;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color 0.3s;
  white-space: nowrap;

  &:hover,
  &[aria-expanded='true'] {
    border-color: rgba(255, 255, 255, 0.5);
  }

  .chevron {
    font-size: 10px;
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &[aria-expanded='true'] .chevron {
    transform: rotate(180deg);
  }

  ${media.mobile} {
    width: 100%;
    min-height: 44px;
    padding: 10px 18px;
    justify-content: space-between;
    font-size: 13px;
    box-sizing: border-box;
  }
`;

/* Обгортка потрібна, щоб панель позиціонувалась відносно кнопки */
const SortAnchor = styled.div`
  position: relative;
  flex-shrink: 0;

  ${media.mobile} {
    width: 100%;
  }
`;

const SortMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 40;
  min-width: 240px;
  padding: 6px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(28, 22, 18, 0.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.42);
  box-sizing: border-box;

  /* М'яка поява без різкого стрибка */
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition: opacity 0.24s ease, transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);

  &[data-open='true'] {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  /* Телефон: меню на всю ширину кнопки, нічого не вилазить за екран */
  ${media.mobile} {
    left: 0;
    right: 0;
    min-width: 0;
    width: 100%;
  }
`;

const SortOption = styled.button`
  appearance: none;
  width: 100%;
  border: none;
  background: ${props => (props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  color: ${props => (props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.72)')};
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  padding: 11px 12px;
  border-radius: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  transition: background-color 0.2s ease, color 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }

  .tick {
    color: var(--pp-accent);
    font-size: 12px;
    opacity: ${props => (props.$active ? 1 : 0)};
  }

  ${media.mobile} {
    min-height: 44px;
    font-size: 14px;
  }
`;

export const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  flex: 1;
  max-height: calc(100vh - 180px);

  /* На сторінках зі змінною кількістю карток стелю знімаємо */
  ${props => props.$scrollable && 'flex: none; max-height: none;'}

  ${media.tablet} {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    flex: none;
    max-height: none;
  }

  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: 18px;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 450px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  }

  ${props => props.$scrollable && 'height: auto; min-height: 420px;'}

  ${media.tablet} {
    height: auto;
    min-height: 0;
    border-radius: 20px;

    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
`;

const CardImageArea = styled.div`
  position: relative; /* єдина правка: якір для кнопки ❤️ */
  flex: 1;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%),
              url(${props => props.bg});
  background-size: cover;
  background-position: center;
  padding: 24px;
  display: flex;
  align-items: flex-end;
  box-sizing: border-box;

  h2 {
    font-family: 'Times New Roman', serif;
    font-size: 32px;
    font-weight: 400;
    color: #ffffff;
    margin: 0;
    line-height: 1.1;
  }

  ${media.tablet} {
    flex: 0 0 auto;
    height: 240px;
    padding: 20px;

    h2 { font-size: 28px; }
  }

  ${media.mobile} {
    height: 220px;
  }

  ${media.smallMobile} {
    height: 180px;
    padding: 16px;

    h2 { font-size: 25px; }
  }
`;

/* ❤️ у кутку фото. Не перекриває назву — вона внизу зліва. */
const FavoriteButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease,
    background-color 0.28s ease;

  svg {
    width: 18px;
    height: 18px;
    stroke: ${props => (props.$active ? 'var(--pp-accent)' : 'rgba(255, 255, 255, 0.85)')};
    fill: ${props => (props.$active ? 'var(--pp-accent)' : 'none')};
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: fill 0.28s ease, stroke 0.28s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    transform: scale(${props => (props.$active ? 1.08 : 1)});
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.45);
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.94);
  }

  ${media.smallMobile} {
    top: 12px;
    right: 12px;
    width: 38px;
    height: 38px;
  }
`;

const CardInfoArea = styled.div`
  background: rgba(86, 68, 52, 0.75);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  gap: 18px;

  ${media.mobile} {
    padding: 18px 18px 20px 18px;
    gap: 16px;
  }

  ${media.smallMobile} {
    padding: 16px 14px 18px 14px;
  }
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 10px;

  ${media.smallMobile} {
    gap: 12px 8px;
  }
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  .icon-wrapper {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: rgba(255, 255, 255, 0.7);
      stroke-width: 1.5;
    }
  }

  .text {
    display: flex;
    flex-direction: column;

    span:first-child {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
    }
    span:last-child {
      font-size: 13px;
      font-weight: 400;
      color: #ffffff;
      margin-top: 1px;
    }
  }

  ${media.smallMobile} {
    gap: 7px;

    .icon-wrapper {
      width: 28px;
      height: 28px;
    }

    .text span:last-child {
      font-size: 12.5px;
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;

  ${media.smallMobile} {
    gap: 8px;
  }
`;

const DetailButton = styled.button`
  background: rgba(135, 110, 86, 0.6);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex: 1;
  min-width: 0;
  padding: 11px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 400;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  transition: background 0.3s, border-color 0.3s;

  &:hover {
    background: rgba(135, 110, 86, 0.9);
    border-color: rgba(255, 255, 255, 0.3);
  }

  ${media.tablet} {
    min-height: 44px;
    padding: 12px;
    font-size: 14px;
  }

  ${media.smallMobile} {
    font-size: 12.5px;
  }
`;

/* Той самий силует, що й «Детальніше», лише акцентна заливка */
const CartButton = styled(DetailButton)`
  flex: 0 0 auto;
  padding: 11px 18px;
  background: ${props =>
    props.$inCart ? 'rgba(255, 255, 255, 0.12)' : 'var(--pp-accent)'};
  border-color: ${props =>
    props.$inCart ? 'rgba(255, 255, 255, 0.28)' : 'transparent'};

  svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: #ffffff;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    background: ${props =>
      props.$inCart ? 'rgba(255, 255, 255, 0.18)' : 'var(--pp-accent-strong)'};
    border-color: ${props =>
      props.$inCart ? 'rgba(255, 255, 255, 0.4)' : 'transparent'};
  }

  ${media.smallMobile} {
    padding: 11px 14px;
  }
`;

export const HeartGlyph = ({ filled }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 20.5s-7.5-4.7-7.5-10a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8c0 5.3-7.5 10-7.5 10z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </svg>
);

export const CartGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
    <path d="M2.5 3h2l2.4 11.2a1.8 1.8 0 0 0 1.8 1.4h8.6a1.8 1.8 0 0 0 1.8-1.4L20.6 8H5.2" />
  </svg>
);

/* Іконки характеристик — спільні для всіх сторінок */
const TreeIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2L3 17h6v5h6v-5h6L12 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const SortIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const JointIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M6 9h12M6 15h12M9 6v12M15 6v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const PolishIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18M5 5l14 14M19 5L5 14" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const LayersIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 3 3 7.5 12 12l9-4.5L12 3zM3 12l9 4.5L21 12M3 16.5 12 21l9-4.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 3l7 3v5.5c0 4.2-3 7.7-7 8.5-4-.8-7-4.3-7-8.5V6l7-3z" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const RulerIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M3 15 15 3l6 6L9 21l-6-6zM7 13l2 2M10 10l2 2M13 7l2 2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const DropIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 10.5A6 6 0 0 1 6 13.5C6 9.5 12 3 12 3z" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const BrushIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M9 14 4 19a2 2 0 1 0 3 3l5-5M13 11l7-7 3 3-7 7-3-3z" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

export const ICONS = {
  tree: TreeIcon,
  sort: SortIcon,
  joint: JointIcon,
  polish: PolishIcon,
  layers: LayersIcon,
  shield: ShieldIcon,
  ruler: RulerIcon,
  drop: DropIcon,
  brush: BrushIcon
};

/**
 * Випадне меню сортування.
 *
 * Тригер виглядає рівно так, як виглядала стара кнопка «Сортування:
 * Популярні» — змінилася лише поведінка. Меню закривається кліком поза
 * ним і клавішею Escape, тому на телефоні його легко прибрати.
 */
export function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const anchor = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointer = event => {
      if (anchor.current && !anchor.current.contains(event.target)) setOpen(false);
    };
    const onKey = event => {
      if (event.key === 'Escape' || event.key === 'Esc') setOpen(false);
    };

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <SortAnchor ref={anchor}>
      <SortSelect
        type="button"
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        Сортування: {getSortLabel(value)} <span className="chevron">▼</span>
      </SortSelect>

      <SortMenu data-open={open} role="listbox" aria-label="Сортування товарів">
        {SORT_OPTIONS.map(option => (
          <SortOption
            key={option.key}
            type="button"
            role="option"
            aria-selected={option.key === value}
            $active={option.key === value}
            onClick={() => {
              onChange(option.key);
              setOpen(false);
            }}
          >
            {option.label}
            <span className="tick">✓</span>
          </SortOption>
        ))}
      </SortMenu>
    </SortAnchor>
  );
}

/**
 * Картка товару. `product` — запис із categoriesData.js
 * (див. PRODUCT_INDEX), тому дані про товар не дублюються.
 */
export default function ProductCard({ product, scrollable = false }) {
  const history = useHistory();
  const id = product.detailId;

  const favorite = useShop(selectIsFavorite(id));
  const cartQty = useShop(selectCartQty(id));
  const toggleFavorite = useShop(state => state.toggleFavorite);
  const addToCart = useShop(state => state.addToCart);

  const price = (useCatalog(state => state.products)[id] || {}).pricePerM2;

  return (
    <Card $scrollable={scrollable}>
      <CardImageArea bg={product.image}>
        <FavoriteButton
          type="button"
          $active={favorite}
          onClick={() => toggleFavorite(id)}
          aria-pressed={favorite}
          aria-label={favorite ? 'Видалити з обраного' : 'Додати до обраного'}
          title={favorite ? 'В обраному' : 'Додати до обраного'}
        >
          <HeartGlyph filled={favorite} />
        </FavoriteButton>

        <h2>
          {product.titleLines.map((line, index) => (
            <React.Fragment key={line}>
              {index > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </h2>
      </CardImageArea>

      <CardInfoArea>
        <SpecsGrid>
          {product.specs.map(spec => {
            const Icon = ICONS[spec.icon] || TreeIcon;

            return (
              <SpecItem key={spec.label}>
                <div className="icon-wrapper"><Icon /></div>
                <div className="text">
                  <span>{spec.label}</span>
                  <span>{spec.value}</span>
                </div>
              </SpecItem>
            );
          })}
        </SpecsGrid>

        <ButtonRow>
          <DetailButton onClick={() => history.push(`/product/${id}`)}>
            Детальніше <span>→</span>
          </DetailButton>
          <CartButton
            $inCart={cartQty > 0}
            onClick={() => addToCart(id)}
            title={price ? `${price.toLocaleString('uk-UA')} грн / ${product.unit || 'м²'}` : ''}
            aria-label="Додати в кошик"
          >
            <CartGlyph />
            {cartQty > 0 ? `У кошику · ${cartQty}` : 'В кошик'}
          </CartButton>
        </ButtonRow>
      </CardInfoArea>
    </Card>
  );
}
