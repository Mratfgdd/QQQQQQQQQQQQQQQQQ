import React, { useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import {
  CatalogPage,
  CatalogContent,
  CatalogTopMeta,
  CatalogHeading
} from '../components/CatalogLayout';
import NovaPoshtaPicker from '../components/NovaPoshtaPicker';
import { GhostButton } from './Favorites';
import { useShop, selectCartCount } from '../state/shopStore';
import { media } from '../utils/responsive';

/**
 * Сторінка «Оплата та доставка».
 *
 * Сюди веде пункт «Доставка Новою поштою» — і в десктопній шапці, і в
 * секції «Сервіс» мобільного меню, — а також «Оплата і доставка» у футері
 * та в блоці переваг картки товару. Маршрут один: /delivery.
 *
 * Вибір відділення тут — це той самий NovaPoshtaPicker, що й на сторінці
 * оформлення: другої інтеграції з Новою поштою не створювалося. Тут він
 * працює як довідник «перевір, чи є відділення у твоєму місті», а сама
 * покупка відбувається на /checkout.
 */

const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 380px);
  gap: 22px;
  align-items: start;

  ${media.tablet} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 24px;
  box-sizing: border-box;
  margin-bottom: 16px;

  h2 {
    font-family: 'Times New Roman', serif;
    font-size: 23px;
    font-weight: 400;
    color: #ffffff;
    margin: 0 0 16px 0;
  }

  p {
    font-size: 14px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.72);
    margin: 0 0 12px 0;
  }

  ${media.mobile} {
    padding: 18px;
  }
`;

const Steps = styled.ol`
  list-style: none;
  counter-reset: step;
  margin: 0;
  padding: 0;

  li {
    counter-increment: step;
    position: relative;
    padding-left: 44px;
    margin-bottom: 18px;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.72);

    &:last-child {
      margin-bottom: 0;
    }

    &::before {
      content: counter(step);
      position: absolute;
      left: 0;
      top: -2px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid var(--pp-accent);
      color: var(--pp-accent);
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    b {
      color: #ffffff;
      font-weight: 500;
    }
  }
`;

const Facts = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    padding: 11px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    &:last-child {
      border-bottom: none;
    }

    b {
      color: #ffffff;
      font-weight: 500;
      text-align: right;
    }
  }
`;

const Aside = styled.aside`
  background: rgba(86, 68, 52, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 22px;
  box-sizing: border-box;
  position: sticky;
  top: 24px;

  h2 {
    font-family: 'Times New Roman', serif;
    font-size: 21px;
    font-weight: 400;
    color: #ffffff;
    margin: 0 0 8px 0;
  }

  > p {
    font-size: 13px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.65);
    margin: 0 0 18px 0;
  }

  button {
    width: 100%;
    justify-content: center;
    margin-top: 18px;
  }

  ${media.tablet} {
    position: static;
  }
`;

const Chosen = styled.div`
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.78);

  b {
    color: #ffffff;
    font-weight: 500;
  }
`;

export default function Delivery() {
  const history = useHistory();
  const cartCount = useShop(selectCartCount);
  const [delivery, setDelivery] = useState(null);

  const chosen = delivery && delivery.city && delivery.warehouse ? delivery : null;

  return (
    <CatalogPage $scrollable>
      <Header />
      <CatalogContent $scrollable>
        <CatalogTopMeta>
          <CatalogHeading>
            <div className="breadcrumbs">
              <span onClick={() => history.push('/')}>Головна</span> &gt;{' '}
              <span>Оплата та доставка</span>
            </div>
            <h1>Оплата та доставка</h1>
            <p>Надсилаємо Новою поштою по всій Україні. Оплата — при отриманні.</p>
          </CatalogHeading>
        </CatalogTopMeta>

        <Columns>
          <div>
            <Card>
              <h2>Як відбувається замовлення</h2>
              <Steps>
                <li>
                  Додайте потрібні позиції у кошик — кількість вказується в
                  <b> м²</b>, а для плінтуса й засобів догляду у своїх одиницях.
                </li>
                <li>
                  На сторінці оформлення оберіть <b>область, місто та відділення</b> або
                  поштомат Нової пошти. Список підтягується напряму з Нової пошти.
                </li>
                <li>
                  Залиште ім'я та телефон. Ми телефонуємо, щоб підтвердити
                  наявність і точну кількість матеріалу.
                </li>
                <li>
                  Відправляємо протягом <b>1–2 робочих днів</b> і надсилаємо номер
                  накладної.
                </li>
              </Steps>
            </Card>

            <Card>
              <h2>Оплата</h2>
              <p>
                Наразі доступна оплата <b>при отриманні</b> у відділенні Нової пошти,
                а для юридичних осіб — безготівковий розрахунок за рахунком.
                Передоплата не потрібна.
              </p>
              <Facts>
                <li>
                  <span>Спосіб оплати</span>
                  <b>При отриманні / безготівковий</b>
                </li>
                <li>
                  <span>Передоплата</span>
                  <b>Не потрібна</b>
                </li>
                <li>
                  <span>Вартість доставки</span>
                  <b>За тарифами Нової пошти</b>
                </li>
                <li>
                  <span>Термін відправки</span>
                  <b>1–2 робочі дні</b>
                </li>
                <li>
                  <span>Повернення</span>
                  <b>14 днів, якщо упаковка ціла</b>
                </li>
              </Facts>
            </Card>
          </div>

          <Aside>
            <h2>Перевірити відділення</h2>
            <p>Оберіть своє місто, щоб побачити доступні відділення та поштомати.</p>

            <NovaPoshtaPicker onChange={setDelivery} />

            {chosen && (
              <Chosen>
                Доставка сюди можлива:
                <br />
                <b>{chosen.city.name}</b>
                <br />
                {chosen.warehouse.name}
              </Chosen>
            )}

            <GhostButton
              onClick={() => history.push(cartCount > 0 ? '/checkout' : '/catalog')}
            >
              {cartCount > 0 ? 'Оформити замовлення' : 'Перейти до каталогу'}{' '}
              <span>→</span>
            </GhostButton>
          </Aside>
        </Columns>
      </CatalogContent>
    </CatalogPage>
  );
}
