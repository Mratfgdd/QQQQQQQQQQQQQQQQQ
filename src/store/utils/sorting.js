/**
 * Єдина логіка сортування каталогу.
 *
 * Один модуль на всі чотири категорії: сторінка категорії просто передає
 * сюди свій список карток і ключ сортування. Дублювання коду для «Паркету»,
 * «Паркетної дошки», «Ламінату» та «Аксесуарів» немає — вони всі рендеряться
 * тим самим Catalog.jsx, який викликає sortProducts().
 *
 * Сортування локальне: товари вже завантажені в catalogStore, тому зміна
 * порядку не робить жодного запиту до бекенда.
 */

/* Порівняння українських назв. Intl.Collator знає, що «Ґ» іде після «Г»,
   а «Є», «І», «Ї» стоять на своїх місцях — примітивне порівняння рядків
   для кирилиці дало б неправильний порядок. numeric: true додатково
   впорядковує «Дуб 2» перед «Дуб 10». */
const collator = new Intl.Collator('uk-UA', {
  sensitivity: 'base',
  numeric: true,
  ignorePunctuation: true
});

export const SORT_OPTIONS = [
  { key: 'popular', label: 'Популярні' },
  { key: 'new', label: 'Новинки' },
  { key: 'name-asc', label: 'За назвою: А → Я' },
  { key: 'name-desc', label: 'За назвою: Я → А' },
  { key: 'price-asc', label: 'Ціна: від дешевших' },
  { key: 'price-desc', label: 'Ціна: від дорожчих' }
];

export const DEFAULT_SORT = 'popular';

export const isValidSort = key => SORT_OPTIONS.some(option => option.key === key);

export const getSortLabel = key =>
  (SORT_OPTIONS.find(option => option.key === key) || SORT_OPTIONS[0]).label;

/** Назва товару: повна, якщо є, інакше збираємо з рядків картки */
const titleOf = product =>
  product.title || (product.titleLines || []).join(' ') || product.detailId || '';

/**
 * Ціна товару числом.
 *
 * Ціна лежить не в картці, а в індексі товарів (priceIndex), і вже є
 * числом. Але дані можуть прийти й у вигляді «3 850 грн» — тоді
 * витягуємо число, прибравши пробіли (зокрема нерозривні) та кому.
 * Якщо ціни немає взагалі — повертаємо null, такі товари підуть у кінець.
 */
const priceOf = (product, priceIndex) => {
  const raw = (priceIndex[product.detailId] || {}).pricePerM2;

  if (typeof raw === 'number' && isFinite(raw)) return raw;

  if (typeof raw === 'string') {
    const digits = raw.replace(/[\s  ]/g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const parsed = parseFloat(digits);
    return isFinite(parsed) ? parsed : null;
  }

  return null;
};

/* Товари без ціни завжди в кінці — і за зростанням, і за спаданням */
const byPrice = (a, b, priceIndex, direction) => {
  const first = priceOf(a, priceIndex);
  const second = priceOf(b, priceIndex);

  if (first === null && second === null) return 0;
  if (first === null) return 1;
  if (second === null) return -1;

  return (first - second) * direction;
};

const byPosition = (a, b) => (a.position || 0) - (b.position || 0);

const COMPARATORS = {
  popular: (a, b) => {
    /* Спершу позначені як популярні, далі — порядок з адмін-панелі */
    const first = a.isPopular ? 0 : 1;
    const second = b.isPopular ? 0 : 1;
    return first !== second ? first - second : byPosition(a, b);
  },

  new: (a, b) => {
    /* Дата додається бекендом; на статичному фолбеку її немає,
       тому там усе чесно падає до порядку адміністратора */
    const first = Date.parse(a.createdAt || '') || 0;
    const second = Date.parse(b.createdAt || '') || 0;
    return second !== first ? second - first : byPosition(a, b);
  },

  'name-asc': (a, b) => collator.compare(titleOf(a), titleOf(b)),
  'name-desc': (a, b) => collator.compare(titleOf(b), titleOf(a))
};

/**
 * Повертає НОВИЙ відсортований масив — вхідний не мутується,
 * інакше б ми зіпсували порядок у сторі каталогу.
 */
export function sortProducts(products, priceIndex, sortKey) {
  if (!Array.isArray(products) || products.length < 2) {
    return Array.isArray(products) ? products : [];
  }

  const index = priceIndex || {};
  const copy = products.slice();

  if (sortKey === 'price-asc') return copy.sort((a, b) => byPrice(a, b, index, 1));
  if (sortKey === 'price-desc') return copy.sort((a, b) => byPrice(a, b, index, -1));

  const comparator = COMPARATORS[sortKey] || COMPARATORS[DEFAULT_SORT];
  return copy.sort(comparator);
}

export default sortProducts;
