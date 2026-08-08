import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';

const CatalogWrapper = styled.div`
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), 
              url('/catalog-hero.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  height: 100vh; /* Фіксуємо рівно на висоту екрану, щоб керувати простором */
  width: 100vw;
  color: #ffffff;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Запобігаємо зайвим зломаним скролам */
`;

const ContentContainer = styled.div`
  flex: 1;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 40px 30px 40px; /* Зменшили паддінги, щоб підняти все вгору */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Рівномірно розподіляє верх і картки */

  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;

// Зменшена, компактна верхня панель (як на макеті 2)
const TopMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px; /* Мінімальний відступ до карток */
  width: 100%;
`;

const HeaderLeft = styled.div`
  .breadcrumbs {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 4px;
    span { cursor: pointer; &:hover { color: #fff; } }
  }

  h1 {
    font-family: 'Times New Roman', serif;
    font-size: 38px; /* Акуратніший розмір головного напису */
    font-weight: 400;
    margin: 0 0 6px 0;
    letter-spacing: 0.5px;
  }

  p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    max-width: 600px;
    line-height: 1.4;
    margin: 0;
  }
`;

const SortSelect = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color 0.3s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  flex: 1; /* Сітка забирає весь доступний простір по висоті */
  max-height: calc(100vh - 180px); /* Обмеження, щоб картки не вилітали за екран */
`;

const ProductCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%; /* Картка автоматично розтягується під розмір сітки */
  min-height: 450px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  }
`;

// Збільшено фото-зону продукту (тепер вона домінує, як на макеті)
const CardImageArea = styled.div`
  flex: 1; /* Займає максимум місця, роблячи фото великим */
  background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%), 
              url(${props => props.bg});
  background-size: cover;
  background-position: center;
  padding: 24px;
  display: flex;
  align-items: flex-end;
  box-sizing: border-box;

  h2 {
    font-family: 'Times New Roman', serif;
    font-size: 32px;
    font-weight: 400;
    color: #ffffff;
    margin: 0;
    line-height: 1.1;
  }
`;

// Стиснута та підтягнута вгору інфо-зона
const CardInfoArea = styled.div`
  background: rgba(86, 68, 52, 0.75); 
  padding: 20px 24px; /* Компактніші відступи */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  gap: 18px; /* Фіксована відстань до кнопки */
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 10px; /* Компактна сітка характеристик */
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .icon-wrapper { 
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: rgba(255, 255, 255, 0.7);
      stroke-width: 1.5;
    }
  }
  
  .text {
    display: flex;
    flex-direction: column;
    
    span:first-child { 
      font-size: 10px; 
      color: rgba(255, 255, 255, 0.5);
    }
    span:last-child { 
      font-size: 13px; 
      font-weight: 400; 
      color: #ffffff;
      margin-top: 1px;
    }
  }
`;

const DetailButton = styled.button`
  background: rgba(135, 110, 86, 0.6);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  width: 100%;
  padding: 11px; /* Тонша кнопка, щоб не з'їдати висоту */
  border-radius: 20px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.3s, border-color 0.3s;

  &:hover {
    background: rgba(135, 110, 86, 0.9);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

// SVG іконки
const TreeIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2L3 17h6v5h6v-5h6L12 2z" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const SortIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const JointIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M6 9h12M6 15h12M9 6v12M15 6v12" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const PolishIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18M5 5l14 14M19 5L5 14" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

export default function Catalog() {
  const history = useHistory();

  return (
    <CatalogWrapper>
      <Header />
      <ContentContainer>
        
        <TopMeta>
          <HeaderLeft>
            <div className="breadcrumbs">
              <span onClick={() => history.push('/')}>Головна</span> &gt; <span>Паркет</span>
            </div>
            <h1>Паркет</h1>
            <p>Натуральний паркет преміум якості. Європейське дерево.</p>
          </HeaderLeft>
          <SortSelect>Сортування: Популярні <span>▼</span></SortSelect>
        </TopMeta>

        <ProductsGrid>
          
          {/* Картка 1 */}
          <ProductCard>
            <CardImageArea bg="/cat-dub.jpg">
              <h2>Паркет<br />Дуб</h2>
            </CardImageArea>
            <CardInfoArea>
              <SpecsGrid>
                <SpecItem>
                  <div className="icon-wrapper"><TreeIcon /></div>
                  <div className="text"><span>Порода дерева</span><span>Дуб</span></div>
                </SpecItem>
                <SpecItem>
                  <div className="icon-wrapper"><SortIcon /></div>
                  <div className="text"><span>Сортування</span><span>Рустік / Селект</span></div>
                </SpecItem>
                <SpecItem>
                  <div className="icon-wrapper"><JointIcon /></div>
                  <div className="text"><span>Тип з'єднання</span><span>Шип-паз</span></div>
                </SpecItem>
                <SpecItem>
                  <div className="icon-wrapper"><PolishIcon /></div>
                  <div className="text"><span>Покриття</span><span>Олія / Лак</span></div>
                </SpecItem>
              </SpecsGrid>
              <DetailButton onClick={() => history.push('/product/oak')}>
                Детальніше <span>→</span>
              </DetailButton>
            </CardInfoArea>
          </ProductCard>

          {/* Картка 2 */}
          <ProductCard>
            <CardImageArea bg="/cat-yasen.jpg">
              <h2>Паркет<br />Ясен</h2>
            </CardImageArea>
            <CardInfoArea>
              <SpecsGrid>
                <SpecItem>
                  <div className="icon-wrapper"><TreeIcon /></div>
                  <div className="text"><span>Порода дерева</span><span>Ясен</span></div>
                </SpecItem>
                <SpecItem>
                  <div className="icon-wrapper"><SortIcon /></div>
                  <div className="text"><span>Сортування</span><span>Селект</span></div>
                </SpecItem>
                <SpecItem>
                  <div className="icon-wrapper"><JointIcon /></div>
                  <div className="text"><span>Тип з'єднання</span><span>Шип-паз</span></div>
                </SpecItem>
                <SpecItem>
                  <div className="icon-wrapper"><PolishIcon /></div>
                  <div className="text"><span>Покриття</span><span>Олія / Лак</span></div>
                </SpecItem>
              </SpecsGrid>
              <DetailButton onClick={() => history.push('/product/ash')}>
                Детальніше <span>→</span>
              </DetailButton>
            </CardInfoArea>
          </ProductCard>

          {/* Картка 3 */}
          <ProductCard>
            <CardImageArea bg="/cat-grab.jpg">
              <h2>Паркет<br />Граб</h2>
            </CardImageArea>
            <CardInfoArea>
              <SpecsGrid>
                <SpecItem>
                  <div className="icon-wrapper"><TreeIcon /></div>
                  <div className="text"><span>Порода дерева</span><span>Граб</span></div>
                </SpecItem>
                <SpecItem>
                  <div className="icon-wrapper"><SortIcon /></div>
                  <div className="text"><span>Сортування</span><span>Селект</span></div>
                </SpecItem>
                <SpecItem>
                  <div className="icon-wrapper"><JointIcon /></div>
                  <div className="text"><span>Тип з'єднання</span><span>Шип-паз</span></div>
                </SpecItem>
                <SpecItem>
                  <div className="icon-wrapper"><PolishIcon /></div>
                  <div className="text"><span>Покриття</span><span>Олія / Лак</span></div>
                </SpecItem>
              </SpecsGrid>
              <DetailButton onClick={() => history.push('/product/hornbeam')}>
                Детальніше <span>→</span>
              </DetailButton>
            </CardInfoArea>
          </ProductCard>

        </ProductsGrid>
      </ContentContainer>
    </CatalogWrapper>
  );
}