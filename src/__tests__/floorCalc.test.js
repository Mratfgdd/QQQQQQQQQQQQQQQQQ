import { calculateFloor, toPositiveNumber } from '../store/utils/floorCalc';

/**
 * Математика калькулятора підлоги.
 *
 * Числа звірені з реальним товаром із бази: паркет «Дуб» —
 * 3850 грн/м², упаковка 2.4 м².
 */

const PRICE = 3850;
const PACK = 2.4;

describe('площа', () => {
  test('довжина × ширина', () => {
    expect(calculateFloor(4, 3.2, PRICE, PACK).area).toBe(12.8);
    expect(calculateFloor(5, 4, PRICE, PACK).area).toBe(20);
    expect(calculateFloor(10, 10, PRICE, PACK).area).toBe(100);
  });

  test('дробові розміри округлюються до 0.1 м²', () => {
    /* 3.3 × 2.7 = 8.91 */
    expect(calculateFloor(3.3, 2.7, PRICE, PACK).area).toBe(8.9);
    /* 2.55 × 3.45 = 8.7975 */
    expect(calculateFloor(2.55, 3.45, PRICE, PACK).area).toBe(8.8);
  });

  test('плаваюча кома не дає хвостів на кшталт 10.889999999', () => {
    const { area } = calculateFloor(3.3, 3.3, PRICE, PACK);
    expect(area).toBe(10.9);
    expect(String(area)).not.toMatch(/\d{5,}/);
  });
});

describe('кількість упаковок', () => {
  test('округлення ВГОРУ до цілої упаковки', () => {
    /* 12.8 / 2.4 = 5.33 → 6 */
    expect(calculateFloor(4, 3.2, PRICE, PACK).packages).toBe(6);
    /* 20 / 2.4 = 8.33 → 9 */
    expect(calculateFloor(5, 4, PRICE, PACK).packages).toBe(9);
    /* 100 / 2.4 = 41.67 → 42 */
    expect(calculateFloor(10, 10, PRICE, PACK).packages).toBe(42);
  });

  test('рівно ціла кількість не округлюється вгору зайвий раз', () => {
    /* 4.8 м² = рівно дві упаковки по 2.4 */
    expect(calculateFloor(2.4, 2, PRICE, PACK).packages).toBe(2);
  });

  test('нульова місткість упаковки не дає Infinity', () => {
    const result = calculateFloor(4, 3.2, PRICE, 0);
    expect(Number.isFinite(result.packages)).toBe(true);
    expect(result.packages).toBe(13); // 12.8 / 1 → 13
  });
});

describe('сума', () => {
  test('площа × ціна за м²', () => {
    expect(calculateFloor(4, 3.2, PRICE, PACK).totalPrice).toBe(49280);
    expect(calculateFloor(5, 4, PRICE, PACK).totalPrice).toBe(77000);
  });

  test('сума узгоджена з показаною площею', () => {
    const { area, totalPrice } = calculateFloor(3.3, 2.7, PRICE, PACK);
    expect(totalPrice).toBe(Math.round(area * PRICE));
  });
});

describe('некоректні значення', () => {
  test('від’ємні розміри дають нуль, а не від’ємні площу й суму', () => {
    /* Саме це й було зламано: -5 × 3 показувало
       «-15 м², -6 упаковок, -57 750 грн» */
    expect(calculateFloor(-5, 3, PRICE, PACK)).toEqual({
      area: 0,
      packages: 0,
      totalPrice: 0
    });
    expect(calculateFloor(4, -3, PRICE, PACK).totalPrice).toBe(0);
    expect(calculateFloor(-4, -3, PRICE, PACK).area).toBe(0);
  });

  test('нуль і порожнє поле', () => {
    expect(calculateFloor(0, 5, PRICE, PACK).area).toBe(0);
    expect(calculateFloor('', 3, PRICE, PACK).area).toBe(0);
    expect(calculateFloor(undefined, 3, PRICE, PACK).area).toBe(0);
  });

  test('текст замість числа', () => {
    expect(calculateFloor('abc', 3, PRICE, PACK).area).toBe(0);
    expect(calculateFloor(NaN, 3, PRICE, PACK).area).toBe(0);
  });

  test('нормалізація введення', () => {
    expect(toPositiveNumber('4.5')).toBe(4.5);
    expect(toPositiveNumber('-2')).toBe(0);
    expect(toPositiveNumber('')).toBe(0);
    expect(toPositiveNumber('abc')).toBe(0);
    expect(toPositiveNumber('0')).toBe(0);
  });
});
