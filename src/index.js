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
    overflow-y: auto !important;
    position: relative !important;
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalScrollManager />
      <Router>
        <ScrollController /> {/* Тепер React його чітко бачить */}
        <Suspense fallback={<div style={{ color: '#fff', padding: 20 }}>Завантаження...</div>}>
          <Switch>
            <Route exact path="/" component={StoreHome} />
            <Route exact path="/catalog" component={StoreCatalog} />
            <Route exact path="/product/:id" component={StoreProduct} />
            <Route path="/hall" render={(props) => <Hall {...props} />} />
          </Switch> 
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

Sentry.init({
  dsn: "https://e46328c24ae04fc895282fd9209b286d@o363032.ingest.sentry.io/5420965"
});

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);