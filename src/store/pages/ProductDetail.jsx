import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useHistory, useParams } from 'react-router-dom';
import { PRODUCTS_DATA } from '../data/productsData';
import MobileMenu, { HamburgerButton } from '../components/MobileMenu';
import { useCatalog } from '../data/catalogStore';
import { useShop, selectIsFavorite, selectCartQty } from '../state/shopStore';
import { media } from '../utils/responsive';
/* ======================================================
   ВБУДОВАНІ ІКОНКИ (100% сумісність без залежностей)
   ====================================================== */
const IconLeaf = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.2a7 7 0 0 1-9 8.8z"/>
    <path d="M19 2L9 12"/>
  </svg>
);

const IconShieldCheck = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const IconFlame = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const IconAward = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

const IconSearch = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
);

const IconHeart = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const IconShoppingBag = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
    <path d="M3 6h18"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

/* ── Іконки, які є у мобільному референсі (Mobele_version.png).
   На десктопі вони приховані через CSS, тож десктопна верстка
   лишається такою самою, як була. ── */
const IconCart = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="20" r="1.4"/>
    <circle cx="18" cy="20" r="1.4"/>
    <path d="M2 3h2.2l2.4 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H5"/>
  </svg>
);

const IconMapPin = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconPhone = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.05 4.2 2 2 0 0 1 4.04 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.03 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconMail = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconClock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3.2 1.9"/>
  </svg>
);

/* ======================================================
   ГЛОБАЛЬНИЙ СВІТЛИЙ ГРАДІЄНТ (ОРИГІНАЛЬНИЙ ВЕРХНІЙ ГРАДІЄНТ)
   ====================================================== */
const GlobalScrollStyle = createGlobalStyle`
  html, body, #root {
    height: auto !important;
    min-height: 100vh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    margin: 0;
    padding: 0;
    background: linear-gradient(180deg, #1C1815 0%, #2A241E 45%, #3B352E 100%) !important;
    background-attachment: fixed !important;
    color: var(--pp-ink);
  }

  /* ── МОБІЛЬНА ВЕРСІЯ ЗА РЕФЕРЕНСОМ (Mobele_version.png) ──
     У референсі фон сторінки — рівний теплий відтінок #6F675E (заміряно
     піпеткою по лівому полю макета), а не темний градієнт. Усі секції
     лежать на ньому окремими скругленими картками.
     background-attachment: fixed додатково прибираємо — на iOS Safari він
     не підтримується коректно і дає «стрибки» під час скролу. */
  ${media.tablet} {
    html, body, #root {
      background: #6F675E !important;
      background-attachment: scroll !important;
      max-width: 100% !important;
    }
  }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: transparent;
  color: var(--pp-ink);
  display: flex;
  flex-direction: column;
  overflow-y: visible;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
`;

const HeaderContainer = styled.header`
  background: rgba(15, 12, 10, 0.88);
  backdrop-filter: blur(12px);
  padding: 16px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 100;

  /* ── РЕФЕРЕНС: хедер — окрема «плаваюча» темна картка з полями по боках,
     а не суцільна смуга на всю ширину ── */
  ${media.tablet} {
    width: auto;
    margin: 14px 24px 0 24px;
    padding: 9px 14px;
    background: #0A0A0F;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 18px;
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
    top: 10px;
  }

  ${media.mobile} {
    margin: 12px 16px 0 16px;
    padding: 8px 12px;
    border-radius: 16px;
  }

  ${media.smallMobile} {
    margin: 10px 14px 0 14px;
    padding: 8px 10px;
    border-radius: 14px;
  }

  @media (max-width: 360px) {
    margin: 10px 12px 0 12px;
    padding: 7px 9px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  min-width: 0;

  .logo-circle {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    border: 1.5px solid #c5a880;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    &::after {
      content: '';
      width: 10px;
      height: 10px;
      border: 1.5px solid #c5a880;
      border-radius: 50%;
    }
  }

  h1 {
    font-family: 'Times New Roman', serif;
    font-size: 19px;
    font-weight: 400;
    letter-spacing: 2px;
    color: #ffffff;
    margin: 0;
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* ── РЕФЕРЕНС: більший круглий емблем-логотип, а напис «PARKET PLANET»
     розбитий на два рядки. width: min-content робить це надійно — блок
     звужується до найдовшого слова, тож перенос завжди йде по пробілу ── */
  ${media.tablet} {
    gap: 9px;

    .logo-circle {
      width: 34px;
      height: 34px;
      &::after { width: 13px; height: 13px; }
    }

    h1 {
      font-size: 14px;
      line-height: 1.14;
      letter-spacing: 1.6px;
      white-space: normal;
      width: min-content;
    }
  }

  ${media.smallMobile} {
    gap: 8px;

    .logo-circle {
      width: 30px;
      height: 30px;
      &::after { width: 11px; height: 11px; }
    }

    h1 { font-size: 12.5px; letter-spacing: 1.2px; }
  }

  @media (max-width: 360px) {
    .logo-circle { width: 28px; height: 28px; }
    h1 { font-size: 11.5px; letter-spacing: 1px; }
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 28px;
  span {
    color: rgba(255, 255, 255, 0.78);
    font-size: 13px;
    cursor: pointer;
    transition: color 0.2s;
    &:hover { color: #ffffff; }
  }

  /* 6 текстових посилань не вміщуються — переїжджають у мобільне меню */
  ${media.tablet} {
    display: none;
  }
`;

const RightHeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  /* Референс: у шапці стоять пошук, обране, кошик і бургер — рівномірно */
  ${media.tablet} {
    gap: 2px;
  }

  ${media.mobile} {
    gap: 0;
  }
`;

const HeaderIconButton = styled.div`
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  &:hover { color: #ffffff; }

  .cart-badge {
    position: absolute;
    top: -6px;
    right: -8px;
    background: #c5a880;
    color: #000;
    font-size: 9px;
    font-weight: 700;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Референс: усі чотири іконки лишаються у шапці й на телефоні.
     Зона натискання тримається щонайменше 38–40px. */
  ${media.tablet} {
    width: 40px;
    height: 40px;
    flex-shrink: 0;

    .cart-badge { top: 3px; right: 2px; }
  }

  ${media.mobile} {
    width: 36px;
    height: 36px;
  }

  ${media.smallMobile} {
    width: 32px;
    height: 32px;

    .cart-badge {
      top: 1px;
      right: 0;
      width: 13px;
      height: 13px;
      font-size: 8px;
    }
  }

  @media (max-width: 360px) {
    width: 29px;
    height: 29px;
  }
`;

const CallRequestBtn = styled.button`
  background: var(--pp-bg-cream);
  color: var(--pp-ink);
  border: none;
  padding: 10px 22px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  &:hover { background: var(--pp-surface); transform: translateY(-1px); }

  /* У референсі шапка мобільної версії не містить цієї кнопки — її місце
     займає бургер. Сама дія збережена: вона є першим пунктом-CTA
     у мобільному меню. */
  ${media.tablet} {
    display: none;
  }
`;

const MainContainer = styled.main`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 30px 40px 36px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 36px;

  /* ── РЕФЕРЕНС: бічні поля ≈3.5% ширини екрана, вертикальні проміжки між
     картками невеликі. Нижній padding лишається 0 — відступ до наступної
     секції задає LowerContentWrapper, щоб проміжок був рівно один. ── */
  @media (max-width: 1100px) {
    padding: 12px 24px 0 24px;
    gap: 14px;
  }

  ${media.mobile} {
    padding: 12px 16px 0 16px;
    gap: 12px;
  }

  ${media.smallMobile} {
    padding: 10px 14px 0 14px;
    gap: 10px;
  }

  @media (max-width: 360px) {
    padding: 10px 12px 0 12px;
  }
`;

const Breadcrumbs = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);

  span {
    cursor: pointer;
    &:hover { color: #c5a880; }
    &.separator { color: rgba(255, 255, 255, 0.35); cursor: default; }
    &.current { color: rgba(255, 255, 255, 0.95); cursor: default; }
  }

  ${media.tablet} {
    color: rgba(255, 255, 255, 0.72);
    padding: 2px 2px 0 2px;

    span.current { color: #ffffff; }
  }

  ${media.mobile} {
    flex-wrap: wrap;
    gap: 6px;
    font-size: 12px;
    line-height: 1.4;
  }

  ${media.smallMobile} {
    font-size: 11.5px;
  }
`;

const ProductMainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: stretch;
  /* minmax(0, 1fr), а не просто 1fr: скорочення «1fr» означає
     minmax(auto, 1fr), і цей auto-мінімум дозволяє вмісту (широке фото,
     смуга мініатюр) розпирати колонку ширше за екран. */
  @media (max-width: 1100px) { grid-template-columns: minmax(0, 1fr); gap: 20px; }
`;

/* ======================================================
   ГАЛЕРЕЯ
   ====================================================== */
const LeftGalleryWrapper = styled.div`
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const MainImage = styled.img`
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block;
  opacity: 0.92;
  transition: transform 0.4s ease;
`;

const MainImageCard = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1.22 / 1;
  border-radius: 20px;
  overflow: hidden;
  background: #1A1613;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);

  &:hover ${MainImage} {
    transform: scale(1.03);
  }

  /* ── РЕФЕРЕНС: головне фото — широка «панорамна» картка ≈2:1
     (у макеті 800×393), а не квадратна ── */
  ${media.tablet} {
    aspect-ratio: 1.95 / 1;
    border-radius: 20px;

    /* Без hover-зуму на тач-екрані */
    &:hover ${MainImage} {
      transform: none;
    }
  }

  ${media.mobile} {
    aspect-ratio: 1.9 / 1;
    border-radius: 18px;
  }

  ${media.smallMobile} {
    aspect-ratio: 1.8 / 1;
    border-radius: 16px;
  }
`;

const ImageBadgesOverlay = styled.div`
  position: absolute;
  top: 18px;
  left: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2;
  pointer-events: none;

  ${media.tablet} {
    top: 16px;
    left: 16px;
    right: 16px;
    gap: 10px;
  }

  ${media.mobile} {
    top: 12px;
    left: 12px;
    right: 12px;
    gap: 7px;
  }

  ${media.smallMobile} {
    top: 10px;
    left: 10px;
    right: 10px;
    gap: 6px;
  }
`;

const BadgeItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  .badge-label {
    font-size: 12px;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.88);
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  }

  .avatar-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.88);
  }

  /* ── РЕФЕРЕНС: іконки-«кружечки» з теплою золотистою обводкою (заміряно
     #B47A59) і таким самим кольором гліфа.
     Текст лишаємо світлим із м'якою тінню: у макеті під бейджами світле
     фото, а у твоєму реальному /qqq.jpg — темний інтер'єр, тож темний
     текст із макета там був би нечитабельним. ── */
  ${media.tablet} {
    gap: 10px;

    .badge-label {
      font-size: 12.5px;
      line-height: 1.3;
      color: #ffffff;
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.75);
    }

    .avatar-icon {
      width: 26px;
      height: 26px;
      background: rgba(18, 14, 10, 0.42);
      border: 1px solid rgba(197, 168, 128, 0.85);
      color: #E0BE93;

      /* Гліф передається пропом size={11} — на мобільному кружечок більший,
         тож підтягуємо саму іконку через CSS, не чіпаючи десктоп */
      svg { width: 13px; height: 13px; }
    }
  }

  ${media.mobile} {
    gap: 8px;

    .badge-label { font-size: 11.5px; }
    .avatar-icon {
      width: 23px;
      height: 23px;
      svg { width: 12px; height: 12px; }
    }
  }

  ${media.smallMobile} {
    gap: 7px;

    .badge-label { font-size: 10.5px; }
    .avatar-icon { width: 20px; height: 20px; }
  }
`;

const GalleryBottomPanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  background: rgba(22, 18, 14, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 12px 16px;
  box-sizing: border-box;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  /* ── РЕФЕРЕНС: суцільна темна смуга (заміряно #1F1A15) під фото, де в ОДИН
     ряд стоять: стрілка ‹ · мініатюри · пілюля «3D Переглянути в інтер'єрі» ·
     стрілка ›. Ряд мініатюр при нестачі місця скролиться горизонтально,
     тож смуга ніколи не переносить елементи і не розпирає сторінку. ── */
  ${media.tablet} {
    flex-wrap: nowrap;
    gap: 10px;
    padding: 11px 12px;
    background: #1F1A15;
    border-color: rgba(255, 255, 255, 0.07);
    border-radius: 16px;

    /* Скидаємо порядок — усе лишається в природному порядку DOM */
    > * { order: 0; }
  }

  ${media.mobile} {
    gap: 8px;
    padding: 9px 10px;
    border-radius: 14px;
  }

  ${media.smallMobile} {
    gap: 6px;
    padding: 8px 8px;
  }
`;

const SliderArrow = styled.button`
  appearance: none;
  border: none;
  outline: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.4);
  }

  ${media.tablet} {
    width: 34px;
    height: 34px;
    font-size: 17px;
  }

  ${media.mobile} {
    width: 30px;
    height: 30px;
    font-size: 16px;
  }

  ${media.smallMobile} {
    width: 27px;
    height: 27px;
    font-size: 15px;
  }
`;

const ThumbnailsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;

  /* Мініатюри горизонтально скролляться, не ламаючи ширину панелі.
     flex-basis: 0 обов'язковий — інакше власна ширина ряду мініатюр
     виштовхувала б сусідні елементи смуги за межі екрана. */
  ${media.tablet} {
    flex: 1 1 0;
    min-width: 0;
    gap: 9px;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar { display: none; }
  }

  ${media.mobile} {
    gap: 8px;
  }

  ${media.smallMobile} {
    gap: 6px;
  }
`;

const ThumbItem = styled.button`
  appearance: none;
  background: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  border: ${({ active }) => (active ? '2px solid #EAE3DB' : '1.5px solid rgba(255, 255, 255, 0.2)')};
  box-shadow: ${({ active }) => (active ? '0 0 12px rgba(234, 227, 219, 0.3)' : 'none')};
  opacity: ${({ active }) => (active ? '1' : '0.65')};
  transition: all 0.25s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 0.95;
    transform: scale(1.03);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Референс: активна мініатюра — світла рамка з м'яким сяйвом */
  ${media.tablet} {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    scroll-snap-align: start;

    &:hover { transform: none; }
  }

  ${media.mobile} {
    width: 50px;
    height: 50px;
  }

  ${media.smallMobile} {
    width: 44px;
    height: 44px;
    border-radius: 9px;
  }
`;

const VRButtonInGallery = styled.button`
  appearance: none;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 28px;
  padding: 6px 16px 6px 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  transition: all 0.25s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.4);

    .vr-circle {
      border-color: rgba(197, 168, 128, 0.9);
      box-shadow: 0 0 10px rgba(197, 168, 128, 0.3);
    }
  }

  .vr-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 1.5px solid rgba(197, 168, 128, 0.5);
    background: rgba(12, 10, 8, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pp-surface-2);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    transition: all 0.25s ease;
  }

  .vr-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.88);
    font-weight: 400;
    text-align: left;
    white-space: nowrap;
    line-height: 1.25;
  }

  /* ── РЕФЕРЕНС: компактна пілюля праворуч у тій самій смузі, одразу перед
     стрілкою «›». Не стискається, щоб текст не ламався. ── */
  ${media.tablet} {
    flex: 0 0 auto;
    margin-left: 0;
    padding: 5px 14px 5px 5px;
    gap: 8px;
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.06);

    .vr-circle {
      width: 32px;
      height: 32px;
      font-size: 10.5px;
    }

    .vr-label {
      font-size: 11px;
      line-height: 1.2;
    }
  }

  ${media.mobile} {
    padding: 4px 11px 4px 4px;
    gap: 7px;

    .vr-circle { width: 28px; height: 28px; font-size: 10px; }
    .vr-label { font-size: 10px; }
  }

  ${media.smallMobile} {
    padding: 4px 9px 4px 4px;
    gap: 6px;

    .vr-circle { width: 25px; height: 25px; font-size: 9px; }
    .vr-label { font-size: 9px; }
  }
`;

/* ======================================================
   ПРАВА СЕКЦІЯ (КРЕМОВА #F5EFEA)
   ====================================================== */
const RightInfoWrapper = styled.div`
  background: var(--pp-bg-cream);
  color: var(--pp-ink);
  border-radius: 20px;
  padding: 32px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); }

  ${media.mobile} {
    padding: 22px 18px;
    border-radius: 16px;
    gap: 24px;
  }

  ${media.smallMobile} {
    padding: 18px 15px;
  }
`;

const ProductDescriptionBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const HitBadge = styled.div`
  display: inline-block;
  align-self: flex-start;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.05);
  color: #7C6853;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 16px;
`;

const ProductTitle = styled.h1`
  font-size: 36px;
  font-family: 'Times New Roman', Times, serif;
  font-weight: 400;
  color: var(--pp-ink);
  margin: 0 0 6px 0;

  ${media.mobile} {
    font-size: 28px;
  }

  ${media.smallMobile} {
    font-size: 24px;
  }
`;

const ProductSubtitle = styled.div`
  font-size: 14px;
  color: var(--pp-text-3);
  margin-bottom: 20px;
`;

const DescriptionText = styled.p`
  font-size: 14px;
  color: var(--pp-text-2);
  line-height: 1.6;
  margin: 0 0 30px 0;

  ${media.mobile} {
    font-size: 13.5px;
    margin-bottom: 24px;
  }
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  ${media.mobile} {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 16px 14px;
  }
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  .label { font-size: 11px; color: #A19C98; text-transform: uppercase; }
  .value { font-size: 14px; font-weight: 600; color: var(--pp-ink); }
`;

const ProductActionsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PurchaseCard = styled.div`
  background: var(--pp-surface);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;

  .price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
  .price-value { font-size: 36px; font-weight: 800; color: var(--pp-ink); }
  .price-unit { font-size: 14px; color: var(--pp-text-2); }
  .status { font-size: 12px; color: #588F67; display: flex; align-items: center; gap: 6px; margin-bottom: 20px; font-weight: 500; }

  ${media.mobile} {
    padding: 20px 18px;

    .price-value { font-size: 30px; }
  }
`;

const PrimaryButton = styled.button`
  background: var(--pp-accent-soft);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 10px;
  width: 100%;
  &:hover { background: #B29168; }

  /* Іконка кошика є лише у мобільному референсі — на десктопі приховуємо,
     тож десктопна кнопка лишається рівно такою, якою була */
  .btn-icon { display: none; }

  ${media.tablet} {
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;

    .btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: var(--pp-ink);
  border: 1.5px solid #1A1613;
  border-radius: 8px;
  padding: 13px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 14px;
  width: 100%;
  &:hover { background: rgba(0, 0, 0, 0.04); }

  /* Референс: біла кнопка з тонкою світлою рамкою, а не жирна темна обводка */
  ${media.tablet} {
    min-height: 48px;
    background: var(--pp-surface);
    border: 1px solid rgba(26, 22, 19, 0.20);
  }
`;

const FavoriteLink = styled.div`
  font-size: 13px;
  color: var(--pp-text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.28s ease;
  &:hover { color: var(--pp-ink); }

  svg {
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), fill 0.28s ease, stroke 0.28s ease;
  }

  /* Активний стан: серце заливається акцентом і ледь підростає */
  &.is-favorite {
    color: var(--pp-accent);

    svg {
      fill: var(--pp-accent);
      stroke: var(--pp-accent);
      transform: scale(1.12);
    }
  }

  ${media.tablet} {
    min-height: 44px;
  }
`;

const CalculatorCard = styled.div`
  background: var(--pp-surface);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;

  .calc-title { font-size: 14px; font-weight: 700; color: var(--pp-ink); margin-bottom: 2px; }
  .calc-subtitle { font-size: 11px; color: var(--pp-text-3); margin-bottom: 14px; }

  ${media.mobile} {
    padding: 18px 16px;

    .calc-subtitle { font-size: 12px; margin-bottom: 16px; }
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;

  label { font-size: 11.5px; color: var(--pp-text-2); }
  input {
    width: 60px;
    height: 30px;
    padding: 0 8px;
    border: none;
    border-radius: 6px;
    background: var(--pp-surface-2);
    font-size: 12px;
    color: var(--pp-ink);
    text-align: center;
    font-weight: 600;
    outline: none;
  }

  ${media.tablet} {
    margin-bottom: 12px;

    label { font-size: 13px; }

    input {
      width: 86px;
      height: 44px;
      /* 16px обов'язково: менший розмір змушує iOS Safari зумити сторінку
         при фокусі на полі вводу */
      font-size: 16px;
    }
  }
`;

const CalculateButton = styled.button`
  background: #25201D;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  height: 36px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  margin-bottom: 14px;
  width: 100%;
  &:hover { opacity: 0.9; }

  /* Референс: «Розрахувати» — світла кнопка з тонкою рамкою (заміряно по
     макету: заливка ≈ #FAF4F1), а не темна як на десктопі */
  ${media.tablet} {
    height: 46px;
    font-size: 14px;
    background: var(--pp-surface);
    color: var(--pp-ink);
    border: 1px solid rgba(26, 22, 19, 0.18);

    &:hover { background: var(--pp-surface-3); opacity: 1; }
  }
`;

const ResultsBlock = styled.div`
  border-top: 1px solid var(--pp-divider);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .result-line {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--pp-text-2);
    span:last-child { font-weight: 600; color: var(--pp-ink); }
  }

  .total-line {
    font-size: 13px;
    font-weight: 700;
    color: var(--pp-ink);
    margin-top: 2px;
    span:last-child { font-size: 14px; color: var(--pp-ink); }
  }
`;

/* ======================================================
   ОБГОРТКА НИЖНЬОГО КОНТЕНТУ (ОДНОРІДНИЙ СВІТЛИЙ ФОН #F5EFEA)
   ====================================================== */
   const LowerContentWrapper = styled.div`
   background: var(--pp-bg-cream);
   width: 100%;
   padding: 36px 0 60px 0;
   
   margin-top: -57px; /* Спробуй значення від -60px до -150px, поки не стане по червоній лінії */
   
   display: flex;
   flex-direction: column;
   align-items: center;
   
   /* Переконайся, що він шар за шаром правильно перекриває чи лягає */
   position: relative;
   z-index: 1;

   /* ── РЕФЕРЕНС: суцільної світлої підкладки на мобільному немає. «Переваги»,
      «Таби» та «Консультація» лежать окремими картками просто на фоні
      сторінки (#6F675E), між ними видно фон. Тому робимо обгортку
      прозорою, а картки отримують власне тло нижче. ── */
   @media (max-width: 1100px) {
     background: transparent;
     margin-top: 0;
     padding: 14px 0 0 0;
   }

   ${media.mobile} {
     padding: 12px 0 0 0;
   }

   ${media.smallMobile} {
     padding: 10px 0 0 0;
   }
 `;

const LowerContentInner = styled.div`
  max-width: 1400px;
  width: 100%;
  padding: 0 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 36px;

  /* Ті самі бічні поля, що й у MainContainer — усі картки стоять по одній лінії */
  @media (max-width: 1100px) {
    padding: 0 24px;
    gap: 14px;
  }

  ${media.mobile} {
    padding: 0 16px;
    gap: 12px;
  }

  ${media.smallMobile} {
    padding: 0 14px;
    gap: 10px;
  }

  @media (max-width: 360px) {
    padding: 0 12px;
  }
`;

/* ======================================================
   ПЕРЕВАГИ
   ====================================================== */
const BenefitsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
  padding: 24px 0;
  border-top: 1px solid rgba(26, 22, 19, 0.12);
  border-bottom: 1px solid rgba(26, 22, 19, 0.12);
  @media (max-width: 1000px) { grid-template-columns: repeat(3, 1fr); }

  /* ── РЕФЕРЕНС: «Переваги» — окрема світла скруглена картка на фоні сторінки
     (у макеті 4 колонки на ширині 800px). Пропорційний мобільний еквівалент —
     2 колонки: так само ~145px на пункт, текст лишається читабельним. ── */
  @media (max-width: 1100px) {
    background: var(--pp-bg-cream);
    border-top: none;
    border-bottom: none;
    border-radius: 20px;
    padding: 20px 18px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.10);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 16px;
  }

  ${media.mobile} {
    padding: 18px 16px;
    gap: 16px 12px;
  }

  ${media.smallMobile} {
    border-radius: 18px;
    padding: 16px 14px;
    gap: 14px 10px;
  }

  /* На найвужчих екранах 2 колонки вже стискають підпис до нечитабельного */
  @media (max-width: 360px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;

  .icon-wrapper {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 1px solid rgba(26, 22, 19, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pp-ink);
    background: rgba(26, 22, 19, 0.04);
    flex-shrink: 0;
  }

  .text-block { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .title { font-size: 13px; font-weight: 600; color: var(--pp-ink); }
  .subtitle { font-size: 11px; color: var(--pp-text-2); }

  /* Референс: кружечки іконок мають теплу золотисту обводку (заміряно #B88B66)
     і такий самий колір гліфа — на десктопі вони темні, тож змінюємо
     тільки в мобільному діапазоні */
  ${media.tablet} {
    gap: 12px;

    .icon-wrapper {
      width: 40px;
      height: 40px;
      border-color: rgba(185, 147, 90, 0.55);
      background: rgba(185, 147, 90, 0.08);
      color: var(--pp-accent);
    }

    /* У src/styles.css є глобальне правило для класу .title
       (text-align: center та margin-bottom: 24px), яке випадково перехоплює
       цей className: воно центрує заголовок і відриває його від підпису.
       Нейтралізуємо тільки в мобільному діапазоні — десктоп лишається як був. */
    .title {
      text-align: left;
      margin-bottom: 0;
    }
  }

  ${media.mobile} {
    /* У вужчій колонці заголовок переноситься на 2–3 рядки, тож іконку
       вирівнюємо по першому рядку — так пара «іконка + текст» читається
       як одне ціле, а не «розповзається» по висоті */
    align-items: flex-start;
    gap: 9px;

    .icon-wrapper {
      width: 34px;
      height: 34px;
      margin-top: 1px;
      svg { width: 16px; height: 16px; }
    }
    .title { font-size: 12px; line-height: 1.28; }
    .subtitle { font-size: 10.5px; line-height: 1.32; }
  }

  ${media.smallMobile} {
    gap: 9px;

    .icon-wrapper {
      width: 32px;
      height: 32px;
      svg { width: 15px; height: 15px; }
    }
    .title { font-size: 12px; }
    .subtitle { font-size: 10px; }
  }
`;

/* ======================================================
   ТАБИ ТА БАНЕР КОНСУЛЬТАЦІЇ
   ====================================================== */
const InfoFooterSectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 32px;
  align-items: stretch;
  @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); gap: 14px; }
`;

const TabsWrapper = styled.div`
  background: var(--pp-bg-cream);
  color: var(--pp-ink);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  min-width: 0;

  ${media.mobile} {
    padding: 20px 18px;
    border-radius: 16px;
  }

  ${media.smallMobile} {
    padding: 18px 14px;
  }
`;

const TabHeader = styled.div`
  display: flex;
  gap: 28px;
  border-bottom: 1px solid rgba(26, 22, 19, 0.12);
  margin-bottom: 24px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }

  ${media.mobile} {
    gap: 18px;
    margin-bottom: 18px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;

    /* Усі 5 табів не вміщуються у 390px, тож ряд скролиться горизонтально.
       М'яке згасання праворуч підказує, що далі є ще таби, і прибирає
       ефект «обрізаної навпіл» літери на краю. */
    mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent 100%);
    -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent 100%);
    padding-right: 12px;
  }
`;

const TabTitle = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: ${props => (props.active ? '#1A1613' : '#8E8A86')};
  padding-bottom: 12px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  white-space: nowrap;

  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background: var(--pp-accent-soft);
    transform: scaleX(${props => (props.active ? 1 : 0)});
    transition: transform 0.2s ease;
  }

  ${media.mobile} {
    font-size: 13.5px;
    min-height: 44px;
    padding: 0 0 12px 0;
    flex-shrink: 0;
  }
`;

const TabContent = styled.div`
  font-size: 14px;
  color: var(--pp-text-2);
  line-height: 1.75;
  p { margin: 0 0 16px 0; }

  ${media.mobile} {
    font-size: 13.5px;
    line-height: 1.7;
  }
`;

export const ConsultationBanner = styled.div`
  position: relative;
  width: 100%;
  min-height: 220px; /* Зменшуємо висоту (було ~280px) */
  background-color: #1a1716;
  border-radius: 20px;
  display: flex;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;

  /* На вузькому екрані текст і фото більше не конкурують за одну площину:
     текст зверху, зображення окремим блоком знизу */
  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    min-height: 0;
    border-radius: 16px;
  }
`;

export const ConsultationContent = styled.div`
  position: relative;
  z-index: 2; /* Текст і кнопка вище за зображення */
  padding: 32px 36px;
  max-width: 380px; /* Обмежуємо ширину під текстову колонку */
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${media.mobile} {
    order: 1;
    max-width: 100%;
    padding: 24px 20px 20px 20px;
    gap: 12px;
  }
`;

export const ConsultationTitle = styled.h3`
  color: #ffffff;
  font-family: serif; /* або ваш шрифт із засічками, наприклад 'Playfair Display', serif */
  font-size: 26px;
  font-weight: 400;
  margin: 0;
  line-height: 1.2;

  ${media.mobile} {
    font-size: 22px;
  }
`;

export const ConsultationText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.4;
  margin: 0;

  ${media.mobile} {
    font-size: 13.5px;
    line-height: 1.5;
  }
`;

export const ConsultationButton = styled.button`
  background: #c59b6c; /* золотисто-бежевий відтінок */
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
  transition: background 0.2s ease;

  &:hover {
    background: #b08759;
  }

  ${media.mobile} {
    width: 100%;
    min-height: 48px;
    font-size: 14px;
  }
`;

export const ConsultationImage = styled.img`
  position: absolute;
  right: 0;
  top: 0;
  width: 70%; /* Картинка займає більше місця в ширину */
  height: 100%;
  object-fit: cover;
  z-index: 1;

  mask-image: linear-gradient(to right, transparent 0%, black 45%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 45%);

  ${media.mobile} {
    order: 2;
    position: relative;
    right: auto;
    top: auto;
    width: 100%;
    height: 170px;
    /* Градієнт розвертаємо: тепер фото м'яко «виростає» з-під тексту зверху */
    mask-image: linear-gradient(to bottom, transparent 0%, black 55%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 55%);
  }
`;



/* ======================================================
   ТЕМНИЙ ФУТЕР (#0B0E14)
   ====================================================== */
const FooterContainer = styled.footer`
  background: #0B0E14;
  padding: 50px 60px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
  width: 100%;
  box-sizing: border-box;

  /* ── РЕФЕРЕНС: футер теж окрема темна скруглена картка з полями по боках,
     а копірайт під нею — просто на фоні сторінки. Тому сам контейнер
     робимо прозорим, а темне тло переїжджає на FooterGrid. ── */
  ${media.tablet} {
    background: transparent;
    border-top: none;
    padding: 14px 24px calc(18px + env(safe-area-inset-bottom, 0px)) 24px;
  }

  ${media.mobile} {
    padding: 12px 16px calc(16px + env(safe-area-inset-bottom, 0px)) 16px;
  }

  ${media.smallMobile} {
    padding: 10px 14px calc(14px + env(safe-area-inset-bottom, 0px)) 14px;
  }

  @media (max-width: 360px) {
    padding: 10px 12px calc(14px + env(safe-area-inset-bottom, 0px)) 12px;
  }
`;

const FooterGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 36px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; }

  ${media.tablet} {
    background: #0B0E14;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    padding: 24px 20px;
    gap: 22px 18px;
  }

  ${media.mobile} {
    padding: 20px 16px;
    gap: 20px 14px;
  }

  ${media.smallMobile} {
    border-radius: 18px;
    padding: 18px 14px;
    gap: 18px 10px;
  }

  /* Нижче 360px дві колонки вже ріжуть довгі пункти на 3 рядки */
  @media (max-width: 360px) {
    grid-template-columns: 1fr;
    gap: 18px;
  }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  h4 { font-size: 13px; font-weight: 600; text-transform: uppercase; color: var(--pp-accent-soft); margin: 0; }
  ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
  li { font-size: 13px; color: rgba(255, 255, 255, 0.7); cursor: pointer; word-break: break-word; &:hover { color: #ffffff; } }

  /* Іконки біля контактів є лише у мобільному референсі — на десктопі
     ховаємо, тож десктопний футер лишається без змін */
  .li-icon { display: none; }

  ${media.tablet} {
    gap: 13px;

    h4 { font-size: 12px; letter-spacing: 0.6px; }
    ul { gap: 4px; }

    li {
      min-height: 34px;
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 13px;
      line-height: 1.3;
    }

    .li-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 15px;
      color: var(--pp-accent-soft);
    }
  }

  ${media.smallMobile} {
    li { font-size: 12.5px; min-height: 32px; gap: 8px; }
  }
`;

const FooterBottom = styled.div`
  max-width: 1400px;
  margin: 36px auto 0 auto;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);

  /* Референс: копірайт стоїть під темною карткою футера, по центру,
     просто на фоні сторінки — без розділювальної лінії */
  ${media.tablet} {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 5px;
    margin-top: 14px;
    padding-top: 0;
    border-top: none;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.62);
  }

  ${media.mobile} {
    margin-top: 12px;
    font-size: 11.5px;
  }
`;

export default function ProductDetail() {
  const history = useHistory();

  // 1. Отримуємо ID товару з URL
  const { productId } = useParams();

  // 2. Витягуємо об'єкт з даними.
  //    Спершу дивимось у каталог із бекенда (там актуальні ціни й фото,
  //    які редагує адмін-панель), і лише потім — у статичний фолбек.
  const catalogProducts = useCatalog(state => state.products);
  const catalogIndex = useCatalog(state => state.productIndex);
  const product =
    catalogProducts[productId] || PRODUCTS_DATA[productId] || PRODUCTS_DATA.oak;

  /* Обране та кошик — той самий спільний стан, що й у шапці й на картках.
     Беремо саме product.id, а не productId з URL: якщо адреса невідома,
     сторінка показує дуб, тож і додавати треба дуб. */
  const shopId = product.id;
  const isFavorite = useShop(selectIsFavorite(shopId));
  const cartQty = useShop(selectCartQty(shopId));
  const toggleFavorite = useShop(state => state.toggleFavorite);
  const addToCart = useShop(state => state.addToCart);

  // 3. Динамічна галерея зображень
  const galleryImages = product.images || [
    '/cat-dub.jpg',
    '/cat-yasen.jpg',
    '/cat-grab.jpg'
  ];

  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [menuOpen, setMenuOpen] = useState(false);

  const [length, setLength] = useState(4.0);
  const [width, setWidth] = useState(3.2);
  const [area, setArea] = useState(14.4);
  const [packages, setPackages] = useState(6);
  const [totalPrice, setTotalPrice] = useState(
    Math.round(14.4 * product.pricePerM2)
  );

  const PRICE_PER_M2 = product.pricePerM2;
  const PACK_CAPACITY = product.packSqM;

  /* Усе, що показує сторінка, береться з самого товару — тому будь-яка
     правка в адмін-панелі одразу видна тут після оновлення каталогу */
  const productCard = catalogIndex[product.id] || {};
  const categoryTitle = productCard.categoryTitle || 'Каталог';
  const categoryPath = productCard.categorySlug ? `/${productCard.categorySlug}` : '/catalog';
  const productSubtitle = product.shortDescription || categoryTitle;
  const productSpecs = product.specs || [];

  // 🔄 Оновлення галереї та калькулятора при переході між товарами
  useEffect(() => {
    setActiveImg(0);
    
    const calculatedArea = parseFloat((length * width).toFixed(1));
    const calculatedPackages = Math.ceil(calculatedArea / PACK_CAPACITY);
    const calculatedPrice = Math.round(calculatedArea * PRICE_PER_M2);

    setArea(calculatedArea);
    setPackages(calculatedPackages);
    setTotalPrice(calculatedPrice);
  }, [productId, PACK_CAPACITY, PRICE_PER_M2, length, width]);

  const handleCalculate = () => {
    const calculatedArea = parseFloat((length * width).toFixed(1));
    const calculatedPackages = Math.ceil(calculatedArea / PACK_CAPACITY);
    const calculatedPrice = Math.round(calculatedArea * PRICE_PER_M2);
    setArea(calculatedArea);
    setPackages(calculatedPackages);
    setTotalPrice(calculatedPrice);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80';
  };
  return (
    <PageWrapper>
      <GlobalScrollStyle />

      {/* ── ХЕДЕР ── */}
      <HeaderContainer>
        <LogoSection onClick={() => history.push('/')}>
          <div className="logo-circle" />
          <h1>PARKET PLANET</h1>
        </LogoSection>

        <NavLinks>
          <span onClick={() => history.push('/catalog')}>Паркет</span>
          <span onClick={() => history.push('/catalog')}>Паркетна дошка</span>
          <span onClick={() => history.push('/catalog')}>Ламінат</span>
          <span onClick={() => history.push('/catalog')}>Аксесуари</span>
          <span onClick={() => history.push('/about')}>Про нас</span>
          <span onClick={() => history.push('/contacts')}>Контакти</span>
        </NavLinks>

        <RightHeaderSection>
          <HeaderIconButton className="secondary" onClick={() => history.push('/search')}>
            <IconSearch size={18} />
          </HeaderIconButton>
          <HeaderIconButton className="secondary" onClick={() => history.push('/favorites')}>
            <IconHeart size={18} />
          </HeaderIconButton>
          <HeaderIconButton onClick={() => history.push('/cart')}>
            <IconShoppingBag size={18} />
            <span className="cart-badge">0</span>
          </HeaderIconButton>
          <CallRequestBtn onClick={() => history.push('/contacts')}>
            Замовити дзвінок
          </CallRequestBtn>

          {/* Видима лише на планшеті/телефоні (CSS) */}
          <HamburgerButton
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Відкрити меню"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </HamburgerButton>
        </RightHeaderSection>
      </HeaderContainer>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={[
          { label: 'Головна', onClick: () => history.push('/') },
          { label: 'Паркет', onClick: () => history.push('/catalog') },
          { label: 'Паркетна дошка', onClick: () => history.push('/catalog') },
          { label: 'Ламінат', onClick: () => history.push('/catalog') },
          { label: 'Аксесуари', onClick: () => history.push('/catalog') },
          { label: 'Про нас', onClick: () => history.push('/about') },
          { label: 'Контакти', onClick: () => history.push('/contacts') },
          { label: 'Пошук', onClick: () => history.push('/search') },
          { label: 'Обране', onClick: () => history.push('/favorites') },
          { label: '3D Візуалізація', onClick: () => history.push('/hall') }
        ]}
        contacts={[
          {
            label: 'Телефон',
            value: '+38 (067) 673 06 70',
            href: 'tel:+380676730670'
          },
          {
            label: 'E-mail',
            value: 'parket_planet@i.ua',
            href: 'mailto:parket_planet@i.ua'
          }
        ]}
        cta={{
          label: 'Замовити дзвінок',
          onClick: () => history.push('/contacts')
        }}
      />

      {/* ── ОСНОВНИЙ КОНТЕНТ (ВЕРХНЯ ЧАСТИНА НА ТЕМНОМУ ГРАДІЄНТІ) ── */}
      <MainContainer>

        {/* ── ХЛІБНІ КРИХТИ ── */}
        <Breadcrumbs>
          <span onClick={() => history.push('/')}>Головна</span>
          <span className="separator">/</span>
          <span onClick={() => history.push(categoryPath)}>{categoryTitle}</span>
          <span className="separator">/</span>
          <span className="current">{product.title}</span>
        </Breadcrumbs>

        {/* ── СІТКА ТОВАРУ ── */}
        <ProductMainGrid>

          {/* Ліва Галерея */}
          <LeftGalleryWrapper>
            <MainImageCard>
              <ImageBadgesOverlay>
                <BadgeItem>
                  <div className="avatar-icon"><IconLeaf size={11} /></div>
                  <span className="badge-label">Натуральне дерево</span>
                </BadgeItem>
                <BadgeItem>
                  <div className="avatar-icon"><IconShieldCheck size={11} /></div>
                  <span className="badge-label">Екологічно чистий продукт</span>
                </BadgeItem>
                <BadgeItem>
                  <div className="avatar-icon"><IconFlame size={11} /></div>
                  <span className="badge-label">Підходить для теплої підлоги</span>
                </BadgeItem>
                <BadgeItem>
                  <div className="avatar-icon"><IconAward size={11} /></div>
                  <span className="badge-label">Зроблено в Європі</span>
                </BadgeItem>
              </ImageBadgesOverlay>

              <MainImage
                src={galleryImages[activeImg]}
                alt={product.title}
                onError={handleImageError}
              />
            </MainImageCard>

            {/* Нижня плаваюча панель галереї відповідно до зразка */}
            <GalleryBottomPanel>
              <SliderArrow onClick={() => setActiveImg(prev => prev > 0 ? prev - 1 : galleryImages.length - 1)}>
                ‹
              </SliderArrow>

              <ThumbnailsRow>
                {galleryImages.map((img, idx) => (
                  <ThumbItem
                    key={idx}
                    active={idx === activeImg}
                    onClick={() => setActiveImg(idx)}
                  >
                    <img src={img} alt={`Мініатюра ${idx + 1}`} onError={handleImageError} />
                  </ThumbItem>
                ))}
              </ThumbnailsRow>

              {/* 3D кнопка: на десктопі притиснута вправо (margin-left: auto) —
                  візуально там само, де й була. На телефоні (CSS order) стає
                  окремим рядком на всю ширину, щоб не тиснути мініатюри. */}
              <VRButtonInGallery onClick={() => history.push('/hall')}>
                <div className="vr-circle">3D</div>
                <span className="vr-label">Переглянути<br/>в інтер'єрі</span>
              </VRButtonInGallery>

              <SliderArrow onClick={() => setActiveImg(prev => prev < galleryImages.length - 1 ? prev + 1 : 0)}>
                ›
              </SliderArrow>
            </GalleryBottomPanel>
          </LeftGalleryWrapper>

          {/* Права картка товару (Кремова #F5EFEA) */}
          <RightInfoWrapper>
            <ProductDescriptionBlock>
              <HitBadge>Хіт продажів</HitBadge>
              <ProductTitle>{product.title}</ProductTitle>
              <ProductSubtitle>{productSubtitle}</ProductSubtitle>

              <DescriptionText>{product.description}</DescriptionText>

              <SpecsGrid>
                {productSpecs.map(spec => (
                  <SpecItem key={spec.label}>
                    <span className="label">{spec.label}</span>
                    <span className="value">{spec.value}</span>
                  </SpecItem>
                ))}
              </SpecsGrid>
            </ProductDescriptionBlock>

            <ProductActionsBlock>
              <PurchaseCard>
                <div className="price-row">
                  <span className="price-value">{PRICE_PER_M2.toLocaleString('uk-UA')}</span>
                  <span className="price-unit">грн / м²</span>
                </div>
                <div className="status"><span>✓</span> В наявності</div>
                <PrimaryButton type="button" onClick={() => addToCart(shopId)}>
                  <span className="btn-icon"><IconCart size={17} /></span>
                  {cartQty > 0 ? `У кошику · ${cartQty} — додати ще` : 'Додати в кошик'}
                </PrimaryButton>
                <SecondaryButton type="button">Замовити зразок</SecondaryButton>
                <FavoriteLink
                  role="button"
                  tabIndex={0}
                  aria-pressed={isFavorite}
                  onClick={() => toggleFavorite(shopId)}
                  className={isFavorite ? 'is-favorite' : ''}
                >
                  <IconHeart size={14} />
                  <span>{isFavorite ? 'Додано до обраного' : 'Додати до обраного'}</span>
                </FavoriteLink>
              </PurchaseCard>

              <CalculatorCard>
                <span className="calc-title">Калькулятор підлоги</span>
                <span className="calc-subtitle">Розрахуйте кількість матеріалу для вашої кімнати</span>

                <InputRow>
                  <label htmlFor="length-input">Довжина кімнати (м)</label>
                  <input
                    id="length-input"
                    type="number"
                    step="0.1"
                    value={length}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                  />
                </InputRow>
                <InputRow>
                  <label htmlFor="width-input">Ширина кімнати (м)</label>
                  <input
                    id="width-input"
                    type="number"
                    step="0.1"
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                  />
                </InputRow>

                <CalculateButton onClick={handleCalculate}>Розрахувати</CalculateButton>

                <ResultsBlock>
                  <div className="result-line"><span>Площа</span><span>{area} м²</span></div>
                  <div className="result-line"><span>Кількість упаковок</span><span>{packages} шт.</span></div>
                  <div className="result-line total-line"><span>Загальна сума</span><span>{totalPrice.toLocaleString('uk-UA')} грн</span></div>
                </ResultsBlock>
              </CalculatorCard>
            </ProductActionsBlock>
          </RightInfoWrapper>

        </ProductMainGrid>

      </MainContainer>

      {/* ── НИЖНЯ СЕКЦІЯ (СУЦІЛЬНИЙ СВІТЛИЙ ФОН #F5EFEA) ── */}
      <LowerContentWrapper>
        <LowerContentInner>

          {/* ── ПЕРЕВАГИ ── */}
          <BenefitsBar>
            <BenefitItem>
              <div className="icon-wrapper"><IconLeaf size={18} /></div>
              <div className="text-block">
                <span className="title">100% натуральне дерево</span>
                <span className="subtitle">Екологічно чистий матеріал</span>
              </div>
            </BenefitItem>
            <BenefitItem>
              <div className="icon-wrapper"><IconAward size={18} /></div>
              <div className="text-block">
                <span className="title">Європейська якість</span>
                <span className="subtitle">Від перевірених виробників</span>
              </div>
            </BenefitItem>
            <BenefitItem>
              <div className="icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="text-block">
                <span className="title">Доставка по Україні</span>
                <span className="subtitle">Швидко та надійно</span>
              </div>
            </BenefitItem>
            <BenefitItem>
              <div className="icon-wrapper"><IconShieldCheck size={18} /></div>
              <div className="text-block">
                <span className="title">Гарантія до 25 років</span>
                <span className="subtitle">Впевнені в нашій якості</span>
              </div>
            </BenefitItem>
            <BenefitItem>
              <div className="icon-wrapper"><IconFlame size={18} /></div>
              <div className="text-block">
                <span className="title">Професійні консультації</span>
                <span className="subtitle">Допоможемо з вибором</span>
              </div>
            </BenefitItem>
          </BenefitsBar>

          {/* ── ТАБИ ТА БАНЕР КОНСУЛЬТАЦІЇ ── */}
          <InfoFooterSectionGrid>
            <TabsWrapper>
              <TabHeader>
                <TabTitle active={activeTab === 'description'} onClick={() => setActiveTab('description')}>Опис</TabTitle>
                <TabTitle active={activeTab === 'specs'} onClick={() => setActiveTab('specs')}>Характеристики</TabTitle>
                <TabTitle active={activeTab === 'delivery'} onClick={() => setActiveTab('delivery')}>Доставка та оплата</TabTitle>
                <TabTitle active={activeTab === 'warranty'} onClick={() => setActiveTab('warranty')}>Гарантія</TabTitle>
                <TabTitle active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>Відгуки (24)</TabTitle>
              </TabHeader>

              <TabContent>
                {activeTab === 'description' && <p>{product.description}</p>}
                {activeTab === 'specs' && (
                  <p>
                    {productSpecs.length
                      ? productSpecs.map(spec => `${spec.label}: ${spec.value}`).join('. ') + '.'
                      : 'Характеристики цього товару ще не заповнені в адмін-панелі.'}
                  </p>
                )}
                {activeTab === 'delivery' && (
                  <p>
                    Ми доставляємо продукцію по всій території України за допомогою провідних логістичних компаній. Оплата можлива як банківською картою на сайті, так і готівкою при отриманні або за безготівковим розрахунком.
                  </p>
                )}
                {activeTab === 'warranty' && (
                  <p>
                    На всю продукцію бренду надається офіційна гарантія виробника терміном до 25 років за умови дотримання правил монтажу та експлуатації підлогового покриття.
                  </p>
                )}
                {activeTab === 'reviews' && (
                  <p>
                    Клієнти відзначають високу якість деревини, простоту укладання та чудовий вигляд в готовому інтер'єрі. Середня оцінка товару складає 4.9/5 на основі 24 відгуків покупців.
                  </p>
                )}
              </TabContent>
            </TabsWrapper>

            <ConsultationBanner>
              <ConsultationContent>
                <ConsultationTitle>Потрібна консультація?</ConsultationTitle>
                <ConsultationText>
                  Наші експерти допоможуть обрати ідеальний паркет для вашого дому.
                </ConsultationText>
              
              <ConsultationButton>Отримати консультацію</ConsultationButton>
              </ConsultationContent>
              <ConsultationImage src="/qqq.jpg" alt="Консультант" />
            </ConsultationBanner>
          </InfoFooterSectionGrid>

        </LowerContentInner>
      </LowerContentWrapper>

      {/* ── ТЕМНИЙ ФУТЕР ── */}
      <FooterContainer>
        <FooterGrid>
          <FooterColumn>
            <h4>Каталог</h4>
            <ul>
              <li onClick={() => history.push('/catalog')}>Паркетна дошка</li>
              <li onClick={() => history.push('/catalog')}>Масивна дошка</li>
              <li onClick={() => history.push('/catalog')}>Ламінат</li>
              <li onClick={() => history.push('/catalog')}>Супутні товари</li>
            </ul>
          </FooterColumn>

          <FooterColumn>
            <h4>Покупцям</h4>
            <ul>
              <li onClick={() => history.push('/delivery')}>Оплата і доставка</li>
              <li onClick={() => history.push('/warranty')}>Гарантія та повернення</li>
              <li onClick={() => history.push('/calculator')}>Калькулятор матеріалу</li>
              <li onClick={() => history.push('/faq')}>Питання та відповіді</li>
            </ul>
          </FooterColumn>

          <FooterColumn>
            <h4>Про компанію</h4>
            <ul>
              <li onClick={() => history.push('/about')}>Про Parket Planet</li>
              <li onClick={() => history.push('/contacts')}>Контакти</li>
              <li onClick={() => history.push('/news')}>Новини та блоги</li>
              <li onClick={() => history.push('/reviews')}>Відгуки клієнтів</li>
            </ul>
          </FooterColumn>

          <FooterColumn>
            <h4>Контакти</h4>
            <ul>
              <li><span className="li-icon"><IconMapPin size={14} /></span>вул. Наукова, 12, Львів</li>
              <li><span className="li-icon"><IconPhone size={14} /></span>+38 (067) 673 06 70</li>
              <li><span className="li-icon"><IconMail size={14} /></span>parket_planet@i.ua</li>
              <li><span className="li-icon"><IconClock size={14} /></span>Пн - Пт: 09:00 - 19:00</li>
            </ul>
          </FooterColumn>
        </FooterGrid>

        <FooterBottom>
          <span>© {new Date().getFullYear()} Parket Planet. Усі права захищені.</span>
          <span>Розробка преміальних інтер'єрів підлоги</span>
        </FooterBottom>
      </FooterContainer>

    </PageWrapper>
  );
}