import "./styles.css";

import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import "./i18n/i18n";

import App from "./App";

/**
 * Точка входу.
 *
 * Тут лишилося тільки те, що стосується браузера: ініціалізація Sentry
 * і монтування застосунку. Сам App живе в src/App.jsx — так його можна
 * імпортувати в тестах, не запускаючи побічних ефектів цього файлу.
 */

Sentry.init({
  dsn: "https://e46328c24ae04fc895282fd9209b286d@o363032.ingest.sentry.io/5420965"
});

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
