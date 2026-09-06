import create from 'zustand';
import { apiFetch, mediaUrl } from '../api/client';
import { COLLECTION_PHOTOS } from './collectionPhotos';

/**
 * Джерело фотографій галереї для сторінки /collection.
 *
 * Єдине джерело правди — бекенд (/api/gallery). Статичний список
 * collectionPhotos.js використовується ТІЛЬКИ як перший кадр, поки
 * відповідь ще не прийшла, і як запасний варіант, якщо бекенд не
 * піднято, — тоді сторінка не стає порожньою й нічого не блимає.
 *
 * ВАЖЛИВО ПРО ПОРОЖНІЙ СПИСОК. Якщо бекенд відповів порожнім масивом —
 * це означає, що адміністратор видалив усі фотографії, і галерея на
 * сайті теж має стати порожньою. Тому порожня відповідь приймається як
 * валідна й затирає статику. Було б помилкою «на всяк випадок»
 * відкотитися на статичний список: видалені фото повернулися б.
 */

const fromApi = rows =>
  rows.map(row => ({
    id: row.id,
    src: mediaUrl(row.url),
    alt: row.alt || ''
  }));

export const useGallery = create(set => ({
  /* Стартова точка — той самий вміст, що показувався досі */
  photos: COLLECTION_PHOTOS,
  source: 'static',
  loaded: false,

  applyApiGallery: rows =>
    set({ photos: fromApi(rows), source: 'api', loaded: true })
}));

/** Підтягує галерею. Помилка мережі не критична — лишаємось на статиці. */
export async function loadGallery() {
  try {
    /* no-store: інакше браузер може віддати кешовану відповідь, і щойно
       додана в адмінці фотографія не з'явиться до жорсткого перезавантаження */
    const rows = await apiFetch('/api/gallery', { cache: 'no-store' });
    if (Array.isArray(rows)) {
      useGallery.getState().applyApiGallery(rows);
    }
  } catch (error) {
    /* Бекенд не піднято — лишаємося на статичних фотографіях */
  }
}

export default useGallery;
