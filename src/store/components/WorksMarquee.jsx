import React from 'react';
import styled, { keyframes } from 'styled-components';
import { media } from '../utils/responsive';

/**
 * Рухомий рядок під секцією «Паркетні роботи».
 *
 * ЯК ЗРОБЛЕНО СВІТЛО В ЦЕНТРІ. Замість того, щоб анімувати кожне слово
 * з JS, тут лежать ДВІ однакові доріжки одна над одною:
 *
 *   • нижня — приглушена, сіра й розмита;
 *   • верхня — чітка, контрастна, але обрізана CSS-маскою так, що видима
 *     лише в центрі екрана й м'яко розчиняється до країв.
 *
 * Обидві рухаються однією й тією ж CSS-анімацією, тому завжди збігаються
 * піксель у піксель. Слово, проходячи центр, «проявляється» крізь маску —
 * виходить відчуття м'якого прожектора без жодного JavaScript, без
 * re-render'ів і без залежності від скролу.
 *
 * БЕЗШОВНИЙ ЦИКЛ. Список слів продубльований рівно двічі, а зсув іде на
 * -50% ширини доріжки. У момент повтору кадр збігається з початковим,
 * тому шва не видно.
 */

const WORDS = [
  'Шліфування',
  'Лакування',
  'Монтаж плінтуса',
  'Укладання ламінату',
  'Шпаклювання',
  'Укладання паркету',
  'Реставрація'
];

const scroll = keyframes`
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
`;

const Band = styled.section`
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: var(--pp-bg-alt);
  padding: clamp(28px, 5vh, 64px) 0;
  box-sizing: border-box;

  /* Краї рядка м'яко тануть у фон секції */
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0%,
    #000 12%,
    #000 88%,
    transparent 100%
  );
  mask-image: linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%);
`;

/* Спільна геометрія обох доріжок */
const Track = styled.div`
  display: flex;
  width: max-content;
  align-items: center;
  will-change: transform;
  animation: ${scroll} 46s linear infinite;

  ${media.tablet} {
    animation-duration: 38s;
  }

  ${media.mobile} {
    animation-duration: 30s;
  }

  /* Повага до системного налаштування: рух вимикається,
     рядок просто лишається читабельним */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Word = styled.span`
  font-family: 'Times New Roman', serif;
  font-weight: 400;
  font-size: clamp(30px, 5.4vw, 82px);
  line-height: 1.1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  padding: 0 clamp(18px, 2.4vw, 44px);
`;

const Dot = styled.span`
  width: clamp(6px, 0.6vw, 10px);
  height: clamp(6px, 0.6vw, 10px);
  border-radius: 50%;
  flex-shrink: 0;
  background-color: var(--pp-accent);
`;

/* Нижній шар: приглушений і трохи розмитий — це «поза світлом» */
const Dim = styled(Track)`
  color: var(--pp-text-3);
  filter: blur(1.6px);
  opacity: 0.5;

  ${media.mobile} {
    filter: blur(1.1px);
  }
`;

/* Верхній шар: різкий і темний, але видимий лише в центральній зоні */
const Lit = styled(Track)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  color: var(--pp-text);

  -webkit-mask-image: radial-gradient(
    60% 100% at 50% 50%,
    #000 0%,
    rgba(0, 0, 0, 0.85) 26%,
    rgba(0, 0, 0, 0.35) 48%,
    transparent 70%
  );
  mask-image: radial-gradient(
    60% 100% at 50% 50%,
    #000 0%,
    rgba(0, 0, 0, 0.85) 26%,
    rgba(0, 0, 0, 0.35) 48%,
    transparent 70%
  );

  /* На вузькому екрані пляма світла вужча, щоб фокус лишався помітним */
  ${media.mobile} {
    -webkit-mask-image: radial-gradient(
      78% 100% at 50% 50%,
      #000 0%,
      rgba(0, 0, 0, 0.85) 30%,
      rgba(0, 0, 0, 0.3) 55%,
      transparent 76%
    );
    mask-image: radial-gradient(
      78% 100% at 50% 50%,
      #000 0%,
      rgba(0, 0, 0, 0.85) 30%,
      rgba(0, 0, 0, 0.3) 55%,
      transparent 76%
    );
  }
`;

const Viewport = styled.div`
  position: relative;
`;

/* Один прохід списку. Рендеримо його двічі — звідси й безшовний цикл. */
const Sequence = () =>
  WORDS.map(word => (
    <React.Fragment key={word}>
      <Word>{word}</Word>
      <Dot />
    </React.Fragment>
  ));

export default function WorksMarquee() {
  return (
    <Band aria-label="Послуги: шліфування, лакування, монтаж плінтуса, укладання ламінату, шпаклювання, укладання паркету, реставрація">
      <Viewport aria-hidden="true">
        <Dim>
          <Sequence />
          <Sequence />
        </Dim>
        <Lit>
          <Sequence />
          <Sequence />
        </Lit>
      </Viewport>
    </Band>
  );
}
