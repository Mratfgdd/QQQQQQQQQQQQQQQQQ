import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../api/client';
import {
  Badge,
  ConfirmDialog,
  DangerBtn,
  GhostBtn,
  Notice,
  PageTitle,
  Panel
} from './AdminUI';
import { media } from '../utils/responsive';

/**
 * Замовлення з сайту.
 *
 * Адміністратор бачить усе, що потрібно, щоб зібрати посилку: клієнта,
 * телефон, товари з кількістю, суму та повну адресу доставки Новою
 * поштою — область, місто й конкретне відділення чи поштомат.
 */

const STATUSES = [
  { key: 'new', label: 'Нове' },
  { key: 'processing', label: 'В обробці' },
  { key: 'shipped', label: 'Відправлено' },
  { key: 'done', label: 'Виконано' },
  { key: 'cancelled', label: 'Скасовано' }
];

const statusLabel = key => (STATUSES.find(s => s.key === key) || STATUSES[0]).label;

const Order = styled(Panel)`
  margin-bottom: 14px;

  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .who {
    min-width: 0;

    strong {
      display: block;
      font-size: 16px;
      color: var(--pp-text);
      margin-bottom: 3px;
    }

    a {
      font-size: 13.5px;
      color: var(--pp-accent);
      text-decoration: none;
    }

    small {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: var(--pp-text-3);
    }
  }

  .sum {
    font-family: 'Times New Roman', serif;
    font-size: 24px;
    color: var(--pp-text);
    white-space: nowrap;
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 18px;

    ${media.tablet} {
      grid-template-columns: 1fr;
    }
  }

  .block-title {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--pp-text-3);
    margin-bottom: 8px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 13.5px;
      color: var(--pp-text-2);
      padding: 7px 0;
      border-bottom: 1px solid var(--pp-divider);

      &:last-child { border-bottom: none; }
    }
  }

  .delivery {
    font-size: 13.5px;
    line-height: 1.65;
    color: var(--pp-text-2);

    b {
      color: var(--pp-text);
      font-weight: 500;
    }
  }

  .foot {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--pp-divider);

    select {
      font-family: inherit;
      font-size: 13px;
      color: var(--pp-text);
      background: var(--pp-bg);
      border: 1px solid var(--pp-divider);
      border-radius: 10px;
      padding: 9px 12px;
    }

    ${media.mobile} {
      select { min-height: 44px; flex: 1; }
    }
  }
`;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await api.get('/api/admin/orders'));
      setError('');
    } catch (loadError) {
      setError('Не вдалося завантажити замовлення. Перевірте, чи запущено бекенд.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (order, status) => {
    try {
      await api.put(`/api/admin/orders/${order.id}`, { status });
      await load();
      setMessage(`Замовлення №${order.id}: ${statusLabel(status)}`);
      window.setTimeout(() => setMessage(''), 3500);
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.del(`/api/admin/orders/${removing.id}`);
      setRemoving(null);
      await load();
      setMessage('Замовлення видалено');
      window.setTimeout(() => setMessage(''), 3500);
    } catch (deleteError) {
      setError(deleteError.message);
      setRemoving(null);
    }
  };

  return (
    <div>
      <PageTitle>
        <div>
          <h1>Замовлення</h1>
          <p>
            {loading
              ? 'Завантаження…'
              : `${orders.length} замовлень · нових: ${
                  orders.filter(o => o.status === 'new').length
                }`}
          </p>
        </div>
        <GhostBtn type="button" onClick={load}>
          Оновити
        </GhostBtn>
      </PageTitle>

      {message && <Notice>{message}</Notice>}
      {error && <Notice $error>{error}</Notice>}

      {!loading && orders.length === 0 && (
        <Notice>Замовлень поки немає. Вони з'являться тут одразу після оформлення на сайті.</Notice>
      )}

      {orders.map(order => (
        <Order key={order.id}>
          <div className="head">
            <div className="who">
              <strong>
                №{order.id} · {order.customer_name}
              </strong>
              <a href={`tel:${order.phone.replace(/[^\d+]/g, '')}`}>{order.phone}</a>
              <small>{new Date(order.created_at).toLocaleString('uk-UA')}</small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge $on={order.status === 'new'}>{statusLabel(order.status)}</Badge>
              <span className="sum">
                {Math.round(order.total).toLocaleString('uk-UA')} грн
              </span>
            </div>
          </div>

          <div className="grid">
            <div>
              <div className="block-title">Товари</div>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    <span>
                      {item.title} × {item.qty}
                    </span>
                    <span>
                      {Math.round(item.price * item.qty).toLocaleString('uk-UA')} грн
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="block-title">Доставка</div>
              <div className="delivery">
                Нова пошта ·{' '}
                <b>{order.delivery_method === 'postomat' ? 'поштомат' : 'відділення'}</b>
                <br />
                {order.area_name && <>{order.area_name} область<br /></>}
                <b>{order.city_name}</b>
                <br />
                {order.warehouse_name}
                {order.comment && (
                  <>
                    <br />
                    <br />
                    <span style={{ color: 'var(--pp-text-3)' }}>Коментар: {order.comment}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="foot">
            <select value={order.status} onChange={e => changeStatus(order, e.target.value)}>
              {STATUSES.map(status => (
                <option key={status.key} value={status.key}>
                  {status.label}
                </option>
              ))}
            </select>
            <DangerBtn type="button" onClick={() => setRemoving(order)}>
              Видалити
            </DangerBtn>
          </div>
        </Order>
      ))}

      {removing && (
        <ConfirmDialog
          title="Видалити замовлення?"
          text={`Замовлення №${removing.id} від ${removing.customer_name} буде видалено назавжди.`}
          onCancel={() => setRemoving(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
