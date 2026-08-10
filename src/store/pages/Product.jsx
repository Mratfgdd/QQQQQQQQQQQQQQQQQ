import React, { useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import { media } from '../utils/responsive';

const PageWrapper = styled.div`
  background-color: #ece6df; /* Твій новий преміальний світлий фон */
  color: #333333;            /* Темний текст для читабельності на світлому */
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  position: relative;
  overflow-y: visible !important; /* Дозволяємо браузеру скролити сторінку вниз */
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', sans-serif;
`;

const MainContent = styled.main`
  padding: 40px 60px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 50px;
  flex: 1; /* Змушує контент займати всю доступну висоту, але не затискає його */

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 20px;
  }

  ${media.mobile} {
    padding: 20px 16px 32px 16px;
    gap: 24px;
  }

  ${media.smallMobile} {
    padding: 16px 12px 28px 12px;
  }
`;

const Breadcrumbs = styled.div`
  grid-column: 1 / -1;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.4); /* Змінено на темний напівпрозорий під світлий фон */
  margin-bottom: 10px;
  span { margin: 0 8px; }

  ${media.mobile} {
    line-height: 1.5;
    span { margin: 0 5px; }
  }
`;

// Ліва частина: Галерея зображень
const GallerySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0;

  .main-img {
    width: 100%;
    height: 480px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .thumbs-row {
    display: flex;
    gap: 12px;

    img {
      width: 80px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.1);
      &:hover { border-color: #b9935a; }
    }
  }

  ${media.tablet} {
    .main-img { height: 380px; }
  }

  ${media.mobile} {
    gap: 12px;

    /* Головне фото по ширині екрану з фіксованою пропорцією */
    .main-img {
      height: auto;
      aspect-ratio: 4 / 3;
    }

    /* Мініатюри скролляться горизонтально, а не ламають ширину сторінки */
    .thumbs-row {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar { display: none; }

      img { flex-shrink: 0; }
    }
  }
`;

// Права частина: Інфо та Калькулятор
const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ProductHeader = styled.div`
  margin-bottom: 25px;

  .badge {
    background: rgba(185, 147, 90, 0.15);
    color: #b9935a;
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 10px;
    font-weight: 500;
  }

  h2 {
    font-family: 'Times New Roman', serif;
    font-size: 36px;
    font-weight: 400;
    margin: 0 0 8px 0;
  }

  .type {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }

  ${media.mobile} {
    margin-bottom: 20px;

    h2 { font-size: 28px; }
  }

  ${media.smallMobile} {
    h2 { font-size: 24px; }
  }
`;

const PriceBox = styled.div`
  font-size: 28px;
  font-weight: 300;
  margin-bottom: 25px;
  span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin-left: 5px;
  }
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px 0;
  margin-bottom: 30px;

  .spec-item {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    div {
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
      margin-top: 4px;
    }
  }

  ${media.mobile} {
    gap: 16px 14px;
    margin-bottom: 24px;
  }
`;

// Блок Калькулятора підлоги
const CalculatorBox = styled.div`
  background-color: #121212;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;

  h4 {
    margin: 0 0 15px 0;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .inputs-row {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }

  .input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);

    input {
      background-color: #1a1a1a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      padding: 10px;
      color: #fff;
      font-size: 14px;
      &:focus { border-color: #b9935a; outline: none; }
    }
  }

  .results {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 13px;

    .res-row {
      display: flex;
      justify-content: space-between;
      color: rgba(255, 255, 255, 0.5);
      span { color: #fff; font-weight: 500; }
      &.total {
        font-size: 16px;
        color: #fff;
        span { color: #b9935a; font-size: 18px; }
      }
    }
  }

  ${media.mobile} {
    padding: 20px 18px;

    /* Два поля вводу поруч занадто вузькі на телефоні */
    .inputs-row {
      flex-direction: column;
      gap: 14px;
    }

    .input-group input {
      min-height: 44px;
      /* 16px — інакше iOS Safari зумить сторінку при фокусі */
      font-size: 16px;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  button {
    padding: 14px;
    font-size: 13px;
    letter-spacing: 0.5px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
  }

  ${media.tablet} {
    button {
      min-height: 48px;
      font-size: 14px;
    }
  }

  .add-to-cart {
    background-color: #b9935a;
    color: #fff;
    border: none;
    &:hover { background-color: #a37f4c; }
  }

  .order-sample {
    background-color: transparent;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover { border-color: #fff; background-color: rgba(255,255,255,0.02); }
  }
`;

export default function Product() {
  const [length, setLength] = useState(4.5);
  const [width, setWidth] = useState(3.2);

  const pricePerM2 = 3850;
  const areaInPack = 1.8; // кв.м в одній упаковці

  // Математичні розрахунки
  const totalArea = parseFloat((length * width).toFixed(2)) || 0;
  const totalPacks = Math.ceil(totalArea / areaInPack) || 0;
  const totalPrice = Math.round(totalArea * pricePerM2);

  return (
    <PageWrapper>
      <Header />

      <MainContent>
        <Breadcrumbs>
          Головна <span>/</span> Паркет <span>/</span> Дуб European Nature
        </Breadcrumbs>

        {/* Ліворуч: Фото */}
        <GallerySection>
          <img 
            className="main-img" 
            src="https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80" 
            alt="Дуб European Nature" 
          />
          <div className="thumbs-row">
            <img src="https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=150&q=80" alt="thumb" />
            <img src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=150&q=80" alt="thumb" />
            <img src="https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?auto=format&fit=crop&w=150&q=80" alt="thumb" />
          </div>
        </GallerySection>

        {/* Праворуч: Спеки та Калькулятор */}
        <InfoSection>
          <ProductHeader>
            <div className="badge">🔥 Хіт продажів</div>
            <h2>Дуб European Nature</h2>
            <div className="type">Натуральний паркет</div>
          </ProductHeader>

          <PriceBox>
            {pricePerM2.toLocaleString()} грн <span>/ м²</span>
          </PriceBox>

          <SpecsGrid>
            <div className="spec-item">🌳 Порода дерева <div>Дуб</div></div>
            <div className="spec-item">⚱️ Сортування <div>Nature</div></div>
            <div className="spec-item">✨ Покриття <div>Матовий лак</div></div>
            <div className="spec-item">📏 Товщина <div>14 мм</div></div>
            <div className="spec-item">📐 Ширина <div>160 мм</div></div>
            <div className="spec-item">⛓️ Довжина <div>400-2000 мм</div></div>
          </SpecsGrid>

          {/* Інтерактивний калькулятор */}
          <CalculatorBox>
            <h4>Калькулятор підлоги</h4>
            <div className="inputs-row">
              <div className="input-group">
                <label>Довжина кімнати (м)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={length} 
                  onChange={(e) => setLength(parseFloat(e.target.value) || 0)} 
                />
              </div>
              <div className="input-group">
                <label>Ширина кімнати (м)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={width} 
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>

            <div className="results">
              <div className="res-row">
                Площа: <span>{totalArea} м²</span>
              </div>
              <div className="res-row">
                Кількість упаковок: <span>{totalPacks} шт.</span>
              </div>
              <div className="res-row total">
                Загальна сума: <span>{totalPrice.toLocaleString()} грн</span>
              </div>
            </div>
          </CalculatorBox>

          <ActionButtons>
            <button className="add-to-cart">Додати в кошик</button>
            <button className="order-sample">Замовити зразок</button>
          </ActionButtons>
        </InfoSection>
      </MainContent>

     
    </PageWrapper>
  );
}