import create from 'zustand';


/**
 * Спільний стан магазину: обране, кошик і тост.
 *
 * Взято zustand, бо він уже є в проєкті (src/state/Store.js) — нової
 * бібліотеки не додано. Стан один на весь застосунок, тому Header, картки,
 * сторінка товару, «Обране» та «Кошик» завжди бачать однакові дані.
 *
 * ЗБЕРІГАЄМО ТІЛЬКИ ID. Обране — це масив id товарів, кошик — масив
 * { id, qty }. Уся інформація про товар (фото, назва, характеристики, ціна)
 * лишається там, де й була: у categoriesData.js та productsData.js. Тому
 * зміна опису чи ціни автоматично підхоплюється, а дублікатів даних немає.
 *
 * Обидва списки переживають перезавантаження: читаються з localStorage при
 * старті модуля й пишуться назад при кожній зміні (див. subscribe нижче).
 */

const FAVORITES_KEY = 'pp-favorites';
const CART_KEY = 'pp-cart';

const readList = key => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    /* приватний режим або зіпсований JSON — починаємо з порожнього */
    return [];
  }
};

const writeList = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* не змогли зберегти — стан усе одно живий у пам'яті */
  }
};

/* На старті лише нормалізуємо форму. Відсіювання неіснуючих товарів
   робить pruneMissing() — уже після того, як каталог приїхав з бекенда. */
const initialFavorites = readList(FAVORITES_KEY).filter(id => typeof id === 'string');

const initialCart = readList(CART_KEY)
  .filter(item => item && typeof item.id === 'string')
  .map(item => ({ id: item.id, qty: Math.max(1, parseInt(item.qty, 10) || 1) }));

let toastCounter = 0;

export const useShop = create(set => ({
  favorites: initialFavorites,
  cart: initialCart,
  toast: null,

  toggleFavorite: id =>
    set(state => {
      const active = state.favorites.indexOf(id) !== -1;

      return {
        favorites: active
          ? state.favorites.filter(item => item !== id)
          : state.favorites.concat(id),
        toast: {
          id: (toastCounter += 1),
          message: active ? 'Видалено з обраного' : 'Додано до обраного'
        }
      };
    }),

  /* Повторне додавання не створює другий рядок — росте кількість */
  addToCart: (id, qty = 1) =>
    set(state => {
      const existing = state.cart.find(item => item.id === id);

      return {
        cart: existing
          ? state.cart.map(item =>
              item.id === id ? { id: item.id, qty: item.qty + qty } : item
            )
          : state.cart.concat({ id, qty }),
        toast: {
          id: (toastCounter += 1),
          message: existing ? 'Кількість оновлено' : 'Додано до кошика'
        }
      };
    }),

  changeQty: (id, delta) =>
    set(state => ({
      cart: state.cart.map(item =>
        item.id === id ? { id: item.id, qty: Math.max(1, item.qty + delta) } : item
      )
    })),

  removeFromCart: id =>
    set(state => ({
      cart: state.cart.filter(item => item.id !== id),
      toast: { id: (toastCounter += 1), message: 'Товар видалено з кошика' }
    })),

  clearCart: () => set({ cart: [] }),

  /* Викликається після завантаження каталогу: прибирає товари,
     яких адміністратор уже видалив із бази */
  pruneMissing: exists =>
    set(state => ({
      favorites: state.favorites.filter(exists),
      cart: state.cart.filter(item => exists(item.id))
    })),

  showToast: message => set({ toast: { id: (toastCounter += 1), message } }),

  hideToast: () => set({ toast: null })
}));

/* ── Селектори ──
   Компоненти підписуються на конкретне значення, тому Header не
   перемальовується, коли міняється, наприклад, тост. */
export const selectFavoritesCount = state => state.favorites.length;

export const selectCartCount = state =>
  state.cart.reduce((total, item) => total + item.qty, 0);

export const selectIsFavorite = id => state => state.favorites.indexOf(id) !== -1;

export const selectCartQty = id => state => {
  const item = state.cart.find(entry => entry.id === id);
  return item ? item.qty : 0;
};

/* ── Збереження ──
   Окремі підписки із селекторами: пишемо у localStorage лише тоді,
   коли реально змінився відповідний список. */
useShop.subscribe(
  favorites => writeList(FAVORITES_KEY, favorites),
  state => state.favorites
);

useShop.subscribe(cart => writeList(CART_KEY, cart), state => state.cart);

export default useShop;
