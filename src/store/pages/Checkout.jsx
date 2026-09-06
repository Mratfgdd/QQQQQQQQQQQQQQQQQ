import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Header from '../components/Header';
import {
  CatalogPage,
  CatalogContent,
  CatalogTopMeta,
  CatalogHeading
} from '../components/CatalogLayout';
import { GhostButton } from './Favorites';
import NovaPoshtaPicker, {
  DeliveryField as Field,
  DeliveryGrid as Grid
} from '../components/NovaPoshtaPicker';
import { api } from '../api/client';
import { useCatalog } from '../data/catalogStore';
import { useShop } from '../state/shopStore';
import { media } from '../utils/responsive';

/**
 * Оформлення замовлення з доставкою Новою поштою.
 *
 * Довідники (області, міста, відділення) тягнуться з нашого бекенда
 * (/api/delivery/*), який ходить у Нову пошту зі своїм ключем. У фронтенді
 * ключа немає й бути не може.
 *
 * Стилі навмисно ті самі, що в кошику й каталозі — окремого дизайну
 * checkout не створювалося.
 */

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;

  ${media.tablet} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 22px;
  box-sizing: border-box;
  margin-bottom: 16px;

  h3 {
    font-family: 'Times New Roman', serif;
    font-size: 20px;
    font-weight: 400;
    color: #ffffff;
    margin: 0 0 18px 0;
  }

  ${media.mobile} {
    padding: 16px;
  }
`;

const Summary = styled.aside`
  background: rgba(86, 68, 52, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 22px;
  box-sizing: border-box;
  position: sticky;
  top: 24px;

  h3 {
    font-family: 'Times New Roman', serif;
    font-size: 22px;
    font-weight: 400;
    color: #ffffff;
    margin: 0 0 18px 0;
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 10px;

    span:last-child {
      color: #ffffff;
      white-space: nowrap;
    }
  }

  .total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
    margin-top: 16px;
    padding-top: 16px;

    span:last-child {
      font-family: 'Times New Roman', serif;
      font-size: 26px;
      color: #ffffff;
    }
  }

  button {
    width: 100%;
    justify-content: center;
    margin-top: 20px;
  }

  ${media.tablet} {
    position: static;
  }
`;

const Message = styled.div`
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13.5px;
  margin-bottom: 16px;
  color: #ffffff;
  border: 1px solid
    ${props => (props.$error ? 'rgba(224, 122, 95, 0.55)' : 'var(--pp-accent)')};
  background: ${props =>
    props.$error ? 'rgba(224, 122, 95, 0.16)' : 'rgba(185, 147, 90, 0.18)'};
`;

const Done = styled.div`
  text-align: center;
  padding: 60px 20px 80px 20px;

  h2 {
    font-family: 'Times New Roman', serif;
    font-size: 30px;
    font-weight: 400;
    color: #ffffff;
    margin: 0 0 14px 0;
  }

  p {
    font-size: 14.5px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.7);
    max-width: 46ch;
    margin: 0 auto 26px auto;
  }

  ${media.mobile} {
    padding: 40px 12px 60px 12px;
    h2 { font-size: 25px; }
  }
`;

const formatPrice = value => `${Math.round(value).toLocaleString('uk-UA')} грн`;

export default function Checkout() {
  const history = useHistory();

  const cart = useShop(state => state.cart);
  const clearCart = useShop(state => state.clearCart);
  const productIndex = useCatalog(state => state.productIndex);
  const priceIndex = useCatalog(state => state.products);

  const items = useMemo(
    () => cart.filter(item => productIndex[item.id]),
    [cart, productIndex]
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + ((priceIndex[item.id] || {}).pricePerM2 || 0) * item.qty,
        0
      ),
    [items, priceIndex]
  );

  const [form, setForm] = useState({ name: '', phone: '', comment: '' });

  /* Вибір доставки живе у спільному компоненті NovaPoshtaPicker */
  const [delivery, setDelivery] = useState({
    method: 'branch',
    area: null,
    city: null,
    warehouse: null
  });

  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(null);
  const [sending, setSending] = useState(false);

  const set = (field, value) =>
    setForm(prev => Object.assign({}, prev, { [field]: value }));

  const submit = async event => {
    event.preventDefault();
    setError('');

    const { method, area, city, warehouse } = delivery;

    if (!city || !warehouse) {
      setError('Оберіть місто та відділення Нової пошти');
      return;
    }

    setSending(true);

    try {
      const order = await api.post('/api/orders', {
        customer_name: form.name.trim(),
        phone: form.phone.trim(),
        comment: form.comment.trim(),
        delivery_method: method,
        area_ref: area ? area.ref : '',
        area_name: area ? area.name : '',
        city_ref: city.ref,
        city_name: city.name,
        warehouse_ref: warehouse.ref,
        warehouse_name: warehouse.name,
        items: items.map(item => ({ product_slug: item.id, qty: item.qty }))
      });

      clearCart();
      setPlaced(order);
    } catch (sendError) {
      setError(sendError.message || 'Не вдалося оформити замовлення');
      setSending(false);
    }
  };

  /* ── Успішне оформлення ── */
  if (placed) {
    return (
      <CatalogPage $scrollable>
        <Header />
        <CatalogContent $scrollable>
          <Done>
            <h2>Замовлення №{placed.id} прийнято</h2>
            <p>
              Дякуємо, {placed.customer_name}! Ми зателефонуємо на {placed.phone} для
              підтвердження. Доставка: {placed.city_name}, {placed.warehouse_name}.
              Сума — {formatPrice(placed.total)}.
            </p>
            <GhostButton onClick={() => history.push('/catalog')}>
              Повернутися до каталогу <span>→</span>
            </GhostButton>
          </Done>
        </CatalogContent>
      </CatalogPage>
    );
  }

  /* ── Порожній кошик ── */
  if (!items.length) {
    return (
      <CatalogPage $scrollable>
        <Header />
        <CatalogContent $scrollable>
          <Done>
            <h2>Кошик порожній</h2>
            <p>Додайте товари, щоб оформити замовлення.</p>
            <GhostButton onClick={() => history.push('/catalog')}>
              Перейти до каталогу <span>→</span>
            </GhostButton>
          </Done>
        </CatalogContent>
      </CatalogPage>
    );
  }

  return (
    <CatalogPage $scrollable>
      <Header />
      <CatalogContent $scrollable>
        <CatalogTopMeta>
          <CatalogHeading>
            <div className="breadcrumbs">
              <span onClick={() => history.push('/')}>Головна</span> &gt;{' '}
              <span onClick={() => history.push('/cart')}>Кошик</span> &gt;{' '}
              <span>Оформлення</span>
            </div>
            <h1>Оформлення замовлення</h1>
            <p>Доставка Новою поштою по всій Україні. Оплата — при отриманні.</p>
          </CatalogHeading>
        </CatalogTopMeta>

        {error && <Message $error>{error}</Message>}

        <form onSubmit={submit}>
          <Layout>
            <div>
              <Card>
                <h3>Контактні дані</h3>
                <Grid>
                  <Field>
                    <span className="label">Ім'я та прізвище</span>
                    <input
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      minLength={2}
                      required
                      autoComplete="name"
                    />
                  </Field>
                  <Field>
                    <span className="label">Телефон</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="+38 (0__) ___ __ __"
                      minLength={9}
                      required
                      autoComplete="tel"
                    />
                  </Field>
                </Grid>
              </Card>

              <Card>
                <h3>Доставка Новою поштою</h3>

                <NovaPoshtaPicker onChange={setDelivery} onError={setError} />

                <Grid $columns={1} style={{ marginTop: 14 }}>
                  <Field>
                    <span className="label">Коментар до замовлення</span>
                    <textarea
                      value={form.comment}
                      onChange={e => set('comment', e.target.value)}
                      maxLength={1000}
                    />
                  </Field>
                </Grid>
              </Card>
            </div>

            <Summary>
              <h3>Замовлення</h3>

              {items.map(item => {
                const product = productIndex[item.id];
                const price = (priceIndex[item.id] || {}).pricePerM2 || 0;

                return (
                  <div className="row" key={item.id}>
                    <span>
                      {product.titleLines.join(' ')} × {item.qty}
                    </span>
                    <span>{formatPrice(price * item.qty)}</span>
                  </div>
                );
              })}

              <div className="total">
                <span>До сплати</span>
                <span>{formatPrice(total)}</span>
              </div>

              <GhostButton as="button" type="submit" disabled={sending}>
                {sending ? 'Надсилаємо…' : 'Підтвердити замовлення'}
              </GhostButton>
            </Summary>
          </Layout>
        </form>
      </CatalogContent>
    </CatalogPage>
  );
}
