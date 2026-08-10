/**
 * Єдині breakpoint-и для 2D-частини сайту (магазин Parket Planet).
 *
 * Значення узгоджені з уже існуючими breakpoint-ами проєкту
 * (див. `theme.breakpoints` у src/utils/theme.js): tablet = 768px, laptop = 1024px.
 *
 * Свідомо тримаємо мінімальний набір точок, щоб не плодити хаотичні breakpoint-и:
 *
 *   > 1024px          — десктоп / ноутбук (існуючий дизайн, НЕ змінюється)
 *   768px – 1024px    — планшет (проміжний layout, мобільна навігація)
 *   < 768px           — телефон
 *   < 480px           — маленький телефон
 *
 * 3D-частина (/hall) має власну мобільну реалізацію і цих правил не використовує.
 */
export const BREAKPOINTS = {
  smallMobile: 480,
  mobile: 768,
  tablet: 1024,
  wide: 1200
};

export const media = {
  /* <= 1200px — вузький десктоп */
  belowWide: `@media (max-width: ${BREAKPOINTS.wide}px)`,
  /* <= 1024px — планшет і менше: тут вмикається мобільна навігація */
  tablet: `@media (max-width: ${BREAKPOINTS.tablet}px)`,
  /* <= 768px — телефон */
  mobile: `@media (max-width: ${BREAKPOINTS.mobile}px)`,
  /* <= 480px — маленький телефон */
  smallMobile: `@media (max-width: ${BREAKPOINTS.smallMobile}px)`,
  /* >= 1025px — тільки десктоп */
  desktopOnly: `@media (min-width: ${BREAKPOINTS.tablet + 1}px)`
};

/* Мінімальний зручний touch-target (рекомендація 44px) */
export const TOUCH_TARGET = '44px';

export default media;
