import create from 'zustand';
import { apiFetch, mediaUrl } from '../api/client';
import {
  CATEGORIES as STATIC_CATEGORIES,
  CATEGORY_ORDER as STATIC_ORDER,
  PRODUCT_INDEX as STATIC_INDEX
} from './categoriesData';
import { PRODUCTS_DATA as STATIC_PRODUCTS } from './productsData';

/**
 * Джерело каталогу для публічного сайту.
 *
 * ЧОМУ ТАК. Сайт уже працював на статичних даних, і ламати його не можна.
 * Тому стор СТАРТУЄ з тих самих статичних даних (перший кадр ідентичний
 * тому, що був), а потім, якщо бекенд відповів, безшовно підміняє їх на
 * дані з бази. Якщо бекенд не запущено — сайт просто працює як раніше,
 * без помилок і порожніх сторінок.
 *
 * Форма даних навмисно збережена один в один (categories / productIndex /
 * products), щоб компоненти каталогу, кошика й обраного не переписувати.
 */

const buildFromApi = payload => {
  const categories = {};
  const order = [];
  const productIndex = {};
  const products = {};

  payload.forEach(category => {
    order.push(category.slug);

    const cards = (category.products || []).map(product => {
      const gallery = (product.images || [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map(image => mediaUrl(image.url));

      const main = (product.images || []).find(image => image.is_main);

      const card = {
        key: product.slug,
        detailId: product.slug,
        image: mediaUrl(main ? main.url : gallery[0] || ''),
        titleLines: [product.title_top, product.title_bottom].filter(Boolean),
        specs: product.specs || [],
        unit: product.unit || 'м²',
        categorySlug: category.slug,
        categoryTitle: category.title,
        inStock: product.in_stock,
        isPopular: product.is_popular,
        /* Поля для сортування каталогу: повна назва, дата появи
           та порядок, заданий адміністратором */
        title: product.title,
        createdAt: product.created_at || '',
        position: product.position || 0
      };

      /* Якщо адміністратор не заповнив дворядковий заголовок —
         показуємо звичайну назву, щоб картка не лишилася порожньою */
      if (!card.titleLines.length) card.titleLines = [product.title];

      productIndex[product.slug] = card;
      products[product.slug] = {
        id: product.slug,
        title: product.title,
        pricePerM2: product.price,
        oldPrice: product.old_price,
        packSqM: product.pack_qty || 1,
        unit: product.unit || 'м²',
        images: gallery,
        description: product.description,
        shortDescription: product.short_description || '',
        specs: product.specs || []
      };

      return card;
    });

    categories[category.slug] = {
      slug: category.slug,
      title: category.title,
      breadcrumb: category.breadcrumb || category.title,
      subtitle: category.subtitle || '',
      /* Прев'ю для картки категорії на головній. Раніше це поле тут
         губилося: воно є і в базі, і у відповіді API, але buildFromApi
         його не переносив, тому змінити фото категорії з адмінки було
         неможливо — головна показувала захардкоджені файли. */
      image: mediaUrl(category.image || ''),
      products: cards
    };
  });

  return { categories, order, productIndex, products };
};

export const useCatalog = create(set => ({
  /* Стартова точка — рівно ті дані, з якими сайт жив досі */
  categories: STATIC_CATEGORIES,
  order: STATIC_ORDER,
  productIndex: STATIC_INDEX,
  products: STATIC_PRODUCTS,
  source: 'static',
  loaded: false,

  /**
   * Стан завантаження каталогу з бекенда.
   *
   *   'loading' — відповіді ще немає, показуємо статичний фолбек;
   *   'ready'   — каталог прийшов із бази, у сторі повний список категорій;
   *   'error'   — бекенд недоступний, живемо на статиці.
   *
   * Це потрібно сторінці категорії: поки статус 'loading', вона НЕ має
   * права сказати «категорію не знайдено» — категорії, доданої в адмінці,
   * у статичному фолбеку немає за визначенням.
   */
  status: 'loading',

  applyApiCatalog: payload =>
    set(
      Object.assign(buildFromApi(payload), {
        source: 'api',
        loaded: true,
        status: 'ready'
      })
    ),

  markCatalogFailed: () => set({ status: 'error' })
}));

/** Підтягує каталог. Помилка мережі не критична — лишаємось на статиці. */
export async function loadCatalog() {
  try {
    /* no-store: інакше браузер може віддати відповідь із кешу
       і сайт покаже стару ціну одразу після збереження в адмінці */
    const categories = await apiFetch('/api/categories', { cache: 'no-store' });
    if (Array.isArray(categories) && categories.length) {
      useCatalog.getState().applyApiCatalog(categories);
    } else {
      /* Бекенд відповів, але каталог порожній — далі чекати немає чого */
      useCatalog.getState().markCatalogFailed();
    }
  } catch (error) {
    /* Бекенд не піднято — лишаємося на статичних даних */
    useCatalog.getState().markCatalogFailed();
  }
}

/* Читання поза React (наприклад, із shopStore) */
export const getCategoryData = slug => {
  const state = useCatalog.getState();
  return state.categories[slug] || state.categories[state.order[0]];
};

export const getProductCardData = id => useCatalog.getState().productIndex[id] || null;

export const getProductData = id => useCatalog.getState().products[id] || null;

export default useCatalog;
