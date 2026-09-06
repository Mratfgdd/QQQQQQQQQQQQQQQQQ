/**
 * Кореневий компонент застосунку.
 *
 * Винесений з index.js окремим файлом свідомо: index.js тепер відповідає
 * лише за монтування в DOM та ініціалізацію Sentry, а сам App можна
 * імпортувати — зокрема в автотестах маршрутизації (src/__tests__), які
 * перевіряють, що адреса будь-якої категорії відкриває сторінку, а не
 * порожній екран. Розмітка й маршрути при переїзді не змінювались.
 */

import React, { Suspense, useEffect } from "react";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation
} from "react-router-dom";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import theme from "./utils/theme";

// Імпорт нових сторінок магазину
import StoreHome from "./store/pages/Home";
import StoreCatalog from "./store/pages/Catalog";
import StoreCollection from "./store/pages/Collection";
import StoreProduct from "./store/pages/ProductDetail";
import StoreFavorites from "./store/pages/Favorites";
import StoreCart from "./store/pages/Cart";
import StoreCheckout from "./store/pages/Checkout";
import StoreDelivery from "./store/pages/Delivery";
import StoreNotFound from "./store/pages/NotFound";
import Toast from "./store/components/Toast";
import IntroOverlay from "./store/components/IntroOverlay";
import AdminApp from "./store/admin/AdminApp";
import { loadCatalog, useCatalog } from "./store/data/catalogStore";
import { useShop } from "./store/state/shopStore";

// Твої існуючі 3D сторінки (Lazy-load)
const Hall = React.lazy(() => import("./pages/hall"));

/* ================= ДИНАМІЧНИЙ КЛАС ДЛЯ КЕРУВАННЯ СКРОЛОМ ================= */
const GlobalScrollManager = createGlobalStyle`
  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
  }

  /* Якщо ми на сторінці 3D — жорстко затискаємо екран */
  body.body-3d-mode, html.body-3d-mode, #root.body-3d-mode {
    height: 100vh !important;
    max-height: 100vh !important;
    overflow: hidden !important;
    position: fixed !important;
    top: 0;
    left: 0;
  }

  /* Якщо ми в магазині — даємо повну свободу скролу */
  body.body-store-mode, html.body-store-mode, #root.body-store-mode {
    min-height: 100vh !important;
    height: auto !important;
    max-height: none !important;
    position: relative !important;
  }

  /* Скрол-портом документа має бути ТІЛЬКИ html.
     Якщо overflow-y: auto стоїть ще й на body та #root, вони стають власними
     скрол-контейнерами — і position: sticky всередині них перестає залипати
     (саме через це на телефоні «від'їжджала» відео-секція на головній). */
  html.body-store-mode {
    overflow-y: auto !important;
  }

  body.body-store-mode, #root.body-store-mode {
    overflow-y: visible !important;
  }
`;

// ВИПРАВЛЕНО: Звичайна правильна функція-компонент React
function ScrollController() {
  const location = useLocation();

  useEffect(() => {
    const is3D = location.pathname.includes('/hall');
    
    const rootEl = document.getElementById('root');

    if (is3D) {
      // Вмикаємо режим 3D
      document.documentElement.classList.add('body-3d-mode');
      document.body.classList.add('body-3d-mode');
      if (rootEl) rootEl.classList.add('body-3d-mode');

      document.documentElement.classList.remove('body-store-mode');
      document.body.classList.remove('body-store-mode');
      if (rootEl) rootEl.classList.remove('body-store-mode');
    } else {
      // Вмикаємо режим магазину зі скролом
      document.documentElement.classList.add('body-store-mode');
      document.body.classList.add('body-store-mode');
      if (rootEl) rootEl.classList.add('body-store-mode');

      document.documentElement.classList.remove('body-3d-mode');
      document.body.classList.remove('body-3d-mode');
      if (rootEl) rootEl.classList.remove('body-3d-mode');
    }
  }, [location]);

  return null;
}

/* Одноразове завантаження каталогу з бекенда.
   Поки відповіді немає — сайт живе на статичних даних, тож нічого не
   блимає й не ламається, якщо бекенд не запущено. */
function CatalogLoader() {
  useEffect(() => {
    let cancelled = false;

    loadCatalog().then(() => {
      if (cancelled) return;
      const index = useCatalog.getState().productIndex;
      /* Товари, які адміністратор видалив, прибираємо з кошика й обраного */
      useShop.getState().pruneMissing(id => Boolean(index[id]));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalScrollManager />
      <Router>
        <ScrollController /> {/* Тепер React його чітко бачить */}
        <CatalogLoader />
        <Suspense fallback={<div style={{ color: '#fff', padding: 20 }}>Завантаження...</div>}>
          <Switch>
            <Route exact path="/" component={StoreHome} />

            {/* Галерея колекції — окрема сторінка, не каталог.
                Сюди веде «Переглянути колекцію» з головної. Товарів,
                цін і кошика тут немає взагалі, тому маршрут навмисно
                не перетинається з /parquet. */}
            <Route exact path="/collection" component={StoreCollection} />

            {/* /catalog — псевдонім першої категорії списку: на нього вже
                посилаються футер і мобільне меню. Без параметра сторінка
                сама бере order[0] зі стору, тому «перша категорія» теж
                визначається базою, а не кодом. */}
            <Route exact path="/catalog" component={StoreCatalog} />

            <Route exact path="/product/:productId" component={StoreProduct} />

            {/* Обране й кошик: стан спільний (store/state/shopStore.js),
                тому сторінки завжди показують те саме, що й лічильники в шапці */}
            <Route exact path="/favorites" component={StoreFavorites} />
            <Route exact path="/cart" component={StoreCart} />
            <Route exact path="/checkout" component={StoreCheckout} />
            <Route exact path="/delivery" component={StoreDelivery} />
            {/* Адмін-панель. Реальний захист — на бекенді: без валідної
                HttpOnly-сесії кожен /api/admin/* віддає 401. Тут лише
                показуємо форму входу замість вмісту. */}
            <Route path="/admin" component={AdminApp} />

            <Route path="/hall" render={(props) => <Hall {...props} />} />

            {/* ── ДИНАМІЧНИЙ МАРШРУТ КАТЕГОРІЇ ──
                Один рядок обслуговує будь-яку кількість категорій:
                /parquet, /laminate і так само /ak чи /any-new-slug,
                створений в адмін-панелі. Стоїть ПІСЛЯ всіх службових
                маршрутів, тому /cart, /admin, /hall тощо перехоплюються
                раніше й ніколи не сприймаються за категорію.

                Саме відсутність цього маршруту й давала чорний екран:
                адреси нових категорій не було в переліку, Switch не
                знаходив збігу і не малював взагалі нічого. */}
            <Route exact path="/:categorySlug" component={StoreCatalog} />

            {/* Останній рубіж: будь-яка інша адреса отримує 404-сторінку,
                а не порожній екран */}
            <Route component={StoreNotFound} />
          </Switch>
        </Suspense>

        {/* Сповіщення «Додано до кошика / до обраного» — одне на весь сайт */}
        <Toast />

        {/* Вступна заставка. Малюється ПОВЕРХ уже змонтованого сайту
            (position: fixed), тому нічого не блокує й не зсуває: поки
            грає анімація, сторінка під нею встигає завантажитись.
            Показується один раз на сесію вкладки. */}
        <IntroOverlay />
      </Router>
    </ThemeProvider>
  );
}

export default App;
