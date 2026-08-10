import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { media } from '../utils/responsive';

/**
 * «Паркетні роботи» — scroll-driven композиція з семи фотографій.
 *
 * ДВА РІЗНІ РЕЖИМИ, а не стиснутий десктоп.
 *
 *   --pp-mode: 1 (десктоп і планшет) — секція пінниться (sticky) на 240vh
 *   пробігу. Поки її верх не дійшов до верху екрана, прогрес дорівнює нулю,
 *   і композиція лежить стосом у центрі. Далі кадр стоїть на місці, а
 *   фотографії розходяться по «редакційних» позиціях — асиметрично, різного
 *   розміру, з ледь помітним нахилом. Саме пін і гарантує, що анімація
 *   програється тоді, коли композиція повністю перед очима, а не до того.
 *
 *   --pp-mode: 0 (телефон) — окрема композиція: сім фото в перехресну
 *   колонку з великим вертикальним кроком. Кожна картка має ВЛАСНИЙ прогрес
 *   від свого положення на екрані: піднімаючись, вона виїжджає з центральної
 *   осі до свого краю. Сім великих фото фізично не вміщуються в один
 *   мобільний екран без накладань, тому тут композиція гортається.
 *
 * БЕЗ ВИЛЬОТУ ЗА ЕКРАН. Кінцеві позиції задані не в пікселях, а частками
 * (fx, fy) від максимально можливого зсуву, який рахується з РЕАЛЬНО
 * виміряних розмірів сцени та самої картки:
 *     maxX = (ширина сцени − ширина картки) / 2 − проміжок
 * Тому за будь-якої ширини екрана крайня картка в найгіршому разі впирається
 * в проміжок і фізично не може виїхати за межі секції.
 *
 * ПЛАВНІСТЬ. Сирий прогрес — лише ЦІЛЬ; намальоване значення кожної картки
 * підтягується до неї експоненційно (SMOOTHING_TAU), а вже поверх цього
 * лежить easeOutCubic. Один клік колеса не смикає композицію на крок.
 *
 * Розміри карток, висота сцени, крок колонки та режим живуть у CSS-змінних
 * і перемикаються медіазапитами. JS лише зчитує вже обчислені браузером
 * значення — жодних перевірок ширини вікна в JavaScript.
 */

/* Файли лежать у public/ під оригінальними іменами з пробілами
   (а «Parquet sanding» ще й .jpeg), тому шляхи проганяємо через encodeURI. */
const WORKS = [
  {
    key: 'plywood',
    src: '/Installation of plywood.jpg',
    title: 'Укладання фанери',
    fx: -0.957,
    fy: -0.851,
    k: 0.94,
    rot: -1.8,
    depth: 3,
    delay: 0.1,
    mfx: -0.97,
    mk: 1,
    mrot: -1.2,
    mdy: 0
  },
  {
    key: 'installation',
    src: '/Parquet installation.jpg',
    title: 'Укладання паркету',
    fx: 0.509,
    fy: -0.974,
    k: 1.02,
    rot: 1.4,
    depth: 4,
    delay: 0.16,
    mfx: 1,
    mk: 0.94,
    mrot: 1.0,
    mdy: -6
  },
  {
    key: 'sanding',
    src: '/Parquet sanding.jpeg',
    title: 'Шліфування',
    fx: -0.518,
    fy: 0.805,
    k: 1.1,
    rot: 1.1,
    depth: 5,
    delay: 0.06,
    mfx: -0.95,
    mk: 1.02,
    mrot: 1.3,
    mdy: 4
  },
  {
    key: 'puttying',
    src: '/Parquet puttying .jpg',
    title: 'Шпаклювання',
    fx: 0.961,
    fy: 0.303,
    k: 0.88,
    rot: -1.5,
    depth: 3,
    delay: 0.2,
    mfx: 1,
    mk: 1,
    mrot: -1.1,
    mdy: -4
  },
  {
    key: 'varnishing',
    src: '/Parquet varnishing.jpg',
    title: 'Лакування',
    fx: -0.957,
    fy: 0.995,
    k: 0.86,
    rot: 1.8,
    depth: 2,
    delay: 0.24,
    mfx: -1,
    mk: 0.96,
    mrot: 1.2,
    mdy: 6
  },
  {
    key: 'laminate',
    src: '/Laying laminate.jpg',
    title: 'Укладання ламінату',
    fx: 0.430,
    fy: 1,
    k: 1,
    rot: -1.2,
    depth: 4,
    delay: 0.13,
    mfx: 0.95,
    mk: 1,
    mrot: -1.3,
    mdy: -5
  },
  {
    key: 'plinth',
    src: '/Installation of plinth.jpg',
    title: 'Монтаж плінтуса',
    fx: 0.016,
    fy: -0.759,
    k: 1.2,
    rot: 0.6,
    depth: 6,
    delay: 0,
    mfx: -0.98,
    mk: 0.98,
    mrot: 0.8,
    mdy: 4
  }
];

/* До цього прогресу композиція повністю розкрита, далі — витримка */
const SPREAD_END = 0.78;

/* Стала часу демпфера, у секундах: більше — плавніше й «важче» */
const SMOOTHING_TAU = 0.16;

/* Мобільний режим: картка починає розходитися, коли її центр на цій частці
   висоти екрана, і повністю розходиться на цій */
const CARD_ENTER = 0.94;
const CARD_SETTLE = 0.52;

const clamp01 = value => (value < 0 ? 0 : value > 1 ? 1 : value);

/* Плавне гальмування наприкінці — рух «доїжджає», а не зупиняється */
const easeOut = value => 1 - Math.pow(1 - value, 3);

const Scene = styled.section`
  position: relative;
  width: 100%;
  height: 240vh;
  background-color: var(--pp-bg-alt);
  box-sizing: border-box;

  ${media.tablet} {
    height: 220vh;
  }

  ${media.mobile} {
    height: auto;
  }
`;

const Frame = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(32px, 4vh, 60px) 40px;
  box-sizing: border-box;

  ${media.tablet} {
    padding: clamp(28px, 3.5vh, 48px) 32px;
  }

  ${media.mobile} {
    position: static;
    height: auto;
    padding: clamp(56px, 8vh, 96px) 20px;
  }

  ${media.smallMobile} {
    padding: 52px 16px;
  }
`;

const Head = styled.header`
  width: 100%;
  max-width: 760px;
  text-align: center;
  margin: 0 0 clamp(28px, 4.5vh, 64px) 0;
  flex-shrink: 0;

  h2 {
    font-family: 'Times New Roman', serif;
    font-weight: 400;
    font-size: clamp(32px, 4.2vw, 66px);
    line-height: 1.12;
    letter-spacing: 0.01em;
    color: var(--pp-text);
    margin: 0 0 14px 0;
  }

  p {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 400;
    font-size: clamp(14px, 1.05vw, 17px);
    line-height: 1.65;
    letter-spacing: 0.03em;
    color: var(--pp-text-3);
    margin: 0 auto;
    max-width: 48ch;
  }

  ${media.mobile} {
    margin-bottom: clamp(32px, 5vh, 52px);
  }
`;

const Stage = styled.div`
  position: relative;
  width: 100%;
  max-width: 1600px;
  height: min(70vh, 800px);

  /* Уся геометрія композиції — тільки тут, у CSS */
  --pp-mode: 1;
  --pp-spread: 1;
  --pp-blur: 7px;
  --pp-row: 0px;
  --pp-card-w: clamp(170px, 13.6vw, 262px);
  --pp-card-h: clamp(215px, 17.2vw, 332px);

  ${media.tablet} {
    height: min(64vh, 540px);
    --pp-spread: 0.98;
    --pp-blur: 5px;
    --pp-card-w: clamp(140px, 15.2vw, 190px);
    --pp-card-h: clamp(178px, 19.2vw, 240px);
  }

  /* ── ТЕЛЕФОН: перехресна колонка замість стисненого десктопу ── */
  ${media.mobile} {
    --pp-mode: 0;
    --pp-blur: 4px;
    --pp-card-w: clamp(160px, 40vw, 240px);
    --pp-card-h: clamp(200px, 50vw, 300px);
    --pp-row: clamp(160px, 38vw, 230px);
    height: calc(var(--pp-row) * 6 + var(--pp-card-h) + 72px);
  }

  ${media.smallMobile} {
    --pp-card-w: clamp(140px, 42vw, 190px);
    --pp-card-h: clamp(175px, 52vw, 240px);
    --pp-row: clamp(140px, 40vw, 200px);
    height: calc(var(--pp-row) * 6 + var(--pp-card-h) + 60px);
  }

  /* Найвужчі екрани (320px): дві картки поруч мають розійтися без дотику,
     тому мінімальна ширина картки менша, ніж на 375px. */
  @media (max-width: 360px) {
    --pp-card-w: clamp(112px, 40vw, 140px);
    --pp-card-h: clamp(140px, 50vw, 175px);
    --pp-row: clamp(120px, 38vw, 150px);
    height: calc(var(--pp-row) * 6 + var(--pp-card-h) + 52px);
  }

  /* Вимірювальний щуп для кроку колонки.
     getComputedStyle() для НЕзареєстрованої кастомної властивості повертає
     сирий токен ("clamp(140px, 40vw, 200px)"), а не обчислені пікселі, —
     браузер не рахує математичні функції всередині --*. Тому крок читаємо
     з реальної висоти цього елемента, яку браузер уже порахував. */
  .pp-row-probe {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: var(--pp-row);
    visibility: hidden;
    pointer-events: none;
  }
`;

const Card = styled.figure`
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--pp-card-w) * var(--pp-k, 1));
  margin: 0;
  transform: translate(-50%, -50%);
  will-change: transform, opacity, filter;
  pointer-events: none;

  .pp-frame {
    width: 100%;
    height: calc(var(--pp-card-h) * var(--pp-k, 1));
    border-radius: 16px;
    overflow: hidden;
    background-color: var(--pp-placeholder);
    box-shadow: 0 26px 60px rgba(26, 26, 26, 0.16);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Підпис — читабельний, а не декоративна тінь */
  figcaption {
    display: block;
    margin-top: 14px;
    text-align: center;
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.45;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--pp-text-2);
    opacity: var(--pp-caption, 0);
  }

  ${media.tablet} {
    .pp-frame {
      border-radius: 12px;
      box-shadow: 0 18px 40px rgba(26, 26, 26, 0.15);
    }

    figcaption {
      margin-top: 11px;
      font-size: 10.5px;
      letter-spacing: 0.09em;
    }
  }

  ${media.mobile} {
    /* На телефоні діє власний множник розміру картки */
    width: calc(var(--pp-card-w) * var(--pp-mk, 1));

    .pp-frame {
      height: calc(var(--pp-card-h) * var(--pp-mk, 1));
      border-radius: 14px;
      box-shadow: 0 16px 34px rgba(26, 26, 26, 0.15);
    }

    figcaption {
      margin-top: 12px;
      font-size: 11.5px;
      letter-spacing: 0.1em;
    }
  }
`;

export default function WorksSection() {
  const sceneRef = useRef(null);
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const probeRef = useRef(null);
  const cardsRef = useRef([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const scene = sceneRef.current;
    const frame = frameRef.current;
    const stage = stageRef.current;
    const probe = probeRef.current;

    if (!scene || !frame || !stage) return undefined;

    const motion = !(
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    const count = WORKS.length;
    const layout = WORKS.map(() => ({ x: 0, y: 0 }));
    const targets = WORKS.map(() => 0);
    const currents = WORKS.map(() => 0);

    let pinned = true;
    let blur = 0;

    /* Один раз на монтуванні та на resize: зчитуємо реальні розміри сцени
       й карток і рахуємо, куди саме кожна може від'їхати. */
    const measure = () => {
      const styles = window.getComputedStyle(stage);
      const spread = parseFloat(styles.getPropertyValue('--pp-spread')) || 1;
      /* Крок колонки беремо з висоти щупа, а не з getPropertyValue:
         clamp() у кастомній властивості туди повертається як текст. */
      const row = probe ? probe.getBoundingClientRect().height : 0;
      const stageWidth = stage.offsetWidth;
      const stageHeight = stage.offsetHeight;
      const gutter = Math.min(20, Math.max(8, Math.round(stageWidth * 0.012)));

      pinned = (parseFloat(styles.getPropertyValue('--pp-mode')) || 0) > 0.5;
      blur = parseFloat(styles.getPropertyValue('--pp-blur')) || 0;

      WORKS.forEach((work, index) => {
        const card = cardsRef.current[index];

        if (!card) return;

        const maxX = Math.max(0, (stageWidth - card.offsetWidth) / 2 - gutter);
        const maxY = Math.max(0, (stageHeight - card.offsetHeight) / 2 - gutter);

        if (pinned) {
          layout[index] = { x: work.fx * maxX * spread, y: work.fy * maxY * spread };
        } else {
          /* Телефон: рядок фіксований (плюс невеликий збив, щоб колонка
             не читалася як таблиця), розходиться тільки горизонталь */
          layout[index] = {
            x: work.mfx * maxX,
            y: (index - (count - 1) / 2) * row + work.mdy
          };
        }
      });
    };

    const paint = () => {
      WORKS.forEach((work, index) => {
        const card = cardsRef.current[index];
        const place = layout[index];

        if (!card || !place) return;

        const t = easeOut(currents[index]);
        const scale = motion ? 0.86 + 0.14 * t : 1;
        const rotate = motion ? (pinned ? work.rot : work.mrot) * t : 0;
        const softness = blur * (1 - t);
        /* На телефоні картка ще й трохи підіймається, коли виїжджає */
        const lift = pinned || !motion ? 0 : 26 * (1 - t);

        card.style.transform =
          `translate(-50%, -50%) ` +
          `translate3d(${(place.x * t).toFixed(2)}px, ${(place.y + lift).toFixed(2)}px, 0) ` +
          `rotate(${rotate.toFixed(3)}deg) ` +
          `scale(${scale.toFixed(4)})`;

        card.style.opacity = clamp01(0.25 + t / 0.45).toFixed(4);
        card.style.filter = motion && softness > 0.15 ? `blur(${softness.toFixed(2)}px)` : 'none';
        card.style.setProperty('--pp-caption', clamp01((t - 0.55) / 0.35).toFixed(4));
      });
    };

    const readTargets = () => {
      if (pinned) {
        /* Прогрес пінінгу: 0 — верх секції ще не дійшов до верху екрана */
        const rect = scene.getBoundingClientRect();
        const travel = rect.height - frame.offsetHeight;
        const progress = travel > 0 ? clamp01(-rect.top / travel) : 0;

        WORKS.forEach((work, index) => {
          targets[index] = clamp01((progress - work.delay) / (SPREAD_END - work.delay));
        });

        return;
      }

      /* Телефон: у кожної картки власний прогрес від її ж положення.
         Центр беремо з розкладки, а не з getBoundingClientRect картки, —
         інакше анімація почала б впливати сама на себе. */
      const viewport = document.documentElement.clientHeight || window.innerHeight;
      const stageRect = stage.getBoundingClientRect();
      const middle = stageRect.top + stageRect.height / 2;
      const span = viewport * (CARD_ENTER - CARD_SETTLE);

      WORKS.forEach((work, index) => {
        const center = middle + layout[index].y;
        targets[index] = span > 0 ? clamp01((viewport * CARD_ENTER - center) / span) : 0;
      });
    };

    let lastTime = 0;

    const tick = now => {
      /* dt обмежуємо: після повернення з фонової вкладки він може бути
         величезним і «телепортувати» анімацію */
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 1 / 60;
      lastTime = now;

      const factor = 1 - Math.exp(-dt / SMOOTHING_TAU);
      let settled = true;

      for (let index = 0; index < count; index += 1) {
        currents[index] += (targets[index] - currents[index]) * factor;

        if (Math.abs(targets[index] - currents[index]) < 0.0002) {
          currents[index] = targets[index];
        } else {
          settled = false;
        }
      }

      paint();

      if (settled) {
        rafRef.current = 0;
        lastTime = 0;
      } else {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      readTargets();

      if (!motion) {
        for (let index = 0; index < count; index += 1) currents[index] = targets[index];
        paint();
        return;
      }

      if (!rafRef.current) {
        lastTime = 0;
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      measure();
      readTargets();
      for (let index = 0; index < count; index += 1) currents[index] = targets[index];
      paint();
    };

    onResize();

    /* Картинки міняють висоту картки тільки після завантаження —
       перерахуємо геометрію, коли всі підвантажаться */
    const images = Array.prototype.slice.call(stage.querySelectorAll('img'));
    images.forEach(image => {
      if (!image.complete) image.addEventListener('load', onResize);
    });

    /* capture: true — scroll не спливає, але у фазі перехоплення window бачить
       події і від вкладеного скрол-контейнера (HomeWrapper на десктопі). */
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      images.forEach(image => image.removeEventListener('load', onResize));
    };
  }, []);

  return (
    <Scene ref={sceneRef}>
      <Frame ref={frameRef}>
        <Head>
          <h2>Паркетні роботи</h2>
          <p>Повний цикл професійного укладання та реставрації паркету.</p>
        </Head>

        <Stage ref={stageRef}>
          <span className="pp-row-probe" aria-hidden="true" ref={probeRef} />

          {WORKS.map((work, index) => (
            <Card
              key={work.key}
              style={{ zIndex: work.depth, '--pp-k': work.k, '--pp-mk': work.mk }}
              ref={element => {
                cardsRef.current[index] = element;
              }}
            >
              <div className="pp-frame">
                <img src={encodeURI(work.src)} alt={work.title} loading="lazy" decoding="async" />
              </div>
              <figcaption>{work.title}</figcaption>
            </Card>
          ))}
        </Stage>
      </Frame>
    </Scene>
  );
}
