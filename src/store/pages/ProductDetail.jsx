
import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useHistory } from 'react-router-dom';

/* ================= ГЛОБАЛЬНІ СТИЛІ ДЛЯ СКИДАННЯ ОБМЕЖЕНЬ СКРОЛУ ================= */
const GlobalScrollStyle = createGlobalStyle`
  html, body, #root {
    height: auto !important;
    min-height: 100vh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    margin: 0;
    padding: 0;
    background-color: #F4EFEA;
  }
`;

/* ================= СТРУКТУРА СТОРІНКИ ТА СКРОЛ ================= */
const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: #F4EFEA; /* Суцільний кремово-бежевий фон для всієї сторінки */
  color: #1a1613;
  display: flex;
  flex-direction: column;
  overflow-y: visible; /* Дозволяємо природний скрол */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  box-sizing: border-box;
`;

/* ================= ТВІЙ ОРИГІНАЛЬНИЙ HEADER ЗІ СКРІНШОТУ ================= */
const HeaderContainer = styled.header`
  background: linear-gradient(180deg, #0f141c 0%, #0a0d14 100%);
  padding: 18px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-family: 'Helvetica Neue', sans-serif;
  box-sizing: border-box;
  width: 100%;
  flex-shrink: 0; /* Щоб хедер не стискався при великому контенті */
  z-index: 10;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  .logo-circle {
    width: 24px;
    height: 24px;
    border: 1.5px solid #b9935a;
    border-radius: 50%;
    display: inline-block;
  }

  h1 {
    font-family: 'Times New Roman', serif;
    font-size: 20px;
    font-weight: 400;
    letter-spacing: 2.5px;
    color: #ffffff;
    margin: 0;
    text-transform: uppercase;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 35px;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  
  .icon-box {
    color: #ffffff;
    display: flex;
    align-items: center;
    opacity: 0.9;
    
    svg {
      stroke: #ffffff;
      fill: none;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .label {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.2px;
    }
    
    .sub-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 1px;
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
`;

const CartIcon = styled.div`
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.9;
  transition: transform 0.2s;

  svg {
    stroke: #ffffff;
    fill: none;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    transform: scale(1.05);
    opacity: 1;
  }
`;

const VisualBtn = styled.button`
  background-color: #b9935a;
  color: #ffffff;
  border: none;
  padding: 11px 26px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 4px 12px rgba(185, 147, 90, 0.15);

  &:hover {
    background-color: #a37f4c;
    transform: translateY(-1px);
  }
`;

/* ================= КОНТЕЙНЕР ОСНОВНОГО КОНТЕНТУ ================= */
const MainContainer = styled.main`
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 45px;
  flex-grow: 1;
`;

const Breadcrumbs = styled.div`
  font-size: 14px;
  color: #8e8a86;
  margin-bottom: -15px;
  z-index: 2;

  span {
    cursor: pointer;
    transition: 0.2s;
    &:hover { color: #1a1613; }
  }
`;

/* ================= ВЕРХНІЙ КОНТЕЙНЕР З ДЕРЕВ'ЯНИМ ГРАДІЄНТОМ ================= */
const ProductMainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
  /* Преміальний 5-точковий градієнт тільки для верхньої секції */
  background: linear-gradient(to right, #1a1613 0%, #352f2a 25%, #4e463e 50%, #635a51 75%, #70665b 100%);
  padding: 30px;
  border-radius: 24px;
  box-shadow: 0 10px 45px rgba(0, 0, 0, 0.15);

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    background: #25201d; /* Спрощений темний фон для мобільної сітки */
  }
`;

/* ================= ЛІВА СЕКЦІЯ (ГАЛЕРЕЯ) ================= */
const LeftGalleryWrapper = styled.div`
  background: transparent; /* Безшовна інтеграція з градієнтом */
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MainImage = styled.img`
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block;
  opacity: 0.9;
  transition: transform 0.4s ease;
`;

const MainImageCard = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1.2 / 1;
  border-radius: 24px;
  overflow: hidden !important; /* Надійне обрізання картинки */
  background: #231e1a;
  transform: translateZ(0); /* Запобігає багам обрізання в WebKit */
  -webkit-transform: translateZ(0);
  isolation: isolate;
 
  &:hover ${MainImage} {
    transform: scale(1.03);
  }
`;

const ImageBadgesOverlay = styled.div`
  position: absolute;
  top: 30px;
  left: 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 2;
  pointer-events: none;
`;

const BadgeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);

  .avatar-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #ffffff;
    border: 1.5px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(2px);
  }
`;

const MediaBottomControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const SliderControlsBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SliderArrow = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 22px;
  cursor: pointer;
  user-select: none;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ThumbnailsContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const ThumbItem = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.active ? '#ffffff' : 'transparent'};
  box-sizing: border-box;
  transition: 0.2s;
  opacity: ${props => props.active ? '1' : '0.55'};
  &:hover { opacity: 0.95; }
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const VRButton = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  transition: 0.2s;
 
  &:hover {
    color: #ffffff;
    .icon-3d {
      border-color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .icon-3d {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: #ffffff;
    transition: 0.2s;
  }
  .arrow { font-size: 14px; color: rgba(255, 255, 255, 0.5); }
`;

/* ================= ПРАВА СЕКЦІЯ (КРЕМОВО-БЕЖЕВА КАРТКА) ================= */
const RightInfoWrapper = styled.div`
  background: #F4EFEA; /* Чистий крем-беж для контенту характеристик */
  color: #1a1613;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 40px;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ProductDescriptionBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const HitBadge = styled.div`
  display: inline-block;
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 30px;
  background: rgba(0, 0, 0, 0.04);
  color: #7c6853;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 20px;
`;

const ProductTitle = styled.h1`
  font-size: 38px;
  font-family: 'Times New Roman', Times, serif;
  font-weight: 400;
  color: #1a1613;
  margin: 0 0 8px 0;
  line-height: 1.1;
`;

const ProductSubtitle = styled.div`
  font-size: 14px;
  color: #8e8a86;
  margin-bottom: 24px;
`;

const DescriptionText = styled.p`
  font-size: 15px;
  color: #57524e;
  line-height: 1.6;
  margin: 0 0 35px 0;
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  .label { font-size: 12px; color: #a19c98; text-transform: uppercase; letter-spacing: 0.5px; }
  .value { font-size: 15px; font-weight: 600; color: #1a1613; }
`;

const ProductActionsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PurchaseCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.015);
  display: flex;
  flex-direction: column;

  .price-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 6px; }
  .price-value { font-size: 38px; font-weight: 800; color: #1a1613; letter-spacing: -0.5px; }
  .price-unit { font-size: 14px; color: #57524e; font-weight: 500; }
  .status { font-size: 13px; color: #588f67; display: flex; align-items: center; gap: 6px; margin-bottom: 24px; font-weight: 500; }
`;

const PrimaryButton = styled.button`
  background: #c3a279;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-bottom: 12px;
  width: 100%;
  letter-spacing: 0.5px;
  
  &:hover { background: #b29168; }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #1a1613;
  border: 1.5px solid #1a1613;
  border-radius: 8px;
  padding: 15px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 16px;
  width: 100%;
  letter-spacing: 0.5px;
  
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

const FavoriteLink = styled.div`
  font-size: 13px;
  color: #57524e;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover { color: #1a1613; }
`;

/* ================= КОМПАКТНИЙ КАЛЬКУЛЯТОР ================= */
const CalculatorCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px; /* Зафіксовані компактні відступи */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;

  .calc-title { font-size: 14px; font-weight: 700; color: #1a1613; margin-bottom: 2px; }
  .calc-subtitle { font-size: 11px; color: #8e8a86; margin-bottom: 12px; line-height: 1.3; }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;

  label { font-size: 11.5px; color: #57524e; }
  input {
    width: 60px;
    height: 28px;
    padding: 0 6px;
    border: none;
    border-radius: 6px;
    background: #eae3db;
    font-size: 12px;
    color: #1a1613;
    text-align: center;
    font-weight: 600;
    outline: none;
    box-sizing: border-box;
   
    &:focus { background: #d5cdc5; }
  }
`;

const CalculateButton = styled.button`
  background: #25201d;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  height: 36px; /* Чітко зафіксована компактна висота */
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  margin-bottom: 12px;
  width: 100%;
  transition: opacity 0.2s;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
 
  &:hover { opacity: 0.9; }
`;

const ResultsBlock = styled.div`
  border-top: 1px solid #f0eae4;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .result-line {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #57524e;
   
    span:last-child { font-weight: 600; color: #1a1613; }
  }
  .total-line {
    font-size: 13px;
    font-weight: 700;
    color: #1a1613;
    margin-top: 2px;
   
    span:last-child { font-size: 14px; color: #1a1613; }
  }
`;

/* ================= НИЖНЯ ПЛАШКА ПЕРЕВАГ ================= */
const BenefitsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 40px;
  padding: 40px 0;
  border-top: 1.5px solid rgba(26, 22, 19, 0.08);
  border-bottom: 1.5px solid rgba(26, 22, 19, 0.08);
  margin-top: 20px;
  margin-bottom: 20px;

  @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); gap: 30px; }
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 1px solid rgba(26, 22, 19, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1a1613;
    background: rgba(26, 22, 19, 0.03);
    flex-shrink: 0;
  }

  .text-block { display: flex; flex-direction: column; gap: 4px; }
  .title { font-size: 14px; font-weight: 700; color: #1a1613; line-height: 1.3; }
  .subtitle { font-size: 12px; color: #756f6a; line-height: 1.3; }
`;

/* ================= СЕКЦІЯ ТАБІВ ТА КОНСУЛЬТАЦІЇ ================= */
const InfoFooterSectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1.35fr 0.65fr;
  gap: 40px;
  align-items: start;
  margin-bottom: 40px;
  width: 100%;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const TabsWrapper = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
`;

const TabHeader = styled.div`
  display: flex;
  gap: 30px;
  border-bottom: 1.5px solid rgba(26, 22, 19, 0.08);
  margin-bottom: 30px;
  overflow-x: auto;
 
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabTitle = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.active ? '#1a1613' : '#8e8a86'};
  padding-bottom: 14px;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
  white-space: nowrap;

  &:after {
    content: '';
    position: absolute;
    bottom: -1.5px;
    left: 0;
    width: 100%;
    height: 2px;
    background: #c3a279;
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.2s;
  }

  &:hover { color: #1a1613; }
`;

const TabContent = styled.div`
  font-size: 15px;
  color: #57524e;
  line-height: 1.7;

  p { margin: 0 0 20px 0; }
`;

const ConsultationBanner = styled.div`
  background: linear-gradient(135deg, #25201d 0%, #151210 100%);
  border-radius: 16px;
  padding: 40px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 280px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
`;

const ConsultationContent = styled.div`
  z-index: 1;
  max-width: 80%;
`;

const ConsultationTitle = styled.h3`
  font-size: 24px;
  font-family: 'Times New Roman', Times, serif;
  font-weight: 400;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
`;

const ConsultationText = styled.p`
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0 0 30px 0;
`;

const ConsultationButton = styled.button`
  background: #c3a279;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  z-index: 1;
  transition: background 0.3s;
 
  &:hover { background: #b29168; }
`;

/* ================= ПРЕМІАЛЬНИЙ FOOTER ================= */
const FooterContainer = styled.footer`
  background: #0a0d14;
  padding: 60px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-family: 'Helvetica Neue', sans-serif;
  color: #ffffff;
  box-sizing: border-box;
  width: 100%;
  flex-shrink: 0;
`;

const FooterGrid = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
 
  @media (max-width: 992px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 576px) { grid-template-columns: 1fr; }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
 
  h4 {
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #b9935a;
    margin: 0;
  }
 
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
 
  li {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: color 0.2s;
   
    &:hover { color: #ffffff; }
  }
`;

const FooterBottom = styled.div`
  max-width: 1440px;
  margin: 40px auto 0 auto;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
 
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
`;

export default function ProductDetail() {
  const history = useHistory();

  const galleryImages = [
    '/cat-dub.jpg',
    '/cat-yasen.jpg',
    '/cat-grab.jpg',
    '/cat-dub-dark.jpg'
  ];

  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  // Стейт калькулятора (початкові дані для матчу зі скріншотом)
  const [length, setLength] = useState(4.5);
  const [width, setWidth] = useState(3.2);
  const [area, setArea] = useState(14.4);
  const [packages, setPackages] = useState(8);
  const [totalPrice, setTotalPrice] = useState(55440);

  const PRICE_PER_M2 = 3850;
  const PACK_CAPACITY = 1.8;

  const handleCalculate = () => {
    const calculatedArea = parseFloat((length * width).toFixed(1));
    const calculatedPackages = Math.ceil(calculatedArea / PACK_CAPACITY);
    const calculatedPrice = Math.round(calculatedArea * PRICE_PER_M2);

    setArea(calculatedArea);
    setPackages(calculatedPackages);
    setTotalPrice(calculatedPrice);
  };

  return (
    <PageWrapper>
      <GlobalScrollStyle />
     
      {/* TVIY ORIGINAL HEADER */}
      <HeaderContainer>
        <LogoSection onClick={() => history.push('/')}>
          <div className="logo-circle" />
          <h1>Parket Planet</h1>
        </LogoSection>

        <NavLinks>
          {/* Оплата */}
          <NavItem>
            <div className="icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <div className="content">
              <span className="label">Оплата</span>
            </div>
          </NavItem>

          {/* Доставка */}
          <NavItem>
            <div className="icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7" />
                <path d="M14 18H8.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <path d="M19 13h3l-3-4V4" />
              </svg>
            </div>
            <div className="content">
              <span className="label">Доставка</span>
            </div>
          </NavItem>

          {/* E-mail */}
          <NavItem>
            <div className="icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div className="content">
              <span className="label">E-mail</span>
              <span className="sub-label">parket_planet@i.ua</span>
            </div>
          </NavItem>

          {/* Телефон */}
          <NavItem>
            <div className="icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div className="content">
              <span className="label">Телефон</span>
              <span className="sub-label">+38 (067) 673 06 70</span>
            </div>
          </NavItem>
        </NavLinks>

        <RightSection>
          <CartIcon onClick={() => history.push('/cart')}>
            <svg width="22" height="22" viewBox="0 0 24 24">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </CartIcon>
          <VisualBtn onClick={() => history.push('/hall')}>
            3D Візуалізація
          </VisualBtn>
        </RightSection>
      </HeaderContainer>

      {/* ОСНОВНИЙ КОНТЕНТ */}
      <MainContainer>
        <Breadcrumbs>
          <span onClick={() => history.push('/')}>Головна</span> /{' '}
          <span onClick={() => history.push('/catalog')}>Паркет</span> /{' '}
          <span>Дуб European Nature</span>
        </Breadcrumbs>

        <ProductMainGrid>
          {/* Ліва Галерея в єдиному карт-контейнері */}
          <LeftGalleryWrapper>
            <MainImageCard>
              <ImageBadgesOverlay>
                <BadgeItem>
                  <div className="avatar-icon">⬡</div>
                  <span>Натуральне дерево</span>
                </BadgeItem>
                <BadgeItem>
                  <div className="avatar-icon">⬡</div>
                  <span>Екологічно чистий продукт</span>
                </BadgeItem>
                <BadgeItem>
                  <div className="avatar-icon">⬡</div>
                  <span>Підходить для теплої підлоги</span>
                </BadgeItem>
                <BadgeItem>
                  <div className="avatar-icon">⬡</div>
                  <span>Зроблено в Європі</span>
                </BadgeItem>
              </ImageBadgesOverlay>

              <MainImage src={galleryImages[activeImg]} alt="Паркетна дошка" />
            </MainImageCard>

            <MediaBottomControls>
              <SliderControlsBlock>
                <SliderArrow onClick={() => setActiveImg(prev => prev > 0 ? prev - 1 : galleryImages.length - 1)}>‹</SliderArrow>
               
                <ThumbnailsContainer>
                  {galleryImages.map((img, idx) => (
                    <ThumbItem key={idx} active={idx === activeImg} onClick={() => setActiveImg(idx)}>
                      <img src={img} alt={`Мініатюра ${idx + 1}`} />
                    </ThumbItem>
                  ))}
                </ThumbnailsContainer>

                <SliderArrow onClick={() => setActiveImg(prev => prev < galleryImages.length - 1 ? prev + 1 : 0)}>›</SliderArrow>
              </SliderControlsBlock>

              <VRButton onClick={() => history.push('/hall')}>
                <div className="icon-3d">3D</div>
                <span>Переглянути в інтерʼєрі</span>
                <span className="arrow">›</span>
              </VRButton>
            </MediaBottomControls>
          </LeftGalleryWrapper>

          {/* Права частина (двоколонкова картка на кремово-бежевому фоні) */}
          <RightInfoWrapper>
            <ProductDescriptionBlock>
              <HitBadge>Хіт продажів</HitBadge>
              <ProductTitle>Дуб European Nature</ProductTitle>
              <ProductSubtitle>Натуральний паркет</ProductSubtitle>
             
              <DescriptionText>
                Вишуканий паркет з натурального дуба Європейського походження.
                Теплий натуральний відтінок та виразна текстура дерева створюють
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Додати до обраного
                </FavoriteLink>
              </PurchaseCard>

              <CalculatorCard>
                <span className="calc-title">Калькулятор підлоги</span>
                <span className="calc-subtitle">Розрахуйте кількість матеріалу для вашої кімнати</span>

                <InputRow>
                  <label htmlFor="length-input">Довжина кімнати (м)</label>
                  <input id="length-input" type="number" step="0.1" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0)} />
                </InputRow>
                <InputRow>
                  <label htmlFor="width-input">Ширина кімнати (м)</label>
                  <input id="width-input" type="number" step="0.1" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} />
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

        {/* Переваги */}
        <BenefitsBar>
          <BenefitItem>
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 12l10 5 10-5M2 17l10 5 10-5"/>
              </svg>
            </div>
            <div className="text-block">
              <span className="title">100% натуральне дерево</span>
              <span className="subtitle">Екологічний чистий матеріал</span>
            </div>
          </BenefitItem>
          <BenefitItem>
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div className="text-block">
              <span className="title">Європейська якість</span>
              <span className="subtitle">Від перевірених виробників</span>
            </div>
          </BenefitItem>
          <BenefitItem>
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="text-block">
              <span className="title">Гарантія до 25 років</span>
              <span className="subtitle">Впевнені в нашій якості</span>
            </div>
          </BenefitItem>
          <BenefitItem>
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-7.6-4.7 8.38 8.38 0 0 1-3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <div className="text-block">
              <span className="title">Професійна консультація</span>
              <span className="subtitle">Допоможемо з вибором</span>
            </div>
          </BenefitItem>
        </BenefitsBar>

        {/* Секція Табів та Консультаційного Баннеру */}
        <InfoFooterSectionGrid>
          <TabsWrapper>
            <TabHeader>
              <TabTitle active={activeTab === 'description'} onClick={() => setActiveTab('description')}>
                Опис
              </TabTitle>
              <TabTitle active={activeTab === 'specs'} onClick={() => setActiveTab('specs')}>
                Характеристики
              </TabTitle>
              <TabTitle active={activeTab === 'delivery'} onClick={() => setActiveTab('delivery')}>
                Доставка та оплата
              </TabTitle>
              <TabTitle active={activeTab === 'warranty'} onClick={() => setActiveTab('warranty')}>
                Гарантія
              </TabTitle>
              <TabTitle active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
                Відгуки (24)
              </TabTitle>
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
                  Детальні характеристики паркету включають сортування типу Nature, товщину зносостійкого шару 3.5 мм, загальну товщину дошки 14 мм, та сумісність з системами підігріву підлоги з максимальною температуною нагріву до 27°C.
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
                Наші спеціалісти допоможуть обрати ідеальний паркет для вашого дому.
              </ConsultationText>
            </ConsultationContent>
            <ConsultationButton>Отримати консультацію</ConsultationButton>
          </ConsultationBanner>
        </InfoFooterSectionGrid>

      </MainContainer>

      {/* ПРЕМІАЛЬНИЙ FOOTER */}
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
