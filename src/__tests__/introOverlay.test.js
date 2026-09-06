import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import IntroOverlay from '../store/components/IntroOverlay';

/**
 * Поведінка вступної заставки.
 *
 * Вимоги, які перевіряємо:
 *   • показується при першому відкритті сайту;
 *   • НЕ показується вдруге в межах тієї самої сесії вкладки —
 *     переходи між сторінками її не перезапускають;
 *   • не з'являється в 3D-візуалізаторі та в адмін-панелі;
 *   • не грає, якщо користувач попросив менше руху
 *     (prefers-reduced-motion: reduce).
 */

jest.setTimeout(30000);

let container;

function mountAt(path) {
  act(() => {
    ReactDOM.render(
      <MemoryRouter initialEntries={[path]}>
        <IntroOverlay />
      </MemoryRouter>,
      container
    );
  });

  return container.querySelector('.pp-intro');
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  window.sessionStorage.clear();
  /* За замовчуванням — звичайний режим, без обмеження анімацій */
  window.matchMedia = jest.fn(() => ({ matches: false, addListener() {}, removeListener() {} }));
});

afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
  container = null;
  delete window.matchMedia;
});

test('показується при першому відкритті сайту', () => {
  const intro = mountAt('/');

  expect(intro).not.toBeNull();
  expect(intro.textContent).toContain('Parket');
  expect(intro.textContent).toContain('Planet');
});

test('не запускається вдруге в тій самій сесії', () => {
  expect(mountAt('/')).not.toBeNull();

  /* Імітуємо перехід на іншу сторінку: новий монтаж компонента */
  ReactDOM.unmountComponentAtNode(container);

  expect(mountAt('/parquet')).toBeNull();
});

test('не з’являється у 3D-візуалізаторі та адмін-панелі', () => {
  expect(mountAt('/hall')).toBeNull();

  ReactDOM.unmountComponentAtNode(container);
  window.sessionStorage.clear();

  expect(mountAt('/admin')).toBeNull();
});

test('при prefers-reduced-motion заставка все одно показується', () => {
  /* Рух прибирається CSS-медіазапитом, але сама заставка лишається:
     інакше користувач із вимкненими анімаціями не побачив би її ніколи.
     Саме через стару поведінку («reduce → не показувати взагалі»)
     заставки не було видно на реальній машині. */
  window.matchMedia = jest.fn(() => ({ matches: true, addListener() {}, removeListener() {} }));

  const intro = mountAt('/');

  expect(intro).not.toBeNull();
  expect(intro.textContent).toContain('Parket');
});

test('?intro примусово показує заставку навіть після показу в цій сесії', () => {
  expect(mountAt('/')).not.toBeNull();
  ReactDOM.unmountComponentAtNode(container);

  /* Без параметра — вже не показується */
  expect(mountAt('/')).toBeNull();
  ReactDOM.unmountComponentAtNode(container);

  /* З параметром — показується знову */
  expect(mountAt('/?intro=1')).not.toBeNull();
});
