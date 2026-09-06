import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '../components/Header';
import Lightbox from '../components/Lightbox';
import { useGallery, loadGallery } from '../data/galleryStore';
import { media } from '../utils/responsive';

/**
 * Галерея колекції — /collection.
 *
 * Сюди веде кнопка «Переглянути колекцію» з головної сторінки.
 *
 * НЕ КАТАЛОГ. Сторінка не звертається ні до catalogStore, ні до shopStore,
 * ні до /api/categories — тут узагалі немає поняття товару, ціни чи
 * кошика. Фотографії приходять з /api/gallery, тобто з того самого
 * бекенда й тієї самої бази, що й решта даних адмін-панелі.
 *
 * Тексту на сторінці немає навмисно: жодних заголовків, підписів чи
 * описів. Слова є лише в alt і aria-label — вони не показуються, але
 * потрібні для скрінрідерів і для випадку, коли фото не завантажилось.
 *
 * Сітка рівномірна: усі картки однакового розміру й пропорції, кількість
 * колонок залежить лише від ширини екрана. Фотографій може бути скільки
 * завгодно — вони просто переносяться на наступний ряд.
 *
 * Тема береться зі змінних проєкту (--pp-bg / --pp-surface), тому денний
 * і нічний режими працюють без окремого коду. Самі фотографії ніяк не
 * підфарбовуються: жодного filter: brightness().
 */

/* Плавна поява знизу вгору — той самий почерк, що й у Hero на головній */
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

const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: var(--pp-bg);
  color: var(--pp-text);
  font-family: 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box;
`;

/**
 * Рівна сітка галереї.
 *
 * Ніякого masonry й ніяких «одне велике серед маленьких»: усі плитки
 * мають однакову ширину (частка колонки), однакову пропорцію
 * (aspect-ratio 1/1), однакові кути й однакові відступи. Кількість
 * фотографій ролі не грає — 4, 12 чи 50 розкладуться однаково рівно.
 */
const Grid = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: clamp(26px, 4vw, 56px) clamp(20px, 3vw, 40px) clamp(64px, 9vw, 120px);
  box-sizing: border-box;

  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(14px, 1.6vw, 22px);

  /* Планшет: 3 колонки */
  ${media.tablet} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: 26px 32px 72px 32px;
  }

  /* Телефон: 2 колонки — картки лишаються достатньо великими */
  ${media.mobile} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 18px 20px 56px 20px;
  }

  ${media.smallMobile} {
    padding: 14px 16px 48px 16px;
  }

  /* Дуже вузькі екрани: у дві колонки картка стала б ~135px —
     краще одна колонка на всю ширину */
  @media (max-width: 380px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Tile = styled.button`
  /* Це <button>, тому фон гасимо явно — інакше браузер підставить
     власний світлий ButtonFace */
  appearance: none;
  -webkit-appearance: none;
  background-color: var(--pp-surface);
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  display: block;
  width: 100%;
  position: relative;
  overflow: hidden;
  /* Однакова пропорція для всіх карток — саме вона тримає сітку рівною
     і не дає їй стрибати, поки фотографії ще вантажаться */
  aspect-ratio: 1 / 1;
  border-radius: clamp(12px, 1.2vw, 18px);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 10px 26px rgba(20, 15, 10, 0.09);
  transition: box-shadow 420ms cubic-bezier(0.16, 1, 0.3, 1);

  /* Поява: кожна наступна плитка трохи пізніше за попередню */
  opacity: 0;
  animation: ${riseIn} 720ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${props => props.$delay};
  will-change: opacity, transform;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: scale(1);
    transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Дуже легке затемнення поверх фото при наведенні */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(24, 18, 12, 0);
    transition: background-color 420ms cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  .peek {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 46px;
    height: 46px;
    margin: -23px 0 0 -23px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.55);
    background-color: rgba(255, 255, 255, 0.14);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 420ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;

    svg {
      width: 19px;
      height: 19px;
      stroke: #ffffff;
      fill: none;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  /* Тільки для справжнього курсора: на тачскріні hover «залипає»
     після тапу й ламає відчуття */
  @media (hover: hover) {
    &:hover {
      box-shadow: 0 22px 52px rgba(20, 15, 10, 0.18);
    }

    &:hover img {
      transform: scale(1.035);
    }

    &:hover::after {
      background-color: rgba(24, 18, 12, 0.16);
    }

    &:hover .peek {
      opacity: 1;
      transform: scale(1);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--pp-accent);
    outline-offset: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    animation: none;
    transition: none;

    img,
    &::after,
    .peek {
      transition: none;
    }

    @media (hover: hover) {
      &:hover img {
        transform: none;
      }
    }
  }
`;

/* Крок затримки між появою сусідніх фотографій. Обмежений стелею, щоб
   при великій кількості фото останні не з'являлися через півхвилини. */
const STAGGER_STEP = 70;
const STAGGER_START = 60;
const STAGGER_MAX = 640;

const revealDelay = index =>
  `${Math.min(STAGGER_START + index * STAGGER_STEP, STAGGER_MAX)}ms`;

const PeekIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="11" cy="11" r="7" />
    <line x1="16.2" y1="16.2" x2="21" y2="21" />
  </svg>
);

export default function Collection() {
  /* null — lightbox закритий. Іншого стану сторінці не потрібно,
     тому зайвих ре-рендерів немає. */
  const [openIndex, setOpenIndex] = useState(null);
  const photos = useGallery(state => state.photos);

  /* Свіжий список при кожному вході на сторінку: щойно додана в адмінці
     фотографія має з'явитися без перезавантаження вкладки */
  useEffect(() => {
    loadGallery();
  }, []);

  /* Якщо адміністратор видалив фото, поки відкритий lightbox, індекс може
     вийти за межі списку — тоді просто закриваємо перегляд */
  useEffect(() => {
    if (openIndex !== null && openIndex >= photos.length) setOpenIndex(null);
  }, [photos.length, openIndex]);

  return (
    <Page>
      <Header />

      <Grid>
        {photos.map((photo, index) => (
          <Tile
            key={photo.id || photo.src}
            type="button"
            $delay={revealDelay(index)}
            onClick={() => setOpenIndex(index)}
            aria-label={`Відкрити фото: ${photo.alt || 'фотографія колекції'}`}
          >
            <img
              src={photo.src}
              alt={photo.alt || ''}
              /* Перші картки потрібні одразу, решта — коли доскролять */
              loading={index < 4 ? 'eager' : 'lazy'}
              decoding="async"
              draggable="false"
            />
            <span className="peek" aria-hidden="true">
              <PeekIcon />
            </span>
          </Tile>
        ))}
      </Grid>

      <Lightbox
        photos={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </Page>
  );
}
