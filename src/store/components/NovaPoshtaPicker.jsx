import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../api/client';
import { media, TOUCH_TARGET } from '../utils/responsive';

/**
 * Вибір доставки Новою поштою: тип → область → місто → відділення.
 *
 * Один компонент на весь сайт: ним користуються і сторінка оформлення
 * замовлення, і сторінка «Оплата та доставка». Другої інтеграції з НП
 * не створювалося — обидві використовують ті самі наші ендпоїнти
 * /api/delivery/*, а ключ Нової пошти лишається на бекенді.
 *
 * Стан вибору тримається всередині, а назовні віддається через onChange:
 *   { method, area, city, warehouse }
 * де area/city/warehouse — це { ref, name } або null.
 */

export const DeliveryField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  .label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
  }

  input,
  select,
  textarea {
    font-family: inherit;
    font-size: 14px;
    color: #ffffff;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 12px;
    padding: 12px 14px;
    box-sizing: border-box;
    width: 100%;

    &:focus {
      outline: none;
      border-color: var(--pp-accent);
    }

    &:disabled {
      opacity: 0.45;
    }
  }

  /* Список НП темний — робимо пункти читабельними */
  option {
    background: #1c1612;
    color: #ffffff;
  }

  textarea {
    min-height: 84px;
    resize: vertical;
  }

  .note {
    font-size: 11.5px;
    color: rgba(255, 255, 255, 0.45);
  }

  ${media.mobile} {
    input,
    select,
    textarea {
      min-height: ${TOUCH_TARGET};
      /* 16px — щоб iOS не масштабував сторінку при фокусі */
      font-size: 16px;
    }
  }
`;

export const DeliveryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns || 2}, minmax(0, 1fr));
  gap: 14px;

  ${media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const MethodRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const MethodButton = styled.button`
  flex: 1;
  min-width: 140px;
  font-family: inherit;
  font-size: 13.5px;
  padding: 12px 16px;
  border-radius: 14px;
  cursor: pointer;
  color: #ffffff;
  background: ${props => (props.$active ? 'var(--pp-accent)' : 'rgba(255, 255, 255, 0.06)')};
  border: 1px solid ${props => (props.$active ? 'transparent' : 'rgba(255, 255, 255, 0.18)')};
  transition: background 0.25s ease, border-color 0.25s ease;

  &:hover {
    border-color: ${props => (props.$active ? 'transparent' : 'rgba(255, 255, 255, 0.4)')};
  }

  ${media.mobile} {
    min-height: ${TOUCH_TARGET};
  }
`;

const Problem = styled.div`
  font-size: 13px;
  color: #f0b9a8;
  margin-bottom: 12px;
`;

export default function NovaPoshtaPicker({ onChange, onError }) {
  const [method, setMethod] = useState('branch');

  const [areas, setAreas] = useState([]);
  const [cities, setCities] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [area, setArea] = useState(null);
  const [city, setCity] = useState(null);
  const [warehouse, setWarehouse] = useState(null);

  const [loading, setLoading] = useState('');
  const [problem, setProblem] = useState('');

  /* Повідомляємо батьківський компонент про будь-яку зміну вибору */
  useEffect(() => {
    if (onChange) onChange({ method, area, city, warehouse });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, area, city, warehouse]);

  const fail = useCallback(
    text => {
      setProblem(text);
      if (onError) onError(text);
    },
    [onError]
  );

  /* Області — один раз при монтуванні */
  useEffect(() => {
    let cancelled = false;
    setLoading('areas');

    api
      .get('/api/delivery/areas')
      .then(data => {
        if (!cancelled) {
          setAreas(data || []);
          setProblem('');
        }
      })
      .catch(() => {
        if (!cancelled) fail('Не вдалося завантажити список областей Нової пошти');
      })
      .finally(() => {
        if (!cancelled) setLoading('');
      });

    return () => {
      cancelled = true;
    };
  }, [fail]);

  const loadCities = useCallback(
    async selected => {
      setCity(null);
      setWarehouse(null);
      setWarehouses([]);
      setCities([]);

      if (!selected) return;

      setLoading('cities');
      setProblem('');

      try {
        setCities(
          await api.get(`/api/delivery/cities?area=${encodeURIComponent(selected.ref)}`)
        );
      } catch (error) {
        fail('Не вдалося завантажити міста. Спробуйте ще раз.');
      } finally {
        setLoading('');
      }
    },
    [fail]
  );

  const loadWarehouses = useCallback(
    async (selectedCity, kind) => {
      setWarehouse(null);
      setWarehouses([]);

      if (!selectedCity) return;

      setLoading('warehouses');
      setProblem('');

      try {
        setWarehouses(
          await api.get(
            `/api/delivery/warehouses?city=${encodeURIComponent(selectedCity.ref)}&kind=${kind}`
          )
        );
      } catch (error) {
        fail('Не вдалося завантажити відділення. Спробуйте ще раз.');
      } finally {
        setLoading('');
      }
    },
    [fail]
  );

  const changeMethod = next => {
    setMethod(next);
    if (city) loadWarehouses(city, next);
  };

  return (
    <div>
      <MethodRow>
        <MethodButton
          type="button"
          $active={method === 'branch'}
          onClick={() => changeMethod('branch')}
        >
          Відділення
        </MethodButton>
        <MethodButton
          type="button"
          $active={method === 'postomat'}
          onClick={() => changeMethod('postomat')}
        >
          Поштомат
        </MethodButton>
      </MethodRow>

      {problem && <Problem>{problem}</Problem>}

      <DeliveryGrid $columns={1}>
        <DeliveryField>
          <span className="label">Область</span>
          <select
            value={area ? area.ref : ''}
            disabled={loading === 'areas' || !areas.length}
            onChange={event => {
              const selected = areas.find(item => item.ref === event.target.value) || null;
              setArea(selected);
              loadCities(selected);
            }}
          >
            <option value="">
              {loading === 'areas' ? 'Завантаження…' : 'Оберіть область'}
            </option>
            {areas.map(item => (
              <option key={item.ref} value={item.ref}>
                {item.name}
              </option>
            ))}
          </select>
        </DeliveryField>

        <DeliveryField>
          <span className="label">Місто або населений пункт</span>
          <select
            value={city ? city.ref : ''}
            disabled={!area || loading === 'cities'}
            onChange={event => {
              const selected = cities.find(item => item.ref === event.target.value) || null;
              setCity(selected);
              loadWarehouses(selected, method);
            }}
          >
            <option value="">
              {!area
                ? 'Спершу оберіть область'
                : loading === 'cities'
                ? 'Завантаження…'
                : cities.length
                ? 'Оберіть місто'
                : 'Міст не знайдено'}
            </option>
            {cities.map(item => (
              <option key={item.ref} value={item.ref}>
                {item.name}
              </option>
            ))}
          </select>
        </DeliveryField>

        <DeliveryField>
          <span className="label">{method === 'postomat' ? 'Поштомат' : 'Відділення'}</span>
          <select
            value={warehouse ? warehouse.ref : ''}
            disabled={!city || loading === 'warehouses'}
            onChange={event =>
              setWarehouse(warehouses.find(item => item.ref === event.target.value) || null)
            }
          >
            <option value="">
              {!city
                ? 'Спершу оберіть місто'
                : loading === 'warehouses'
                ? 'Завантаження…'
                : warehouses.length
                ? `Оберіть ${method === 'postomat' ? 'поштомат' : 'відділення'}`
                : `У цьому місті немає ${method === 'postomat' ? 'поштоматів' : 'відділень'}`}
            </option>
            {warehouses.map(item => (
              <option key={item.ref} value={item.ref}>
                {item.name}
              </option>
            ))}
          </select>
          {city && !loading && <span className="note">Знайдено: {warehouses.length}</span>}
        </DeliveryField>
      </DeliveryGrid>
    </div>
  );
}
