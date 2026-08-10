import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { media, TOUCH_TARGET } from '../utils/responsive';

/**
 * Футер магазину Parket Planet.
 *
 * Палітру не вигадував: це та сама темна підкладка й золотий акцент,
 * що вже використовує Header, — сторінка отримує симетричне обрамлення.
 *
 * ПОСИЛАННЯ. Реальні маршрути в проєкті зараз лише /, /catalog, /product/:id
 * та /hall. Тому пункти каталогу ведуть на /catalog, а решта — поки що не
 * навігують: вигадувати неіснуючі URL, які дадуть 404, немає сенсу. Щоб
 * підключити сторінку, достатньо проставити `to` у відповідному пункті нижче.
 */

/* ─────────────────────────────────────────────────────────────
   ТУТ ПІДКЛЮЧАЮТЬСЯ СОЦМЕРЕЖІ.
   Впишіть реальні адреси — кнопки автоматично стануть клікабельними.
   ───────────────────────────────────────────────────────────── */
const SOCIAL_LINKS = {
  instagram: '',
  facebook: ''
};

const CONTACTS = {
  address: 'вул. Наукова, 12, Львів',
  phone: '+38 (067) 673 06 70',
  phoneHref: 'tel:+380676730670',
  email: 'parket_planet@i.ua',
  hours: 'Пн - Пт: 09:00 - 19:00'
};

/* `to: null` — сторінки ще немає, пункт показуємо, але не навігуємо */
const COLUMNS = [
  {
    title: 'Каталог',
    items: [
      { label: 'Паркетна дошка', to: '/catalog' },
      { label: 'Масивна дошка', to: '/catalog' },
      { label: 'Ламінат', to: '/catalog' },
      { label: 'Супутні товари', to: '/catalog' }
    ]
  },
  {
    title: 'Покупцям',
    items: [
      { label: 'Оплата і доставка', to: null },
      { label: 'Гарантія та повернення', to: null },
      { label: 'Калькулятор матеріалу', to: null },
      { label: 'Питання та відповіді', to: null }
    ]
  },
  {
    title: 'Про компанію',
    /* На телефоні ця колонка йде на всю ширину під двома верхніми */
    wide: true,
    items: [
      { label: 'Про Parket Planet', to: null },
      { label: 'Контакти', to: null },
      { label: 'Новини та блоги', to: null },
      { label: 'Відгуки клієнтів', to: null }
    ]
  }
];

const FooterRoot = styled.footer`
  background: linear-gradient(180deg, var(--pp-chrome-top) 0%, var(--pp-chrome-bottom) 100%);
  color: #ffffff;
  font-family: 'Helvetica Neue', sans-serif;
  width: 100%;
  box-sizing: border-box;
  padding: 88px 60px 32px 60px;

  ${media.tablet} {
    padding: 64px 32px 28px 32px;
  }

  ${media.mobile} {
    padding: 40px 20px 20px 20px;
  }

  ${media.smallMobile} {
    padding: 34px 16px 18px 16px;
  }
`;

const Inner = styled.div`
  max-width: 1440px;
  margin: 0 auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.15fr 1.6fr;
  gap: 48px 40px;

  ${media.belowWide} {
    grid-template-columns: 1fr 1fr 1fr 1.2fr;
  }

  ${media.tablet} {
    grid-template-columns: 1fr 1fr;
    gap: 40px 32px;
  }

  /* ── ТЕЛЕФОН ──
     Дві компактні колонки зверху, далі повноширинні блоки — так структура
     лишається впізнаваною, як на десктопі, але не розтягується в довжелезний
     вертикальний список. */
  ${media.mobile} {
    grid-template-columns: 1fr 1fr;
    gap: 28px 18px;

    [data-wide='true'] {
      grid-column: 1 / -1;
    }
  }

  ${media.smallMobile} {
    gap: 24px 14px;
  }
`;

const Column = styled.nav`
  min-width: 0;

  h3 {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--pp-accent);
    margin: 0 0 22px 0;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin-bottom: 14px;
  }

  li:last-child {
    margin-bottom: 0;
  }

  a,
  span {
    display: inline-block;
    font-size: 14.5px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.72);
    text-decoration: none;
    transition: color 0.25s ease;
  }

  a {
    cursor: pointer;
  }

  a:hover,
  a:focus-visible {
    color: #ffffff;
  }

  ${media.mobile} {
    h3 {
      font-size: 12px;
      letter-spacing: 0.16em;
      margin-bottom: 12px;
    }

    li {
      margin-bottom: 10px;
    }

    /* Компактно, але з полем для пальця за рахунок padding, а не висоти рядка */
    a,
    span {
      font-size: 14.5px;
      line-height: 1.35;
      padding: 3px 0;
      overflow-wrap: break-word;
    }
  }

  ${media.smallMobile} {
    a,
    span {
      font-size: 13.5px;
    }
  }
`;

const Contacts = styled.div`
  min-width: 0;

  h3 {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--pp-accent);
    margin: 0 0 22px 0;
  }

  .line {
    display: block;
    font-size: 14.5px;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.72);
    margin-bottom: 14px;
    text-decoration: none;
    transition: color 0.25s ease;
  }

  a.line:hover,
  a.line:focus-visible {
    color: #ffffff;
  }

  .phone {
    font-size: 19px;
    letter-spacing: 0.02em;
    color: #ffffff;
    font-weight: 500;
  }

  .hours {
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0;
  }

  ${media.mobile} {
    grid-column: 1 / -1;

    h3 {
      font-size: 12px;
      letter-spacing: 0.16em;
      margin-bottom: 12px;
    }

    .line {
      font-size: 14px;
      margin-bottom: 10px;
    }

    a.line {
      padding: 3px 0;
    }

    .phone {
      font-size: 18px;
    }

    .hours {
      font-size: 13px;
    }
  }
`;

const Social = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;

  a,
  span {
    width: ${TOUCH_TARGET};
    height: ${TOUCH_TARGET};
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.16);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.8);
    transition: border-color 0.25s ease, color 0.25s ease, background-color 0.25s ease;
  }

  svg {
    width: 19px;
    height: 19px;
    stroke: currentColor;
    fill: none;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  a {
    cursor: pointer;
  }

  a:hover,
  a:focus-visible {
    border-color: var(--pp-accent);
    background-color: rgba(185, 147, 90, 0.12);
    color: #ffffff;
  }

  /* Поки посилання не підключене — кнопка є, але нікуди не веде */
  span {
    color: rgba(255, 255, 255, 0.45);
  }

  ${media.mobile} {
    margin-top: 18px;
    gap: 10px;
  }
`;

const MapBlock = styled.div`
  min-width: 0;

  h3 {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--pp-accent);
    margin: 0 0 22px 0;
  }

  .map-slot {
    position: relative;
    width: 100%;
    height: 240px;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background-color: rgba(255, 255, 255, 0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
  }

  /* Коли сюди вставлять <iframe>, він займе весь блок */
  .map-slot iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .map-slot svg {
    width: 26px;
    height: 26px;
    stroke: var(--pp-accent);
    fill: none;
    stroke-width: 1.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .map-slot .caption {
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.7);
  }

  .map-slot .hint {
    font-size: 11.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.34);
  }

  ${media.belowWide} {
    grid-column: 1 / -1;

    .map-slot {
      height: 220px;
    }
  }

  ${media.tablet} {
    grid-column: 1 / -1;
  }

  ${media.mobile} {
    h3 {
      font-size: 12px;
      letter-spacing: 0.16em;
      margin-bottom: 12px;
    }

    .map-slot {
      height: 170px;
      gap: 8px;
    }

    .map-slot .caption {
      font-size: 13px;
    }

    .map-slot .hint {
      font-size: 11px;
    }
  }
`;

const BottomBar = styled.div`
  margin-top: 64px;
  padding-top: 26px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  span {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.42);
    letter-spacing: 0.04em;
  }

  /* Ненав'язливе службове посилання — навмисно дрібне й приглушене */
  a.admin-link {
    font-size: 11.5px;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.28);
    text-decoration: none;
    transition: color 0.25s ease;

    &:hover {
      color: var(--pp-accent);
    }
  }

  ${media.mobile} {
    margin-top: 28px;
    padding-top: 18px;
    justify-content: center;
    text-align: center;

    span {
      font-size: 11.5px;
    }

    /* Слоган на вузькому екрані лише додає зайвий рядок */
    span + span {
      display: none;
    }

    a.admin-link {
      width: 100%;
      font-size: 11px;
    }
  }
`;

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="2" y="2" width="20" height="20" rx="5.5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M17.5 2.5H15a4.5 4.5 0 0 0-4.5 4.5v3H8v4h2.5v7.5h4V14H18l.9-4h-4.4V7.4c0-.6.4-1 1-1h2z" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

function SocialButton({ url, label, children }) {
  if (!url) {
    /* Адреси ще немає — лишаємо готове місце, але не вигадуємо URL */
    return (
      <span title={`${label}: посилання буде додано`} aria-label={label}>
        {children}
      </span>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {children}
    </a>
  );
}

export default function Footer() {
  const history = useHistory();

  const go = (event, to) => {
    event.preventDefault();
    history.push(to);
  };

  return (
    <FooterRoot>
      <Inner>
        <Grid>
          {COLUMNS.map(column => (
            <Column
              key={column.title}
              aria-label={column.title}
              data-wide={column.wide ? 'true' : 'false'}
            >
              <h3>{column.title}</h3>
              <ul>
                {column.items.map(item => (
                  <li key={item.label}>
                    {item.to ? (
                      <a href={item.to} onClick={event => go(event, item.to)}>
                        {item.label}
                      </a>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Column>
          ))}

          <Contacts>
            <h3>Контакти</h3>

            <span className="line">{CONTACTS.address}</span>

            <a className="line phone" href={CONTACTS.phoneHref}>
              {CONTACTS.phone}
            </a>

            <a className="line" href={`mailto:${CONTACTS.email}`}>
              {CONTACTS.email}
            </a>

            <span className="line hours">{CONTACTS.hours}</span>

            <Social>
              <SocialButton url={SOCIAL_LINKS.instagram} label="Instagram">
                <InstagramIcon />
              </SocialButton>
              <SocialButton url={SOCIAL_LINKS.facebook} label="Facebook">
                <FacebookIcon />
              </SocialButton>
            </Social>
          </Contacts>

          <MapBlock>
            <h3>Ми на карті</h3>
            <div className="map-slot">
              {/*
                Місце під карту. Щоб підключити, просто вставте сюди iframe
                свого провайдера — він розтягнеться на весь блок:

                <iframe title="Parket Planet на карті" src="ВАША_АДРЕСА_КАРТИ" allowFullScreen />
              */}
              <PinIcon />
              <span className="caption">{CONTACTS.address}</span>
              <span className="hint">Місце під карту</span>
            </div>
          </MapBlock>
        </Grid>

        <BottomBar>
          <span>© {new Date().getFullYear()} Parket Planet. Усі права захищені.</span>
          <span>Натуральна підлога та професійні паркетні роботи</span>
          <a className="admin-link" href="/admin">
            Адмін-панель
          </a>
        </BottomBar>
      </Inner>
    </FooterRoot>
  );
}
