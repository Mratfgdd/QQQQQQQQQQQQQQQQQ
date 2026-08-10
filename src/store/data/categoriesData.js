/**
 * Дані чотирьох категорій магазину.
 *
 * Сторінка категорії одна на всіх — src/store/pages/Catalog.jsx. Вона нічого
 * не знає про конкретну категорію й просто малює те, що лежить тут, тому
 * дизайн, розміри, анімації та мобільна поведінка гарантовано однакові.
 * Щоб додати категорію або товар, достатньо дописати запис у цей файл.
 *
 * slug — це і ключ, і маршрут: /parquet, /parquet-board, /laminate, /accessories.
 *
 * icon у характеристиці — ім'я з мапи ICONS у Catalog.jsx.
 * detailId — ключ у PRODUCTS_DATA, куди веде кнопка «Детальніше».
 */

export const CATEGORIES = {
  /* ── ПАРКЕТ ──
     Контент один в один як був до появи шаблону: фото, товари,
     характеристики та посилання не змінювалися. */
  parquet: {
    slug: 'parquet',
    title: 'Паркет',
    breadcrumb: 'Паркет',
    subtitle: 'Натуральний паркет преміум якості. Європейське дерево.',
    products: [
      {
        key: 'oak',
        detailId: 'oak',
        image: '/cat-dub.jpg',
        titleLines: ['Паркет', 'Дуб'],
        specs: [
          { icon: 'tree', label: 'Порода дерева', value: 'Дуб' },
          { icon: 'sort', label: 'Сортування', value: 'Рустік / Селект' },
          { icon: 'joint', label: "Тип з'єднання", value: 'Шип-паз' },
          { icon: 'polish', label: 'Покриття', value: 'Олія / Лак' }
        ]
      },
      {
        key: 'ash',
        detailId: 'ash',
        image: '/cat-yasen.jpg',
        titleLines: ['Паркет', 'Ясен'],
        specs: [
          { icon: 'tree', label: 'Порода дерева', value: 'Ясен' },
          { icon: 'sort', label: 'Сортування', value: 'Селект' },
          { icon: 'joint', label: "Тип з'єднання", value: 'Шип-паз' },
          { icon: 'polish', label: 'Покриття', value: 'Олія / Лак' }
        ]
      },
      {
        key: 'hornbeam',
        detailId: 'hornbeam',
        image: '/cat-grab.jpg',
        titleLines: ['Паркет', 'Граб'],
        specs: [
          { icon: 'tree', label: 'Порода дерева', value: 'Граб' },
          { icon: 'sort', label: 'Сортування', value: 'Селект' },
          { icon: 'joint', label: "Тип з'єднання", value: 'Шип-паз' },
          { icon: 'polish', label: 'Покриття', value: 'Олія / Лак' }
        ]
      }
    ]
  },

  /* ── ПАРКЕТНА ДОШКА ── */
  'parquet-board': {
    slug: 'parquet-board',
    title: 'Паркетна дошка',
    breadcrumb: 'Паркетна дошка',
    subtitle: 'Багатошарова дошка з натуральним шпоном. Стабільна геометрія та швидкий монтаж.',
    products: [
      {
        key: 'board-oak-natur',
        detailId: 'board-oak-natur',
        image: '/parket_dos1.png',
        titleLines: ['Паркетна дошка', 'Дуб Натур'],
        specs: [
          { icon: 'tree', label: 'Порода дерева', value: 'Дуб' },
          { icon: 'layers', label: 'Конструкція', value: 'Тришарова' },
          { icon: 'joint', label: "Тип з'єднання", value: 'Замок Click' },
          { icon: 'polish', label: 'Покриття', value: 'УФ-лак' }
        ]
      },
      {
        key: 'board-oak-rustic',
        detailId: 'board-oak-rustic',
        image: '/parket_dos2.jpg',
        titleLines: ['Паркетна дошка', 'Дуб Рустік'],
        specs: [
          { icon: 'tree', label: 'Порода дерева', value: 'Дуб' },
          { icon: 'layers', label: 'Конструкція', value: 'Двошарова' },
          { icon: 'ruler', label: 'Товщина шпону', value: '4 мм' },
          { icon: 'polish', label: 'Покриття', value: 'Олія-віск' }
        ]
      },
      {
        key: 'board-ash-select',
        detailId: 'board-ash-select',
        image: '/parket_dos3.png',
        titleLines: ['Паркетна дошка', 'Ясен Селект'],
        specs: [
          { icon: 'tree', label: 'Порода дерева', value: 'Ясен' },
          { icon: 'layers', label: 'Конструкція', value: 'Тришарова' },
          { icon: 'joint', label: "Тип з'єднання", value: 'Замок Click' },
          { icon: 'polish', label: 'Покриття', value: 'Матовий лак' }
        ]
      }
    ]
  },

  /* ── ЛАМІНАТ ── */
  laminate: {
    slug: 'laminate',
    title: 'Ламінат',
    breadcrumb: 'Ламінат',
    subtitle: 'Ламінат преміум класу. Висока зносостійкість і реалістична текстура дерева.',
    products: [
      {
        key: 'laminate-siena',
        detailId: 'laminate-siena',
        image: '/lamin1.jpg',
        titleLines: ['Ламінат', 'Дуб Сієна'],
        specs: [
          { icon: 'shield', label: 'Клас зносостійкості', value: '33' },
          { icon: 'ruler', label: 'Товщина', value: '8 мм' },
          { icon: 'joint', label: "Тип з'єднання", value: 'Замок Click' },
          { icon: 'polish', label: 'Фаска', value: '4V' }
        ]
      },
      {
        key: 'laminate-nord',
        detailId: 'laminate-nord',
        image: '/lamin2.jpg',
        titleLines: ['Ламінат', 'Дуб Норд'],
        specs: [
          { icon: 'shield', label: 'Клас зносостійкості', value: '32' },
          { icon: 'ruler', label: 'Товщина', value: '8 мм' },
          { icon: 'joint', label: "Тип з'єднання", value: 'Замок Click' },
          { icon: 'polish', label: 'Поверхня', value: 'Тиснення в реєстр' }
        ]
      },
      {
        key: 'laminate-milano',
        detailId: 'laminate-milano',
        image: '/lamin3.jpg',
        titleLines: ['Ламінат', 'Горіх Мілано'],
        specs: [
          { icon: 'shield', label: 'Клас зносостійкості', value: '33' },
          { icon: 'ruler', label: 'Товщина', value: '10 мм' },
          { icon: 'drop', label: 'Вологостійкість', value: 'AquaStop' },
          { icon: 'joint', label: "Тип з'єднання", value: 'Замок Click' }
        ]
      }
    ]
  },

  /* ── АКСЕСУАРИ ── */
  accessories: {
    slug: 'accessories',
    title: 'Аксесуари',
    breadcrumb: 'Аксесуари',
    subtitle: 'Плінтуси, підкладка та засоби догляду — усе для монтажу й довгого життя підлоги.',
    products: [
      {
        key: 'skirting-oak',
        detailId: 'skirting-oak',
        unit: 'м.п.',
        image: '/aks1.png',
        titleLines: ['Плінтус', 'Дубовий'],
        specs: [
          { icon: 'tree', label: 'Матеріал', value: 'Масив дуба' },
          { icon: 'ruler', label: 'Висота', value: '80 мм' },
          { icon: 'joint', label: 'Кріплення', value: 'Приховані кліпси' },
          { icon: 'polish', label: 'Покриття', value: 'Лак / Олія' }
        ]
      },
      {
        key: 'care-oil',
        detailId: 'care-oil',
        unit: 'л',
        image: '/aks2.jpg',
        titleLines: ['Засіб догляду', 'Олія-віск'],
        specs: [
          { icon: 'brush', label: 'Призначення', value: 'Догляд і оновлення' },
          { icon: 'drop', label: "Об'єм", value: '1 л' },
          { icon: 'ruler', label: 'Витрата', value: '~25 м² / л' },
          { icon: 'polish', label: 'Основа', value: 'Натуральні олії' }
        ]
      },
      {
        key: 'underlay-pine',
        detailId: 'underlay-pine',
        image: '/aks3.jpg',
        titleLines: ['Підкладка', 'Хвойна'],
        specs: [
          { icon: 'layers', label: 'Матеріал', value: 'Хвойна плита' },
          { icon: 'ruler', label: 'Товщина', value: '5 мм' },
          { icon: 'shield', label: 'Шумоізоляція', value: 'до 21 дБ' },
          { icon: 'joint', label: 'Формат', value: '790 × 590 мм' }
        ]
      }
    ]
  }
};

/* Порядок карток на головній сторінці */
export const CATEGORY_ORDER = ['parquet', 'parquet-board', 'laminate', 'accessories'];

export const getCategory = slug => CATEGORIES[slug] || CATEGORIES.parquet;

/**
 * Плоский індекс товарів за detailId.
 *
 * Обране й кошик зберігають лише id, а всю картку товару беруть звідси —
 * тому дані про товар існують в одному екземплярі, без дублювання.
 */
export const PRODUCT_INDEX = {};

CATEGORY_ORDER.forEach(slug => {
  CATEGORIES[slug].products.forEach(product => {
    PRODUCT_INDEX[product.detailId] = Object.assign({}, product, {
      categorySlug: slug,
      categoryTitle: CATEGORIES[slug].title,
      /* Одиниця виміру ціни: у більшості товарів це м², у плінтуса — метр
         погонний, у засобу догляду — літр */
      unit: product.unit || 'м²'
    });
  });
});

export const getProductCard = id => PRODUCT_INDEX[id] || null;

export default CATEGORIES;
