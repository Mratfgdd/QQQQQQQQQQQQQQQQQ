import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useLocation } from 'react-router-dom';
import { media } from '../utils/responsive';

/**
 * Вступна заставка PARKET PLANET.
 *
 * Сценарій (усього ~2.6 c):
 *   0.00–0.15  чорний екран;
 *   0.15–1.00  назва проявляється з motion-blur, стискаючи трекінг —
 *              ефект «наведення різкості» об'єктивом, а не банальний fade;
 *   0.85–1.70  тонка світлова смуга проходить крізь напис і згасає,
 *              одночасно під ним прокреслюється золота лінія;
 *   1.20–2.00  дрібний підпис проявляється;
 *   2.00–2.60  вся заставка йде вгору з легким blur — cinematic-перехід.
 *
 * ІНЖЕНЕРНІ РІШЕННЯ:
 *
 * • Анімуються ЛИШЕ opacity / transform / filter — властивості, які
 *   браузер вміє малювати на композиторі, тому кадр не залежить від
 *   layout і 60 FPS тримається навіть на слабкому телефоні. Жодного
 *   відео, жодних зовнішніх ресурсів — заставка важить кілька кілобайт
 *   CSS і не затримує завантаження сайту.
 *
 * • Оверлей `position: fixed` поверх усього: він не займає місця в потоці,
 *   тому layout shift неможливий у принципі. Сайт під ним малюється й
 *   вантажиться нормально — заставка нічого не блокує.
 *
 * • Показуємо ОДИН раз на сесію вкладки (sessionStorage). Переходи між
 *   сторінками її не перезапускають; нове відкриття сайту — запускає.
 *
 * • prefers-reduced-motion — заставки немає взагалі.
 *
 * • На /hall (3D-візуалізатор) і /admin заставка не з'являється: у 3D
 *   свій завантажувач, а адмінка — робочий інструмент.
 */

const STORAGE_KEY = 'pp-intro-played';

/* Ключові точки таймінгу (мс). Тримаємо їх в одному місці, щоб JS-таймер
   розмонтування й CSS-анімації не розповзалися. */
const OUT_DELAY = 2000;
const OUT_DURATION = 600;
const TOTAL = OUT_DELAY + OUT_DURATION;

/* Спокійний режим (prefers-reduced-motion): руху немає, тому й тримати
   заставку довго немає сенсу — коротка поява й вихід */
const STILL_TOTAL = 1500;

const SKIP_PREFIXES = ['/hall', '/admin'];

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function alreadyPlayed() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch (error) {
    /* Приватний режим — вважаємо, що ще не показували */
    return false;
  }
}

function rememberPlayed() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, '1');
  } catch (error) {
    /* Немає доступу до сховища — заставка просто програється ще раз */
  }
}

/* ── Анімації ── */

/* Поява назви: «наведення різкості». Blur + розтягнутий трекінг +
   мікро-масштаб сходяться в різкий кадр. */
const focusIn = keyframes`
  0% {
    opacity: 0;
    filter: blur(22px);
    transform: translate3d(0, 14px, 0) scale(1.06);
    letter-spacing: 0.42em;
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0) scale(1);
    letter-spacing: 0.16em;
  }
`;

/* Світло, що проходить ПО ЛІТЕРАХ.

   Рухається не окрема смуга поверх напису, а положення градієнта, яким
   залито сам текст (background-clip: text). Різниця принципова: смуга
   поверх тексту — це прямокутник, і на чорному тлі видно його краї, через
   що ефект читається як сірий блок. Залитий текст світиться рівно там, де
   є літери, — саме так виглядає світло, що ковзає по матеріалу. */
/* ДІАПАЗОН 100% → 0% ОБОВ'ЯЗКОВИЙ.

   У відсотках background-position рахується від різниці розмірів
   контейнера й картинки. Оскільки градієнт ширший за текст (260%),
   будь-яке значення ПОЗА проміжком 0…100% зсуває його так, що частина
   літер лишається без заливки, — а при background-clip: text «без
   заливки» означає «прозоро», тобто літери просто зникають. Саме через
   значення 128% / −28% на телефоні від напису лишалося «KET / ANET».

   У межах 0…100% градієнт завжди перекриває текст повністю, а світло
   все одно проходить наскрізь: воно сидить у середині картинки, тож на
   краях діапазону лишається за межами напису. */
const shine = keyframes`
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0% 0;
  }
`;

/* Золота лінія під написом: прокреслюється від центру й трохи згасає */
const drawLine = keyframes`
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  40% {
    opacity: 1;
  }
  100% {
    opacity: 0.55;
    transform: scaleX(1);
  }
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

/* Вихід: заставка йде вгору, розмивається й зникає */
const curtainOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
  to {
    opacity: 0;
    transform: scale(1.05) translate3d(0, -1.5%, 0);
    filter: blur(10px);
  }
`;

/* Ледь помітне «дихання» світла за текстом — глибина без яскравості */
const breathe = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

/* Версії для prefers-reduced-motion: тільки прозорість, жодного руху */
const stillIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const stillOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const Root = styled.div`
  position: fixed;
  /* Явні координати, а не лише inset: старіші Safari його не розуміють,
     і заставка схлопнулась би в точку */
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050505;
  /* Оверлей ловить дотики й колесо — сторінка під ним не прокручується */
  touch-action: none;
  overscroll-behavior: contain;
  overflow: hidden;
  will-change: opacity, transform, filter;

  animation: ${curtainOut} ${OUT_DURATION}ms cubic-bezier(0.7, 0, 0.84, 0)
    ${OUT_DELAY}ms both;

  /* ── СПОКІЙНИЙ РЕЖИМ ──
     Раніше тут заставка вимикалася повністю, і користувач із вимкненими
     анімаціями (у Windows це один прапорець «Показувати анімації», і
     він частіше увімкнений, ніж здається) не бачив її ніколи. Тепер
     заставка є завжди — просто без руху: чисте затемнення й коротка
     пауза замість blur, світлової смуги та cinematic-виходу. */
  @media (prefers-reduced-motion: reduce) {
    animation: ${stillOut} 300ms ease ${STILL_TOTAL - 300}ms both;

    &::before {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }

  /* Дуже м'яке світло по центру — щоб чорний не був «плоским» */
  &::before {
    content: '';
    position: absolute;
    width: 120vmax;
    height: 120vmax;
    background: radial-gradient(
      circle,
      rgba(185, 147, 90, 0.16) 0%,
      rgba(185, 147, 90, 0.05) 32%,
      rgba(0, 0, 0, 0) 62%
    );
    animation: ${breathe} 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
    pointer-events: none;
  }
`;

const Stage = styled.div`
  position: relative;
  padding: 0 24px;
  text-align: center;
  max-width: 100%;
`;

/* Обгортка напису. overflow навмисно НЕ ховаємо: на початку появи текст
   розмитий на 22px, і обрізання дало б видиму прямокутну межу розмиття. */
const TitleShell = styled.div`
  position: relative;
  padding: 0.12em 0.06em;
`;

const wordBase = css`
  display: inline-block;
  font-family: 'Times New Roman', serif;
  font-weight: 400;
  /* Базовий колір лишається: якщо браузер не вміє background-clip: text,
     напис просто буде рівно кремовим, а не зникне */
  color: #f3ece2;
  text-transform: uppercase;
  line-height: 1.02;
  white-space: nowrap;
  /* Базовий трекінг заданий і поза анімацією: у спокійному режимі
     keyframes вимкнені, і без цього рядка напис був би без розрядки */
  letter-spacing: 0.16em;
  will-change: opacity, transform, filter;

  /* Заливка тексту: рівний кремовий + вузьке світло всередині.
     Ширина 260% дозволяє світлу проїхати наскрізь. */
  background-image: linear-gradient(
    100deg,
    #e3d8c6 0%,
    #e3d8c6 38%,
    #f6efe3 46%,
    #ffffff 50%,
    #f6efe3 54%,
    #e3d8c6 62%,
    #e3d8c6 100%
  );
  background-size: 260% 100%;
  background-position: 100% 0;
  background-repeat: no-repeat;

  @supports (-webkit-background-clip: text) or (background-clip: text) {
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  animation: ${focusIn} 900ms cubic-bezier(0.16, 1, 0.3, 1) both,
    ${shine} 900ms cubic-bezier(0.42, 0, 0.24, 1) 820ms both;

  @media (prefers-reduced-motion: reduce) {
    filter: none;
    transform: none;
    /* Рівна заливка без світлової плями — 0% показує базовий колір */
    background-position: 0 0;
    animation: ${stillIn} 260ms ease both;
  }
`;

const Title = styled.h1`
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.02em;
  font-size: clamp(34px, 8.2vw, 104px);

  /* На вузькому екрані слова одне під одним читаються навіть краще —
     це не «зменшений десктоп», а власна композиція */
  ${media.mobile} {
    font-size: clamp(30px, 12.5vw, 60px);
    gap: 0.06em;
  }

  /* Затримки задаються ПАРОЮ — по одній на кожну анімацію (поява, світло).
     Якщо написати одне значення, воно застосується до обох, і світло
     побіжить одночасно з появою, ще до того, як напис стане різким. */
  .word-1 {
    ${wordBase};
    animation-delay: 150ms, 820ms;
  }

  /* Другий рядок трохи пізніше — світло йде по напису навскіс */
  .word-2 {
    ${wordBase};
    animation-delay: 300ms, 910ms;
    color: #e7dcc9;
  }
`;

const Underline = styled.span`
  display: block;
  height: 1px;
  margin: 22px auto 0 auto;
  width: min(360px, 62vw);
  transform-origin: 50% 50%;
  background: linear-gradient(
    90deg,
    rgba(185, 147, 90, 0) 0%,
    rgba(216, 184, 130, 0.9) 50%,
    rgba(185, 147, 90, 0) 100%
  );
  animation: ${drawLine} 800ms cubic-bezier(0.16, 1, 0.3, 1) 900ms both;

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    animation: ${stillIn} 260ms ease 120ms both;
  }

  ${media.mobile} {
    margin-top: 16px;
  }
`;

const Tagline = styled.p`
  margin: 18px 0 0 0;
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 11px;
  letter-spacing: 0.38em;
  text-transform: uppercase;
  color: rgba(243, 236, 226, 0.5);
  /* Трекінг візуально зміщує рядок вправо — компенсуємо */
  text-indent: 0.38em;
  animation: ${fadeUp} 700ms cubic-bezier(0.16, 1, 0.3, 1) 1200ms both;

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    animation: ${stillIn} 260ms ease 220ms both;
  }

  ${media.mobile} {
    font-size: 9px;
    letter-spacing: 0.3em;
    text-indent: 0.3em;
    margin-top: 14px;
  }
`;

export default function IntroOverlay() {
  const location = useLocation();

  /* Рішення ухвалюється синхронно на першому рендері: якщо заставку
     показувати не треба, вона не з'явиться навіть на один кадр.

     ЩО ТУТ НАВМИСНО НЕ ПЕРЕВІРЯЄТЬСЯ — prefers-reduced-motion. Раніше
     ця умова вимикала заставку повністю, і на машині з вимкненими
     анімаціями її не було видно ніколи. Тепер спокійний режим лише
     прибирає рух (див. media-запити у стилях вище), а сама заставка
     показується всім. */
  const [visible, setVisible] = useState(() => {
    const path = location.pathname || '/';
    if (SKIP_PREFIXES.some(prefix => path.indexOf(prefix) === 0)) return false;

    /* ?intro у адресі — примусовий показ. Потрібен, щоб перевірити
       заставку, не закриваючи вкладку: sessionStorage переживає F5. */
    if (location.search && location.search.indexOf('intro') >= 0) return true;

    return !alreadyPlayed();
  });

  useEffect(() => {
    if (!visible) return undefined;

    /* Позначаємо одразу: якщо користувач піде на іншу сторінку в
       середині анімації, повторно вона не запуститься */
    rememberPlayed();

    const duration = prefersReducedMotion() ? STILL_TOTAL : TOTAL;
    const timer = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    /* Стабільний клас — щоб заставку можна було знайти і в тестах,
       і в DevTools, не покладаючись на згенероване ім'я класу */
    <Root className="pp-intro" aria-hidden="true">
      <Stage>
        <TitleShell>
          <Title>
            <span className="word-1">Parket</span>
            <span className="word-2">Planet</span>
          </Title>
        </TitleShell>
        <Underline />
        <Tagline>Натуральна підлога</Tagline>
      </Stage>
    </Root>
  );
}
