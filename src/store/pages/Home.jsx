import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';

// 1. Головний контейнер з жорстким увімкненням скролу
const HomeWrapper = styled.div`
  background-color: #f6f3ee; /* Світло-кремове тло для всього сайту, як на макеті */
  color: #1a1a1a;
  height: 100vh;            /* Рівно на висоту екрану */
  width: 100vw;             /* Рівно на ширину екрану */
  overflow-y: scroll !important; /* Примусовий вертикальний скролл */
  overflow-x: hidden;
  position: relative;
  font-family: 'Helvetica Neue', sans-serif;
  box-sizing: border-box;
`;

// 2. Банер з ТВОЇМ ОРИГІНАЛЬНИМ зображенням (image_c71357.jpg)
const HeroSection = styled.section`
  height: 85vh;
  /* Підставляємо пряме посилання на файл з папки public та прибираємо темний градієнт, щоб кімната була світлою */
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 80%), 
              url('/hero-bg.jpg'); 
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0 80px;
  position: relative;
  color: #ffffff;
  
  /* ... весь інший код всередині HeroSection залишається без змін ... */
`;

const Badge = styled.span`
  color: #b9935a;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const HeroTitle = styled.h1`
  font-family: 'Times New Roman', serif;
  font-size: 56px;
  font-weight: 400;
  line-height: 1.15;
  max-width: 650px;
  margin: 0 0 25px 0;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 38px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 450px;
  line-height: 1.6;
  margin: 0 0 35px 0;
`;

const OrderButton = styled.button`
  background-color: #b9935a;
  color: #ffffff;
  border: none;
  padding: 15px 35px;
  font-size: 13px;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #a37c47;
    transform: translateY(-2px);
  }
`;

const ReviewBlock = styled.div`
  margin-top: 40px;
  display: flex;
  align-items: center;
  gap: 10px;

  .stars {
    color: #b9935a;
    font-size: 14px;
  }
  .text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }
`;

// 3. Секція карток категорій (image_c71283.jpg)
const CategoriesSection = styled.section`
  padding: 80px 80px 100px 80px;
  background-color: #f6f3ee; /* Преміальна кремова підкладка */
  max-width: 1440px;
  margin: 0 auto;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled.div`
  height: 320px;
  border-radius: 24px; /* Закруглені кути як на макеті */
  background: linear-gradient(to right, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 60%, rgba(0, 0, 0, 0) 100%), 
              url(${props => props.bg});
  background-size: cover;
  background-position: center;
  padding: 35px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  box-sizing: border-box;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  }

  .top-content {
    h3 {
      font-family: 'Times New Roman', serif;
      font-size: 26px;
      font-weight: 400;
      color: #ffffff;
      margin: 0 0 12px 0;
    }

    p {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      line-height: 1.5;
      max-width: 200px;
    }
  }

  .bottom-link {
    font-size: 13px;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 6px;
  }`;

export default function Home() {
  const history = useHistory();

  return (
    <HomeWrapper>
      <Header />

      <HeroSection>
        <Badge>Натуральна підлога</Badge>
        <HeroTitle>Еко-колекція дубових паркетів</HeroTitle>
        <HeroSubtitle>
          Натуральне дерево. Європейська якість. Створюємо затишок у вашому домі на довгі роки.
        </HeroSubtitle>
        
        <OrderButton onClick={() => history.push('/catalog')}>
          Переглянути колекцію ➔
        </OrderButton>

        <ReviewBlock>
          <div className="stars">★★★★★</div>
          <div className="text">Понад 500+ задоволених клієнтів</div>
        </ReviewBlock>
      </HeroSection>

      <CategoriesSection>
        <CategoriesGrid>
          
          {/* 1. Паркет */}
          <CategoryCard 
            bg="/parquet.jpg" /* Сюди підставиться твоє фото паркету з папки public */
            onClick={() => history.push('/catalog')}
          >
            <div className="top-content">
              <h3>Паркет</h3>
              <p>Натуральний масив дуба та інших порід дерева</p>
            </div>
            <div className="bottom-link">
              Дивитися колекцію <span style={{ marginLeft: '6px' }}>→</span>
            </div>
          </CategoryCard>

          {/* 2. Паркетна дошка */}
          <CategoryCard 
            bg="/board.jpg" /* Твоє фото паркетної дошки з папки public */
            onClick={() => history.push('/catalog')}
          >
            <div className="top-content">
              <h3>Паркетна дошка</h3>
              <p>Ідеальне поєднання міцності та краси</p>
            </div>
            <div className="bottom-link">
              Дивитися колекцію <span style={{ marginLeft: '6px' }}>→</span>
            </div>
          </CategoryCard>

          {/* 3. Ламінат */}
          <CategoryCard 
            bg="/laminate.jpg" /* Твоє фото ламінату з папки public */
            onClick={() => history.push('/catalog')}
          >
            <div className="top-content">
              <h3>Ламінат</h3>
              <p>Сучасний ламінат преміум класу</p>
            </div>
            <div className="bottom-link">
              Дивитися колекцію <span style={{ marginLeft: '6px' }}>→</span>
            </div>
          </CategoryCard>

          {/* 4. Аксесуари */}
          <CategoryCard 
            bg="/accessories.jpg" /* Твоє фото аксесуарів з папки public */
            onClick={() => history.push('/catalog')}
          >
            <div className="top-content">
              <h3>Аксесуари</h3>
              <p>Плінтуси, засоби для догляду та монтажу</p>
            </div>
            <div className="bottom-link">
              Дивитися колекцію <span style={{ marginLeft: '6px' }}>→</span>
            </div>
          </CategoryCard>

        </CategoriesGrid>
      </CategoriesSection>
    </HomeWrapper>
  );
}