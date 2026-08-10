import React from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard, {
  CatalogPage,
  CatalogContent,
  CatalogTopMeta,
  CatalogHeading,
  ProductsGrid,
  SortSelect
} from '../components/CatalogLayout';
import { useCatalog } from '../data/catalogStore';

/**
 * Універсальний шаблон сторінки категорії.
 *
 * Верстка й картка живуть у CatalogLayout.jsx — їх же використовують
 * «Обране» та «Кошик», тому дизайн гарантовано один на всі сторінки.
 * Різниця між категоріями тільки в даних із categoriesData.js.
 *
 *   <Catalog category="parquet" />        → /parquet і /catalog
 *   <Catalog category="parquet-board" />  → /parquet-board
 *   <Catalog category="laminate" />       → /laminate
 *   <Catalog category="accessories" />    → /accessories
 */
export default function Catalog({ category = 'parquet' }) {
  const history = useHistory();
  /* Дані приходять з бекенда; поки він не відповів — статичний фолбек */
  const categories = useCatalog(state => state.categories);
  const data = categories[category] || categories.parquet;

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
          <SortSelect>Сортування: Популярні <span>▼</span></SortSelect>
        </CatalogTopMeta>

        <ProductsGrid>
          {data.products.map(product => (
            <ProductCard key={product.key} product={product} />
          ))}
        </ProductsGrid>
      </CatalogContent>
    </CatalogPage>
  );
}
