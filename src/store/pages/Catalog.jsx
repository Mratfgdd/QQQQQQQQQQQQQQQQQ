import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard, {
  CatalogPage,
  CatalogContent,
  CatalogTopMeta,
  CatalogHeading,
  ProductsGrid,
  SortDropdown
} from '../components/CatalogLayout';
import { useCatalog } from '../data/catalogStore';
import { DEFAULT_SORT, isValidSort, sortProducts } from '../utils/sorting';

/**
 * Універсальний шаблон сторінки категорії.
 *
 * ОДНА сторінка обслуговує БУДЬ-ЯКУ кількість категорій. Slug приходить
 * прямо з маршруту (`/:categorySlug` у src/index.js), тому категорія,
 * створена в адмін-панелі, відкривається без жодної правки коду: адмінка
 * пише в базу → /api/categories віддає її разом із товарами → catalogStore
 * кладе її в стор → цей компонент її малює.
 *
 * ЧОМУ ЦЕ ВАЖЛИВО. Раніше маршрути чотирьох категорій були перелічені
 * вручну в роутері, і адреса нової категорії не збігалася з жодним
 * <Route>. React Router не малював нічого — звідси й порожній (чорний)
 * екран замість товарів.
 *
 * Три стани сторінки:
 *   • категорія знайдена            → звичайний каталог;
 *   • каталог ще вантажиться        → скелетон (НЕ «не знайдено»!);
 *   • бекенд відповів, slug чужий   → ввічливе «категорію не знайдено».
 */

/* Кольори тут світлі, а не з палітри --pp-text: сторінка каталогу лежить
   на затемненому фото (CatalogPage), і темний текст теми на ньому був би
   майже невидимий. */
const StateBox = styled.div`
  padding: 60px 0 100px 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.72);

  h2 {
    font-family: 'Times New Roman', serif;
    font-size: 30px;
    font-weight: 400;
    color: #ffffff;
    margin: 0 0 12px 0;
  }

  p {
    font-size: 15px;
    line-height: 1.6;
    margin: 0 auto 26px auto;
    max-width: 440px;
  }

  button {
    appearance: none;
    background: none;
    border: 1px solid var(--pp-accent);
    color: var(--pp-accent);
    font-family: inherit;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 14px 30px;
    border-radius: 999px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: var(--pp-accent);
      color: #ffffff;
    }
  }
`;

/* Скелетон замість порожнечі. Геометрія й скляна підкладка — рівно як у
   справжньої картки товару (Card у CatalogLayout), тому після завантаження
   сітка не «стрибає», а перехід виглядає як прояв, а не як підміна. */
const SkeletonCard = styled.div`
  min-height: 450px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background-color: rgba(255, 255, 255, 0.05);
  background-image: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0) 35%,
    rgba(255, 255, 255, 0.09) 50%,
    rgba(255, 255, 255, 0) 65%
  );
  background-size: 300% 100%;
  animation: pp-catalog-shimmer 1.5s ease-in-out infinite;

  @keyframes pp-catalog-shimmer {
    from { background-position: 150% 0; }
    to { background-position: -150% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export default function Catalog({ category }) {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();

  const categories = useCatalog(state => state.categories);
  const order = useCatalog(state => state.order);
  const priceIndex = useCatalog(state => state.products);
  const status = useCatalog(state => state.status);

  /* Пріоритет: явно передана категорія (маршрут-псевдонім /catalog) →
     slug з адреси → перша категорія списку. Жодного захардкодженого
     'parquet': перша категорія теж приходить із бази. */
  const slug = category || params.categorySlug || order[0];

  const data = categories[slug];

  /* Вибране сортування живе в URL (?sort=price-asc): посилання можна
     переслати, а кнопка «назад» повертає попередній порядок. */
  const sort = useMemo(() => {
    const requested = new URLSearchParams(location.search).get('sort');
    return isValidSort(requested) ? requested : DEFAULT_SORT;
  }, [location.search]);

  const changeSort = useCallback(
    key => {
      const search = new URLSearchParams(location.search);

      if (key === DEFAULT_SORT) {
        search.delete('sort');
      } else {
        search.set('sort', key);
      }

      const query = search.toString();
      /* replace, а не push: історія не засмічується кожним вибором */
      history.replace(location.pathname + (query ? `?${query}` : ''));
    },
    [history, location.pathname, location.search]
  );

  /* Перерахунок лише коли реально змінився список або порядок —
     зайвих сортувань на кожен рендер немає */
  const products = useMemo(
    () => sortProducts((data && data.products) || [], priceIndex, sort),
    [data, priceIndex, sort]
  );

  /* ── Категорії ще немає в сторі ──
     Поки статус 'loading', це нічого не означає: свіжостворена категорія
     фізично не може бути в статичному фолбеку. Показуємо скелетон. */
  if (!data && status === 'loading') {
    return (
      <CatalogPage>
        <Header />
        <CatalogContent>
          <CatalogTopMeta>
            <CatalogHeading>
              <div className="breadcrumbs">
                <span onClick={() => history.push('/')}>Головна</span> &gt; <span>Каталог</span>
              </div>
              <h1>Завантаження…</h1>
              <p>Отримуємо товари категорії.</p>
            </CatalogHeading>
          </CatalogTopMeta>

          <ProductsGrid>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </ProductsGrid>
        </CatalogContent>
      </CatalogPage>
    );
  }

  /* ── Каталог завантажено, а такої категорії справді немає ──
     Раніше тут був мовчазний підмін на «Паркет»: користувач бачив чужі
     товари й не розумів чому. Тепер сторінка чесно про це каже. */
  if (!data) {
    return (
      <CatalogPage>
        <Header />
        <CatalogContent>
          <StateBox>
            <h2>Категорію не знайдено</h2>
            <p>
              Розділу за адресою «/{slug}» не існує. Можливо, його перейменували
              або прибрали з каталогу.
            </p>
            <button type="button" onClick={() => history.push('/')}>
              На головну
            </button>
          </StateBox>
        </CatalogContent>
      </CatalogPage>
    );
  }

  return (
    <CatalogPage>
      <Header />
      <CatalogContent>

        <CatalogTopMeta>
          <CatalogHeading>
            <div className="breadcrumbs">
              <span onClick={() => history.push('/')}>Головна</span> &gt; <span>{data.breadcrumb}</span>
            </div>
            <h1>{data.title}</h1>
            <p>{data.subtitle}</p>
          </CatalogHeading>
          <SortDropdown value={sort} onChange={changeSort} />
        </CatalogTopMeta>

        {products.length > 0 ? (
          <ProductsGrid>
            {products.map(product => (
              <ProductCard key={product.key || product.detailId} product={product} />
            ))}
          </ProductsGrid>
        ) : (
          /* Категорія є, товарів у ній ще немає — теж не привід
             показувати порожній екран */
          <StateBox>
            <h2>Товари готуються</h2>
            <p>У цій категорії поки немає жодного товару. Зазирніть трохи пізніше.</p>
            <button type="button" onClick={() => history.push('/')}>
              До інших категорій
            </button>
          </StateBox>
        )}
      </CatalogContent>
    </CatalogPage>
  );
}
