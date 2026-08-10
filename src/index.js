import "./styles.css";

import React, { Suspense, useEffect } from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import "./i18n/i18n";

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
import StoreProduct from "./store/pages/ProductDetail";
import StoreFavorites from "./store/pages/Favorites";
import StoreCart from "./store/pages/Cart";
import Toast from "./store/components/Toast";
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

            {/* Чотири категорії — одна й та сама сторінка-шаблон із різними даними.
                /catalog лишаємо як псевдонім паркету: на нього вже посилаються
                футер і мобільне меню. */}
            <Route exact path="/catalog" render={() => <StoreCatalog category="parquet" />} />
            <Route exact path="/parquet" render={() => <StoreCatalog category="parquet" />} />
            <Route
              exact
              path="/parquet-board"
              render={() => <StoreCatalog category="parquet-board" />}
            />
            <Route exact path="/laminate" render={() => <StoreCatalog category="laminate" />} />
            <Route
              exact
              path="/accessories"
              render={() => <StoreCatalog category="accessories" />}
            />

            <Route exact path="/product/:productId" component={StoreProduct} />

            {/* Обране й кошик: стан спільний (store/state/shopStore.js),
                тому сторінки завжди показують те саме, що й лічильники в шапці */}
            <Route exact path="/favorites" component={StoreFavorites} />
            <Route exact path="/cart" component={StoreCart} />
            {/* Адмін-панель. Реальний захист — на бекенді: без валідної
                HttpOnly-сесії кожен /api/admin/* віддає 401. Тут лише
                показуємо форму входу замість вмісту. */}
            <Route path="/admin" component={AdminApp} />

            <Route path="/hall" render={(props) => <Hall {...props} />} />
          </Switch>
        </Suspense>

        {/* Сповіщення «Додано до кошика / до обраного» — одне на весь сайт */}
        <Toast />
      </Router>
    </ThemeProvider>
  );
}

Sentry.init({
  dsn: "https://e46328c24ae04fc895282fd9209b286d@o363032.ingest.sentry.io/5420965"
});

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);