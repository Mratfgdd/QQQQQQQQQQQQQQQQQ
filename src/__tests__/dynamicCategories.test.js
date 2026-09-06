import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import App from '../App';

/**
 * Регресійний тест на «чорний екран» нової категорії.
 *
 * Історія бага: маршрути категорій були перелічені в роутері вручну
 * (/parquet, /parquet-board, /laminate, /accessories). Категорія «АК»,
 * створена в адмін-панелі, у цьому переліку не значилась, тому адреса
 * /ak не збігалася з жодним <Route>, Switch повертав null — і замість
 * товарів користувач бачив порожню сторінку.
 *
 * Тест піднімає застосунок цілком (той самий App, що й у продакшні),
 * підсовує йому відповідь /api/categories з п'ятьма категоріями — рівно
 * такою, яку віддає реальний бекенд, — і перевіряє, що:
 *
 *   • адреса динамічно створеної категорії малює її товари;
 *   • давні категорії продовжують працювати;
 *   • неіснуючий slug дає зрозуміле «не знайдено», а не порожнечу;
 *   • будь-яка інша адреса дає 404-сторінку, а не порожнечу.
 */

/* Відповідь /api/categories, скорочена до полів, які читає catalogStore */
const API_PAYLOAD = [
  {
    slug: 'parquet',
    title: 'Паркет',
    breadcrumb: 'Паркет',
    subtitle: 'Натуральний паркет преміум якості.',
    image: '/parquet.jpg',
    position: 0,
    products: [
      {
        slug: 'oak',
        title: 'Паркет Дуб',
        title_top: 'Паркет',
        title_bottom: 'Дуб',
        price: 1500,
        old_price: null,
        pack_qty: 1,
        unit: 'м²',
        description: '',
        short_description: '',
        specs: [],
        in_stock: true,
        is_popular: true,
        position: 0,
        created_at: '2026-01-01T00:00:00',
        images: [{ url: '/cat-dub.jpg', position: 0, is_main: true }]
      }
    ]
  },
  {
    /* Та сама категорія, що клієнт створив в адмін-панелі */
    slug: 'ak',
    title: 'ак',
    breadcrumb: 'ак',
    subtitle: 'Нова категорія з адмін-панелі',
    image: '/api/files/9b09aa7c314c0983afdd9c5d.jpg',
    position: 4,
    products: [
      {
        slug: 'ak-product',
        title: 'Товар АК',
        title_top: 'Товар',
        title_bottom: 'АК',
        price: 999,
        old_price: null,
        pack_qty: 1,
        unit: 'м²',
        description: '',
        short_description: '',
        specs: [],
        in_stock: true,
        is_popular: false,
        position: 0,
        created_at: '2026-09-01T00:00:00',
        images: [{ url: '/api/files/abc123.jpg', position: 0, is_main: true }]
      }
    ]
  }
];

/* jsdom + styled-components малюють сторінку цілком (шапка, сітка карток,
   футер), і в CI це помітно повільніше за браузер. П'ять секунд за
   замовчуванням тут не про помилку в коді, а про швидкість середовища. */
jest.setTimeout(60000);

let container;

beforeEach(() => {
  container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(API_PAYLOAD)
    })
  );
});

afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
  container = null;
  delete global.fetch;
});

/* React 16.8 не вміє в асинхронний act(), тому чергу проміс-задач
   прокручуємо вручну: fetch → .json() → setState стору */
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

/** Монтує застосунок за вказаною адресою й дочікується відповіді API */
async function renderAt(path) {
  window.history.pushState({}, '', path);

  act(() => {
    ReactDOM.render(<App />, container);
  });

  await flush();
  await flush();

  /* Порожній act() змушує React застосувати оновлення, які прилетіли
     зі стору поза межами рендер-фази */
  act(() => {});

  return container.textContent;
}

test('нова категорія з адмін-панелі відкривається і показує свій товар', async () => {
  const text = await renderAt('/ak');

  /* Головне: сторінка НЕ порожня */
  expect(text.length).toBeGreaterThan(0);

  expect(text).toContain('ак');
  expect(text).toContain('Нова категорія з адмін-панелі');
  expect(text).toContain('Товар');
  expect(text).toContain('АК');

  /* І це саме її сторінка, а не мовчазний підмін на «Паркет» */
  expect(text).not.toContain('Категорію не знайдено');
});

test('нова категорія сама з’являється карткою на головній', async () => {
  const text = await renderAt('/');

  /* Обидві категорії з відповіді API — і давня, і щойно створена */
  expect(text).toContain('Паркет');
  expect(text).toContain('ак');
  expect(text).toContain('Нова категорія з адмін-панелі');
});

test('давня категорія продовжує працювати', async () => {
  const text = await renderAt('/parquet');

  expect(text).toContain('Паркет');
  expect(text).toContain('Дуб');
  expect(text).not.toContain('Категорію не знайдено');
});

test('неіснуючий slug дає зрозуміле повідомлення, а не порожній екран', async () => {
  const text = await renderAt('/no-such-category');

  expect(text).toContain('Категорію не знайдено');
});

test('довільна адреса дає 404-сторінку, а не порожній екран', async () => {
  const text = await renderAt('/foo/bar/baz');

  expect(text).toContain('404');
  expect(text).toContain('Сторінку не знайдено');
});

test('службові маршрути не сприймаються за категорію', async () => {
  const text = await renderAt('/cart');

  expect(text).not.toContain('Категорію не знайдено');
  expect(text).toContain('Кошик');
});
