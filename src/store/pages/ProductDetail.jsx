import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useHistory, useParams } from 'react-router-dom';
import { PRODUCTS_DATA } from '../data/productsData';
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
    color: #1A1613;
  }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: transparent;
  color: #1A1613;
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
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;

  .logo-circle {
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
`;

const RightHeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
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
`;

const CallRequestBtn = styled.button`
  background-color: #F5EFEA;
  color: #1A1613;
  border: none;
  padding: 10px 22px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background-color: #ffffff; transform: translateY(-1px); }
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
`;

const ProductMainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: stretch;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
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
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.88);
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
`;

const ThumbnailsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;
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
    color: #EAE3DB;
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
`;

/* ======================================================
   ПРАВА СЕКЦІЯ (КРЕМОВА #F5EFEA)
   ====================================================== */
const RightInfoWrapper = styled.div`
  background: #F5EFEA;
  color: #1A1613;
  border-radius: 20px;
  padding: 32px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  @media (max-width: 900px) { grid-template-columns: 1fr; }
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
  color: #1A1613;
  margin: 0 0 6px 0;
`;

const ProductSubtitle = styled.div`
  font-size: 14px;
  color: #8E8A86;
  margin-bottom: 20px;
`;

const DescriptionText = styled.p`
  font-size: 14px;
  color: #57524E;
  line-height: 1.6;
  margin: 0 0 30px 0;
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  .label { font-size: 11px; color: #A19C98; text-transform: uppercase; }
  .value { font-size: 14px; font-weight: 600; color: #1A1613; }
`;

const ProductActionsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PurchaseCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;

  .price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; }
  .price-value { font-size: 36px; font-weight: 800; color: #1A1613; }
  .price-unit { font-size: 14px; color: #57524E; }
  .status { font-size: 12px; color: #588F67; display: flex; align-items: center; gap: 6px; margin-bottom: 20px; font-weight: 500; }
`;

const PrimaryButton = styled.button`
  background: #C3A279;
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
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #1A1613;
  border: 1.5px solid #1A1613;
  border-radius: 8px;
  padding: 13px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 14px;
  width: 100%;
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

const FavoriteLink = styled.div`
  font-size: 13px;
  color: #57524E;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  &:hover { color: #1A1613; }
`;

const CalculatorCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;

  .calc-title { font-size: 14px; font-weight: 700; color: #1A1613; margin-bottom: 2px; }
  .calc-subtitle { font-size: 11px; color: #8E8A86; margin-bottom: 14px; }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;

  label { font-size: 11.5px; color: #57524E; }
  input {
    width: 60px;
    height: 30px;
    padding: 0 8px;
    border: none;
    border-radius: 6px;
    background: #EAE3DB;
    font-size: 12px;
    color: #1A1613;
    text-align: center;
    font-weight: 600;
    outline: none;
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
`;

const ResultsBlock = styled.div`
  border-top: 1px solid #F0EAE4;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .result-line {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #57524E;
    span:last-child { font-weight: 600; color: #1A1613; }
  }

  .total-line {
    font-size: 13px;
    font-weight: 700;
    color: #1A1613;
    margin-top: 2px;
    span:last-child { font-size: 14px; color: #1A1613; }
  }
`;

/* ======================================================
   ОБГОРТКА НИЖНЬОГО КОНТЕНТУ (ОДНОРІДНИЙ СВІТЛИЙ ФОН #F5EFEA)
   ====================================================== */
   const LowerContentWrapper = styled.div`
   background: #F5EFEA;
   width: 100%;
   padding: 36px 0 60px 0;
   
   margin-top: -57px; /* Спробуй значення від -60px до -150px, поки не стане по червоній лінії */
   
   display: flex;
   flex-direction: column;
   align-items: center;
   
   /* Переконайся, що він шар за шаром правильно перекриває чи лягає */
   position: relative; 
   z-index: 1;
 `;

const LowerContentInner = styled.div`
  max-width: 1400px;
  width: 100%;
  padding: 0 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 36px;
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
  @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); }
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  .icon-wrapper {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 1px solid rgba(26, 22, 19, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1A1613;
    background: rgba(26, 22, 19, 0.04);
    flex-shrink: 0;
  }

  .text-block { display: flex; flex-direction: column; gap: 2px; }
  .title { font-size: 13px; font-weight: 600; color: #1A1613; }
  .subtitle { font-size: 11px; color: #57524E; }
`;

/* ======================================================
   ТАБИ ТА БАНЕР КОНСУЛЬТАЦІЇ
   ====================================================== */
const InfoFooterSectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 32px;
  align-items: stretch;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const TabsWrapper = styled.div`
  background: #F5EFEA;
  color: #1A1613;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
`;

const TabHeader = styled.div`
  display: flex;
  gap: 28px;
  border-bottom: 1px solid rgba(26, 22, 19, 0.12);
  margin-bottom: 24px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
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
    background: #C3A279;
    transform: scaleX(${props => (props.active ? 1 : 0)});
    transition: transform 0.2s ease;
  }
`;

const TabContent = styled.div`
  font-size: 14px;
  color: #57524E;
  line-height: 1.75;
  p { margin: 0 0 16px 0; }
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
  box-sizing: border-border-box;
`;

export const ConsultationContent = styled.div`
  position: relative;
  z-index: 2; /* Текст і кнопка вище за зображення */
  padding: 32px 36px;
  max-width: 380px; /* Обмежуємо ширину під текстову колонку */
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ConsultationTitle = styled.h3`
  color: #ffffff;
  font-family: serif; /* або ваш шрифт із засічками, наприклад 'Playfair Display', serif */
  font-size: 26px;
  font-weight: 400;
  margin: 0;
  line-height: 1.2;
`;

export const ConsultationText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
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
`;

const FooterGrid = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 36px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  h4 { font-size: 13px; font-weight: 600; text-transform: uppercase; color: #C3A279; margin: 0; }
  ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
  li { font-size: 13px; color: rgba(255, 255, 255, 0.7); cursor: pointer; &:hover { color: #ffffff; } }
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
`;

export default function ProductDetail() {
  const history = useHistory();

  // 1. Отримуємо ID товару з URL
  const { productId } = useParams();

  // 2. Витягуємо об'єкт з даними
  const product = PRODUCTS_DATA[productId] || PRODUCTS_DATA.oak;

  // 3. Динамічна галерея зображень
  const galleryImages = product.images || [
    '/cat-dub.jpg',
    '/cat-yasen.jpg',
    '/cat-grab.jpg'
  ];

  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const [length, setLength] = useState(4.0);
  const [width, setWidth] = useState(3.2);
  const [area, setArea] = useState(14.4);
  const [packages, setPackages] = useState(6);
  const [totalPrice, setTotalPrice] = useState(
    Math.round(14.4 * product.pricePerM2)
  );

  const PRICE_PER_M2 = product.pricePerM2;
  const PACK_CAPACITY = product.packSqM;

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
          <HeaderIconButton onClick={() => history.push('/search')}>
            <IconSearch size={18} />
          </HeaderIconButton>
          <HeaderIconButton onClick={() => history.push('/favorites')}>
            <IconHeart size={18} />
          </HeaderIconButton>
          <HeaderIconButton onClick={() => history.push('/cart')}>
            <IconShoppingBag size={18} />
            <span className="cart-badge">0</span>
          </HeaderIconButton>
          <CallRequestBtn onClick={() => history.push('/contacts')}>
            Замовити дзвінок
          </CallRequestBtn>
        </RightHeaderSection>
      </HeaderContainer>

      {/* ── ОСНОВНИЙ КОНТЕНТ (ВЕРХНЯ ЧАСТИНА НА ТЕМНОМУ ГРАДІЄНТІ) ── */}
      <MainContainer>

        {/* ── ХЛІБНІ КРИХТИ ── */}
        <Breadcrumbs>
          <span onClick={() => history.push('/')}>Головна</span>
          <span className="separator">/</span>
          <span onClick={() => history.push('/catalog')}>Паркет</span>
          <span className="separator">/</span>
          <span className="current">Дуб European Nature</span>
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
                alt="Паркетна дошка Дуб European Nature"
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

                {/* 3D Кнопка вбудована в рядок мініатюр */}
                <VRButtonInGallery onClick={() => history.push('/hall')}>
                  <div className="vr-circle">3D</div>
                  <span className="vr-label">Переглянути<br/>в інтер'єрі</span>
                </VRButtonInGallery>
              </ThumbnailsRow>

              <SliderArrow onClick={() => setActiveImg(prev => prev < galleryImages.length - 1 ? prev + 1 : 0)}>
                ›
              </SliderArrow>
            </GalleryBottomPanel>
          </LeftGalleryWrapper>

          {/* Права картка товару (Кремова #F5EFEA) */}
          <RightInfoWrapper>
            <ProductDescriptionBlock>
              <HitBadge>Хіт продажів</HitBadge>
              <ProductTitle>Дуб European Nature</ProductTitle>
              <ProductSubtitle>Натуральний паркет</ProductSubtitle>

              <DescriptionText>
                Вишуканий паркет з натурального дуба європейського походження.
                Теплий натуральний відтінок та виразна текстура деревини створюють
                атмосферу затишку та елегантності у вашому домі.
              </DescriptionText>

              <SpecsGrid>
                <SpecItem><span className="label">Порода дерева</span><span className="value">Дуб</span></SpecItem>
                <SpecItem><span className="label">Сортування</span><span className="value">Nature</span></SpecItem>
                <SpecItem><span className="label">Покриття</span><span className="value">Матовий лак</span></SpecItem>
                <SpecItem><span className="label">Товщина</span><span className="value">14 мм</span></SpecItem>
                <SpecItem><span className="label">Ширина</span><span className="value">160 мм</span></SpecItem>
                <SpecItem><span className="label">Довжина</span><span className="value">400–2000 мм</span></SpecItem>
              </SpecsGrid>
            </ProductDescriptionBlock>

            <ProductActionsBlock>
              <PurchaseCard>
                <div className="price-row">
                  <span className="price-value">{PRICE_PER_M2.toLocaleString('uk-UA')}</span>
                  <span className="price-unit">грн / м²</span>
                </div>
                <div className="status"><span>✓</span> В наявності</div>
                <PrimaryButton>Додати в кошик</PrimaryButton>
                <SecondaryButton>Замовити зразок</SecondaryButton>
                <FavoriteLink>
                  <IconHeart size={14} />
                  <span>Додати до обраного</span>
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
                {activeTab === 'description' && (
                  <>
                    <p>
                      Паркетна дошка з дуба European Nature – це поєднання природної краси та інноваційних технологій виробництва. Кожна дошка має унікальний малюнок деревини та теплий натуральний відтінок.
                    </p>
                    <p>
                      Ідеально підходить для створення затишної атмосфери в будь-якому приміщенні – від класичних інтер'єрів до сучасних мінімалістичних рішень. Матове лакове покриття забезпечує надійний захист від зносу та полегшує догляд.
                    </p>
                  </>
                )}
                {activeTab === 'specs' && (
                  <p>
                    Детальні характеристики паркету включають сортування типу Nature, товщину зносостійкого шару 3.5 мм, загальну товщину дошки 14 мм, та сумісність з системами підігріву підлоги з максимальною температурою нагріву до 27°C.
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
              <li>вул. Наукова, 12, Львів</li>
              <li>+38 (067) 673 06 70</li>
              <li>parket_planet@i.ua</li>
              <li>Пн - Пт: 09:00 - 19:00</li>
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