import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import VideoScrollSection from '../components/VideoScrollSection';
import WorksSection from '../components/WorksSection';
import WorksMarquee from '../components/WorksMarquee';
import Footer from '../components/Footer';
import PremiumButton from '../components/PremiumButton';
import { useCatalog } from '../data/catalogStore';
import { CATEGORIES as STATIC_CATEGORIES } from '../data/categoriesData';
import { media } from '../utils/responsive';

// 1. Головний контейнер з жорстким увімкненням скролу
const HomeWrapper = styled.div`
  background-color: var(--pp-bg); /* Світло-кремове тло для всього сайту, як на макеті */
  color: var(--pp-text);
  height: 100vh;            /* Рівно на висоту екрану */
  width: 100vw;             /* Рівно на ширину екрану */
  overflow-y: scroll !important; /* Примусовий вертикальний скролл */
  overflow-x: hidden;
  position: relative;
  font-family: 'Helvetica Neue', sans-serif;
  box-sizing: border-box;

  /* ── ПЛАНШЕТ / МОБІЛЬНИЙ ──
     Віддаємо скрол самому документу: вкладений скрол-контейнер на телефоні
     ламає інерційний скрол iOS та ховання адресного рядка.
     100vw також прибираємо — саме воно дає горизонтальний скрол. */
  ${media.tablet} {
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 100vh;
    /* Саме visible на ОБОХ осях: якщо лишити overflow-x: hidden, браузер
       перерахує overflow-y на auto і контейнер знову стане скрол-портом,
       через що зламається sticky-хедер. Горизонтальний скрол відсікається
       глобально на html/body у src/styles.css. */
    overflow: visible !important;
  }
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

  ${media.tablet} {
    padding: 56px 40px;
    height: auto;
    min-height: 68vh;
  }

  ${media.mobile} {
    /* Трохи темніший градієнт — щоб білий текст читався поверх фото на малому екрані */
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.15) 60%, rgba(0, 0, 0, 0.35) 100%),
                url('/hero-bg.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: scroll;
    padding: 48px 20px 56px 20px;
    min-height: 78vh;
  }

  ${media.smallMobile} {
    padding: 40px 16px 48px 16px;
    min-height: 74vh;
  }
`;

/* Плавна поява Hero: opacity + невеликий підйом, з послідовною
   затримкою між елементами. Через CSS, а не JS — жодних re-render'ів
   і жодного впливу на скрол. */
const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const heroReveal = css`
  opacity: 0;
  animation: ${riseIn} 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${props => props.$delay || '0s'};
  will-change: opacity, transform;

  /* Користувач попросив менше руху — показуємо одразу, без анімації */
  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    animation: none;
  }
`;

const Badge = styled.span`
  ${heroReveal};
  color: var(--pp-accent);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  margin-bottom: 15px;

  ${media.mobile} {
    font-size: 11px;
    letter-spacing: 1.6px;
    margin-bottom: 12px;
  }
`;

const HeroTitle = styled.h1`
  ${heroReveal};
  font-family: 'Times New Roman', serif;
  font-size: 56px;
  font-weight: 400;
  line-height: 1.15;
  max-width: 650px;
  margin: 0 0 25px 0;
  letter-spacing: 0.5px;

  ${media.tablet} {
    font-size: 44px;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    font-size: 34px;
    line-height: 1.2;
    margin-bottom: 18px;
  }

  ${media.smallMobile} {
    font-size: 28px;
  }
`;

const HeroSubtitle = styled.p`
  ${heroReveal};
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  max-width: 450px;
  line-height: 1.6;
  margin: 0 0 35px 0;

  ${media.mobile} {
    font-size: 14px;
    max-width: 100%;
    margin-bottom: 28px;
  }

  ${media.smallMobile} {
    font-size: 13px;
  }
`;

/**
 * Обгортка головної CTA.
 *
 * Анімація появи живе САМЕ на обгортці, а не на самій кнопці. Причина
 * технічна: CSS-анімація з `forwards` перебиває значення transform, тож
 * якби riseIn стояв на кнопці, її hover-підйом і ефект натискання просто
 * не спрацьовували б після завершення появи. Розділивши шари, отримуємо
 * і плавний вхід, і живу кнопку.
 */
const HeroCtaWrap = styled.div`
  ${heroReveal};
  display: inline-flex;

  ${media.mobile} {
    width: 100%;
    /* Більше повітря від текстового блоку — лише на телефоні,
       десктопне положення не змінюється. Разом із нижнім відступом
       підзаголовка (28px) дає ~58px між описом і кнопкою. */
    margin-top: 30px;
  }

  ${media.smallMobile} {
    margin-top: 24px;
  }
`;

// 3. Секція карток категорій (image_c71283.jpg)
const CategoriesSection = styled.section`
  padding: 80px 80px 100px 80px;
  background-color: var(--pp-bg); /* Преміальна кремова підкладка */
  max-width: 1440px;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;

  ${media.tablet} {
    padding: 56px 40px 64px 40px;
  }

  @media (max-width: 768px) {
    padding: 40px 20px;
  }

  ${media.smallMobile} {
    padding: 32px 16px 40px 16px;
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
    gap: 16px;
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
  }

  ${media.mobile} {
    /* Затемнення зверху вниз — текст читається на всю ширину картки */
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.15) 55%, rgba(0, 0, 0, 0.5) 100%),
                url(${props => props.bg});
    background-size: cover;
    background-position: center;
    height: 220px;
    border-radius: 18px;
    padding: 24px 20px;

    /* На тач-екрані hover-«стрибок» тільки заважає */
    &:hover {
      transform: none;
      box-shadow: none;
    }

    .top-content {
      h3 {
        font-size: 22px;
        margin-bottom: 8px;
      }

      p {
        font-size: 12.5px;
        max-width: 100%;
      }
    }
  }

  ${media.smallMobile} {
    height: 190px;
    padding: 20px 16px;

    .top-content h3 {
      font-size: 20px;
    }
  }`;

export default function Home() {
  const history = useHistory();

  /* Картки категорій беруться з того самого стору, що й каталог, тому
     прев'ю, назва й порядок приходять з бази. Раніше і фото, і назви
     були захардкоджені прямо тут — через це зміна прев'ю в адмін-панелі
     не давала на сайті жодного ефекту. */
  const categories = useCatalog(state => state.categories);
  const order = useCatalog(state => state.order);

  const cards = order
    .map(slug => categories[slug])
    .filter(Boolean)
    .map(category => {
      /* Рекламний підпис на картці — це не поле каталогу, тому лежить
         поруч зі статичними даними. Для категорії, доданої в адмінці,
         показуємо її опис. */
      const preset = STATIC_CATEGORIES[category.slug];
      return {
        slug: category.slug,
        title: category.title,
        image: category.image,
        text: (preset && preset.cardText) || category.subtitle || ''
      };
    });

  return (
    <HomeWrapper>
      <Header />

      <HeroSection>
        <Badge $delay="0.15s">Натуральна підлога</Badge>
        <HeroTitle $delay="0.35s">Еко-колекція дубових паркетів</HeroTitle>
        <HeroSubtitle $delay="0.6s">
          Натуральне дерево. Європейська якість. Створюємо затишок у вашому домі на довгі роки.
        </HeroSubtitle>
        
        {/* Веде в галерею колекції, а не в каталог: каталог паркету
            лишається окремо на /parquet (картка «Паркет» нижче).
            Маршрут не змінювався — оновлено лише вигляд кнопки. */}
        <HeroCtaWrap $delay="0.85s">
          <PremiumButton
            size="lg"
            arrow
            block
            onClick={() => history.push('/collection')}
          >
            Переглянути колекцію
          </PremiumButton>
        </HeroCtaWrap>
      </HeroSection>

      <CategoriesSection>
        <CategoriesGrid>
          {cards.map(card => (
            <CategoryCard
              key={card.slug}
              bg={card.image}
              onClick={() => history.push(`/${card.slug}`)}
            >
              <div className="top-content">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
              <div className="bottom-link">
                Дивитися колекцію <span style={{ marginLeft: '6px' }}>→</span>
              </div>
            </CategoryCard>
          ))}
        </CategoriesGrid>
      </CategoriesSection>

      {/* Scroll-driven cinematic секція: відео + напис «Planeta Parket» */}
      <VideoScrollSection />

      {/* Scroll-driven композиція «Паркетні роботи» */}
      <WorksSection />

      {/* Рухомий рядок послуг зі світловим фокусом у центрі */}
      <WorksMarquee />

      <Footer />
    </HomeWrapper>
  );
}