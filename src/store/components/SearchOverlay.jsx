import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { useHistory } from 'react-router-dom';
import { useCatalog } from '../data/catalogStore';
import { media, TOUCH_TARGET } from '../utils/responsive';

/**
 * Пошук по каталогу — один на весь сайт.
 *
 * Джерело даних — той самий catalogStore, з якого живуть каталог, кошик
 * і обране. Тобто окремої «системи пошуку» тут не з'явилося: шукаємо
 * рівно по тих товарах і категоріях, які вже завантажені з /api/categories
 * (а якщо бекенд не піднято — по статичному фолбеку). Свого запиту до
 * мережі компонент не робить, тому працює однаково швидко й офлайн.
 *
 * Один і той самий оверлей використовується і на десктопі, і на телефоні —
 * різниця лише в CSS.
 *
 * Керування: Esc або клік по фону закривають, ↑/↓ ходять по списку,
 * Enter відкриває виділений результат.
 */

/* Скільки результатів показуємо максимум */
const LIMIT = 8;

/* Поки оверлей відкритий, сторінка під ним не скролиться.
   Селектор продубльований навмисно — так специфічність перебиває
   глобальний `overflow-y: auto !important` із src/index.js. */
const ScrollLock = createGlobalStyle`
  html.body-store-mode.body-store-mode {
    overflow: hidden !important;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  background: rgba(14, 11, 8, 0.82);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: clamp(60px, 12vh, 140px) 20px 40px 20px;
  box-sizing: border-box;
  overflow-y: auto;
  animation: ${fadeIn} 240ms ease;
  -webkit-tap-highlight-color: transparent;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  ${media.mobile} {
    /* На телефоні панель починається одразу під шапкою й займає екран */
    padding: 14px 14px 24px 14px;
    align-items: stretch;
  }
`;

const Panel = styled.div`
  width: 100%;
  max-width: 660px;
  background: rgba(28, 22, 18, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  box-sizing: border-box;
  animation: ${slideDown} 300ms cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  max-height: 100%;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  ${media.mobile} {
    border-radius: 16px;
    max-width: 100%;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    stroke: rgba(255, 255, 255, 0.5);
    fill: none;
    stroke-width: 1.7;
    stroke-linecap: round;
  }

  input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: #ffffff;
    font-family: inherit;
    font-size: 17px;
    padding: 6px 0;

    &::placeholder {
      color: rgba(255, 255, 255, 0.38);
    }

    ${media.mobile} {
      /* 16px+ — щоб iOS не масштабував сторінку при фокусі */
      font-size: 16px;
      min-height: ${TOUCH_TARGET};
    }
  }

  .close {
    appearance: none;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.75);
    font-family: inherit;
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 8px 12px;
    border-radius: 999px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.25s ease, color 0.25s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
    }

    ${media.mobile} {
      min-height: 38px;
    }
  }
`;

const Results = styled.div`
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  max-height: min(58vh, 460px);

  ${media.mobile} {
    max-height: none;
    flex: 1;
  }
`;

const GroupTitle = styled.div`
  font-size: 10.5px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.36);
  padding: 14px 18px 6px 18px;
`;

const Hit = styled.button`
  appearance: none;
  width: 100%;
  border: none;
  /* background задаємо явно: інакше <button> отримає світле системне тло */
  background: ${props => (props.$active ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
  color: inherit;
  font-family: inherit;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 18px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .thumb {
    width: 46px;
    height: 46px;
    border-radius: 10px;
    flex-shrink: 0;
    background-color: rgba(255, 255, 255, 0.07);
    background-size: cover;
    background-position: center;
  }

  .text {
    min-width: 0;
    flex: 1;

    .name {
      display: block;
      font-size: 14.5px;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meta {
      display: block;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.45);
      margin-top: 2px;
    }
  }

  .price {
    font-size: 13.5px;
    color: var(--pp-accent);
    white-space: nowrap;
    flex-shrink: 0;
  }

  ${media.mobile} {
    min-height: 60px;
  }
`;

const Hint = styled.div`
  padding: 26px 18px 30px 18px;
  text-align: center;
  font-size: 13.5px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.45);
`;

const SearchGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.2" y1="16.2" x2="21" y2="21" />
  </svg>
);

/* «Дуб Сієна» знайдеться і по «сієна», і по «dub» не знайдеться — це
   нормально: шукаємо простим входженням підрядка без урахування регістру */
const normalize = value => (value || '').toString().trim().toLowerCase();

export default function SearchOverlay({ open, onClose }) {
  const history = useHistory();

  const categories = useCatalog(state => state.categories);
  const order = useCatalog(state => state.order);
  const productIndex = useCatalog(state => state.productIndex);
  const priceIndex = useCatalog(state => state.products);

  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  /* Плаский список того, по чому шукаємо. Перераховується лише коли
     реально змінився каталог, а не на кожне натискання клавіші. */
  const haystack = useMemo(() => {
    const items = [];

    order.forEach(slug => {
      const category = categories[slug];
      if (!category) return;
      items.push({
        kind: 'category',
        id: slug,
        name: category.title,
        meta: 'Категорія',
        image: category.image || '',
        haystack: normalize(`${category.title} ${category.subtitle || ''} ${slug}`),
        path: `/${slug}`
      });
    });

    Object.keys(productIndex).forEach(id => {
      const card = productIndex[id];
      const price = (priceIndex[id] || {}).pricePerM2;
      const name = card.title || (card.titleLines || []).join(' ');

      items.push({
        kind: 'product',
        id,
        name,
        meta: card.categoryTitle || 'Товар',
        image: card.image || '',
        price,
        unit: card.unit || 'м²',
        haystack: normalize(`${name} ${(card.titleLines || []).join(' ')} ${card.categoryTitle || ''} ${id}`),
        path: `/product/${id}`
      });
    });

    return items;
  }, [categories, order, productIndex, priceIndex]);

  const hits = useMemo(() => {
    const needle = normalize(query);
    if (needle.length < 2) return [];

    const scored = haystack
      .filter(item => item.haystack.indexOf(needle) !== -1)
      .map(item => ({
        item,
        /* Збіг на початку назви важливіший за збіг десь усередині,
           а товари показуємо вище за категорії */
        score:
          (normalize(item.name).indexOf(needle) === 0 ? 0 : 10) +
          (item.kind === 'product' ? 0 : 1)
      }));

    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, LIMIT).map(entry => entry.item);
  }, [query, haystack]);

  /* Курсор не має «зависати» за межами нового списку результатів */
  useEffect(() => {
    setCursor(0);
  }, [query]);

  const go = useCallback(
    item => {
      onClose();
      setQuery('');
      history.push(item.path);
    },
    [history, onClose]
  );

  /* Скидаємо запит і ставимо фокус в поле при кожному відкритті */
  useEffect(() => {
    if (!open) return undefined;

    setQuery('');
    setCursor(0);

    /* Невелика затримка — інакше на iOS клавіатура іноді не піднімається */
    const timer = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 60);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = event => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCursor(current => (hits.length ? (current + 1) % hits.length : 0));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCursor(current => (hits.length ? (current - 1 + hits.length) % hits.length : 0));
      } else if (event.key === 'Enter' && hits[cursor]) {
        event.preventDefault();
        go(hits[cursor]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, hits, cursor, go, onClose]);

  if (!open) return null;

  const typed = normalize(query).length >= 2;

  return (
    <React.Fragment>
      <ScrollLock />

      <Backdrop
        role="dialog"
        aria-modal="true"
        aria-label="Пошук по каталогу"
        onClick={event => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <Panel>
          <InputRow>
            <SearchGlyph />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Пошук: паркет, дуб, ламінат…"
              aria-label="Пошуковий запит"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button type="button" className="close" onClick={onClose}>
              Закрити
            </button>
          </InputRow>

          {!typed && (
            <Hint>
              Введіть щонайменше дві літери — назву товару, породу дерева
              або категорію.
            </Hint>
          )}

          {typed && hits.length === 0 && (
            <Hint>За запитом «{query.trim()}» нічого не знайдено.</Hint>
          )}

          {typed && hits.length > 0 && (
            <Results>
              <GroupTitle>
                Знайдено: {hits.length}
                {hits.length === LIMIT ? '+' : ''}
              </GroupTitle>

              {hits.map((item, index) => (
                <Hit
                  key={item.kind + item.id}
                  type="button"
                  $active={index === cursor}
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => go(item)}
                >
                  <span
                    className="thumb"
                    style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                  />
                  <span className="text">
                    <span className="name">{item.name}</span>
                    <span className="meta">{item.meta}</span>
                  </span>
                  {item.kind === 'product' && item.price ? (
                    <span className="price">
                      {Math.round(item.price).toLocaleString('uk-UA')} грн/{item.unit}
                    </span>
                  ) : null}
                </Hit>
              ))}
            </Results>
          )}
        </Panel>
      </Backdrop>
    </React.Fragment>
  );
}
