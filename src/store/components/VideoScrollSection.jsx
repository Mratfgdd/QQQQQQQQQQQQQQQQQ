import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { media } from '../utils/responsive';

/**
 * Cinematic scroll-driven секція головної сторінки.
 *
 * Сценарій (керується scroll progress, повністю reversible):
 *
 *   0.00 → 0.28   ВІДЕО грає і повільно «наїжджає», поступово тоне в чорному
 *   0.28 → 0.32   повністю ЧОРНИЙ екран
 *   0.32 → 0.56   у чорному «прорізається» логотип PLANETA PARKET —
 *                 всередині букв видно те саме відео, що й далі грає
 *   0.56 → 0.60   логотип тримається
 *   0.60 → 0.84   лого-локап трохи піднімається, під ним проявляється текст
 *   0.84 → 1.00   фінальна композиція тримається
 *
 * ПЛАВНІСТЬ. Сирий scroll progress ніколи не малюється напряму: він є лише
 * ЦІЛЛЮ, до якої кожен кадр експоненційно наближається намальоване значення
 * (див. SMOOTHING_TAU). Через це один клік колеса не смикає картинку на крок,
 * а плавно «доганяє» її за ~0.3 c. Коефіцієнт рахується через dt, тому темп
 * однаковий і на 60 Hz, і на 120 Hz екрані. Зверху на це накладено smoothstep
 * у кожній фазі — тобто кожен стан ще й входить та виходить без ривка.
 *
 * ЧОМУ currentTime НЕ ПРИВ'ЯЗАНИЙ ДО СКРОЛУ. Перемотка MP4 скролом і є тим
 * «перескакуванням кадрів»: браузер на seek стрибає на найближчий keyframe.
 * Тому відео грає безперервно (це завжди плавно), а до скролу прив'язані
 * затемнення, логотип, текст і повільний наїзд — вони анімуються на GPU.
 *
 * ЕФЕКТ «ВІДЕО ВСЕРЕДИНІ БУКВ». Поверх відео лежить один SVG-шар: чорний
 * прямокутник на весь екран з SVG-маскою. У масці білий прямокутник
 * (біле = чорне видно) і текст логотипу. Коли fill-opacity тексту йде 0 → 1,
 * літери в масці чорніють, тобто стають ДІРКАМИ в чорному шарі — крізь них
 * видно відео. Один шар, без кросфейдів, тому фон не «дихає».
 *
 * Чому не GSAP ScrollTrigger, хоч gsap 3.4.2 і є в проєкті: на десктопі
 * скрол-портом є не window, а HomeWrapper (height: 100vh; overflow-y: scroll),
 * а на планшеті/телефоні — сам документ. ScrollTrigger довелося б тримати в
 * matchMedia з різним `scroller`, а його `pin` перебудовує DOM навколо секції.
 * Нативний rAF + getBoundingClientRect не залежить від того, який елемент
 * скролиться, і не чіпає верстку сторінки.
 */

const VIDEO_SRC = '/video/video_parkett.mp4';
const MASK_ID = 'pp-logo-knockout';

/* Межі фаз у частках загального прогресу секції */
const DARK_END = 0.28;
const LOGO_START = 0.32;
const LOGO_END = 0.56;
const SAY_START = 0.6;
const SAY_END = 0.84;

/* Стала часу демпфера, у секундах. Більше — плавніше й «важче»,
   менше — різкіше. 0.14 c дає преміальний glide без відчуття лагу. */
const SMOOTHING_TAU = 0.14;

/* Наскільки світлішають літери поверх відео — щоб логотип читався навіть
   на темному кадрі. Свідомо ледь помітно. */
const LOGO_TINT = 0.14;

/* На скільки (у частках кегля логотипу) лого-локап підіймається,
   звільняючи місце під текст */
const LOGO_LIFT = 0.4;

const clamp01 = value => (value < 0 ? 0 : value > 1 ? 1 : value);

/* Плавний вхід і вихід — без ривків на краях діапазону */
const smoothstep = value => value * value * (3 - 2 * value);

const phase = (value, from, to) => smoothstep(clamp01((value - from) / (to - from)));

const Scene = styled.section`
  position: relative;
  width: 100%;
  height: 380vh;
  background-color: #000000;
  box-sizing: border-box;

  ${media.tablet} {
    height: 340vh;
  }

  ${media.mobile} {
    height: 300vh;
  }
`;

const Stage = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000000;
  box-sizing: border-box;

  /* Кегль логотипу живе в одній змінній: від нього ж рахуються позиції
     лінії-роздільника та тексту, тому композиція не розповзається
     на жодній ширині екрана. */
  --pp-logo-size: clamp(60px, 11vw, 190px);

  ${media.tablet} {
    --pp-logo-size: clamp(52px, 12vw, 120px);
  }

  ${media.mobile} {
    --pp-logo-size: clamp(42px, 13vw, 88px);

    /* svh — щоб адресний рядок мобільного браузера не смикав висоту сцени */
    @supports (height: 100svh) {
      height: 100svh;
    }
  }

  ${media.smallMobile} {
    --pp-logo-size: clamp(34px, 13vw, 60px);
  }

  /* Телефон у горизонтальній орієнтації: місця по висоті майже немає */
  @media (orientation: landscape) and (max-height: 560px) {
    --pp-logo-size: clamp(26px, 9vh, 52px);
  }
`;

const Video = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1);
  will-change: transform;
  pointer-events: none;
`;

const Overlay = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0;
  will-change: opacity;
  pointer-events: none;

  .pp-logo {
    font-family: 'Times New Roman', serif;
    font-weight: 400;
    font-size: var(--pp-logo-size);
    letter-spacing: 0.05em;

    ${media.mobile} {
      letter-spacing: 0.04em;
    }
  }

  /* Два рядки логотипу, оптично відцентровані відносно середини екрана */
  .pp-logo--top {
    transform: translateY(-0.12em);
  }

  .pp-logo--bottom {
    transform: translateY(0.78em);
  }
`;

const Divider = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50% + var(--pp-logo-size) * 1.1);
  display: flex;
  justify-content: center;
  opacity: 0;
  will-change: opacity, transform;
  pointer-events: none;

  span {
    display: block;
    width: calc(var(--pp-logo-size) * 0.55);
    min-width: 48px;
    max-width: 140px;
    height: 1px;
    background-color: rgba(245, 239, 234, 0.5);
  }
`;

const Statement = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50% + var(--pp-logo-size) * 1.62);
  padding: 0 24px;
  text-align: center;
  opacity: 0;
  will-change: opacity, transform;
  pointer-events: none;
  box-sizing: border-box;

  h3 {
    font-family: 'Times New Roman', serif;
    font-weight: 400;
    font-size: clamp(22px, 2.5vw, 40px);
    line-height: 1.3;
    letter-spacing: 0.01em;
    color: #f5efea;
    margin: 0 auto 16px auto;
    max-width: 20ch;
  }

  p {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 400;
    font-size: clamp(13px, 1.05vw, 16px);
    line-height: 1.75;
    letter-spacing: 0.06em;
    color: rgba(245, 239, 234, 0.6);
    margin: 0 auto;
    max-width: 34ch;
  }

  /* Десктоп: підняти блок вище.
     Коефіцієнт 1.62 рахується від кегля логотипу, а той на широкому
     екрані доходить до 190px — виходило 50% + 308px. На ноутбуках із
     невеликою висотою (1280×720, 1440×800) підзаголовок опинявся майже
     впритул до нижньої межі сцени. 1.34 лишає ту саму композицію, але
     повертає повітря знизу. Планшет і телефон не зачіпаються: там кегль
     менший і блок і так стоїть нормально. */
  ${media.desktopOnly} {
    top: calc(50% + var(--pp-logo-size) * 1.34);
  }

  ${media.mobile} {
    padding: 0 20px;

    h3 {
      margin-bottom: 12px;
    }
  }
`;

export default function VideoScrollSection() {
  const sceneRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const maskGroupRef = useRef(null);
  const tintGroupRef = useRef(null);
  const logoTextRef = useRef(null);
  const dividerRef = useRef(null);
  const statementRef = useRef(null);

  const rafRef = useRef(0);

  useEffect(() => {
    const scene = sceneRef.current;
    const stage = stageRef.current;
    const overlay = overlayRef.current;
    const maskGroup = maskGroupRef.current;
    const tintGroup = tintGroupRef.current;
    const logoText = logoTextRef.current;
    const divider = dividerRef.current;
    const statement = statementRef.current;
    const video = videoRef.current;

    if (!scene || !stage || !overlay || !maskGroup || !tintGroup) return undefined;
    if (!logoText || !divider || !statement) return undefined;

    /* React 16 виставляє muted як DOM-property вже після вставки елемента —
       дублюємо вручну, інакше iOS Safari може заблокувати autoplay. */
    const startPlayback = () => {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute('muted', '');
      const played = video.play();
      if (played && typeof played.catch === 'function') {
        played.catch(() => {});
      }
    };

    startPlayback();

    if (video) {
      video.addEventListener('loadeddata', startPlayback);
    }

    const motion = !(
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    /* Геометрія сцени. Читається один раз на монтуванні та на resize,
       а не щокадру: кегль логотипу задає CSS (clamp + медіазапити),
       JS лише зчитує вже обчислене значення й розставляє все пропорційно. */
    const box = { width: 0, height: 0, fontSize: 0 };

    const measure = () => {
      box.width = stage.offsetWidth;
      box.height = stage.offsetHeight;
      box.fontSize = parseFloat(window.getComputedStyle(logoText).fontSize) || 0;
    };

    const paint = value => {
      const dark = phase(value, 0, DARK_END);
      const logo = phase(value, LOGO_START, LOGO_END);
      const say = phase(value, SAY_START, SAY_END);

      /* Дуже повільний наїзд камери — відео помітно реагує на скрол,
         але без жодної перемотки, тому кадри не смикаються */
      if (video) {
        video.style.transform = motion
          ? `scale(${(1 + 0.08 * value).toFixed(4)})`
          : 'scale(1)';
      }

      overlay.style.opacity = dark.toFixed(4);

      /* Спільний рух лого-локапу: поява (scale + короткий підйом)
         і зсув угору, коли знизу проявляється текст */
      const lift = -LOGO_LIFT * box.fontSize * say;
      const rise = motion ? 16 * (1 - logo) : 0;
      const scale = motion ? 0.95 + 0.05 * logo : 1;
      const cx = box.width / 2;
      const cy = box.height / 2;
      const transform =
        `translate(${cx.toFixed(2)} ${(cy + lift + rise).toFixed(2)}) ` +
        `scale(${scale.toFixed(4)}) ` +
        `translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`;

      maskGroup.setAttribute('transform', transform);
      maskGroup.setAttribute('fill-opacity', logo.toFixed(4));

      tintGroup.setAttribute('transform', transform);
      tintGroup.setAttribute('fill-opacity', (logo * LOGO_TINT).toFixed(4));

      divider.style.opacity = logo.toFixed(4);
      divider.style.transform = `translate3d(0, ${(lift + rise).toFixed(2)}px, 0)`;

      statement.style.opacity = say.toFixed(4);
      statement.style.transform =
        `translate3d(0, ${(lift + (motion ? 26 * (1 - say) : 0)).toFixed(2)}px, 0)`;
    };

    /* Сирий прогрес — це лише ціль; намальоване значення доганяє її поступово */
    const readTarget = () => {
      const rect = scene.getBoundingClientRect();
      const travel = rect.height - box.height;
      return travel > 0 ? clamp01(-rect.top / travel) : 0;
    };

    let target = 0;
    let current = 0;
    let lastTime = 0;

    const tick = now => {
      /* dt обмежуємо: після повернення з фонової вкладки він може бути
         величезним і «телепортувати» анімацію */
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 1 / 60;
      lastTime = now;

      current += (target - current) * (1 - Math.exp(-dt / SMOOTHING_TAU));

      if (Math.abs(target - current) < 0.0002) {
        current = target;
      }

      paint(current);

      if (current === target) {
        rafRef.current = 0;
        lastTime = 0;
      } else {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    const onScroll = () => {
      target = readTarget();

      if (!motion) {
        current = target;
        paint(current);
        return;
      }

      if (!rafRef.current) {
        lastTime = 0;
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      measure();
      target = readTarget();
      current = target;
      paint(current);
    };

    /* Стартуємо вже у правильному стані — без анімації «здогону» на завантаженні */
    measure();
    target = readTarget();
    current = target;
    paint(current);

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
      if (video) {
        video.removeEventListener('loadeddata', startPlayback);
      }
    };
  }, []);

  return (
    <Scene ref={sceneRef} aria-label="Planeta Parket">
      <Stage ref={stageRef}>
        <Video
          ref={videoRef}
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
        />

        <Overlay ref={overlayRef} aria-hidden="true" focusable="false">
          <defs>
            <mask id={MASK_ID}>
              {/* Біле = чорний шар видно. Чорні літери = дірки, крізь які видно відео. */}
              <rect x="0" y="0" width="100%" height="100%" fill="#ffffff" />
              <g ref={maskGroupRef} fill="#000000" fillOpacity="0">
                <text className="pp-logo pp-logo--top" x="50%" y="50%" textAnchor="middle">
                  PLANETA
                </text>
                <text className="pp-logo pp-logo--bottom" x="50%" y="50%" textAnchor="middle">
                  PARKET
                </text>
              </g>
            </mask>
          </defs>

          <rect x="0" y="0" width="100%" height="100%" fill="#000000" mask={`url(#${MASK_ID})`} />

          {/* Ледь помітне підсвічування літер — логотип читається навіть на темному кадрі */}
          <g ref={tintGroupRef} fill="#f5efea" fillOpacity="0">
            <text
              ref={logoTextRef}
              className="pp-logo pp-logo--top"
              x="50%"
              y="50%"
              textAnchor="middle"
            >
              PLANETA
            </text>
            <text className="pp-logo pp-logo--bottom" x="50%" y="50%" textAnchor="middle">
              PARKET
            </text>
          </g>
        </Overlay>

        <Divider ref={dividerRef}>
          <span />
        </Divider>

        <Statement ref={statementRef}>
          <h3>Простір починається з підлоги.</h3>
          <p>Натуральне дерево. Відчуття, яке залишається.</p>
        </Statement>
      </Stage>
    </Scene>
  );
}
