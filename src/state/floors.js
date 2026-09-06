import create from "zustand";
import { floorData } from "../components/UI/Navbar/data";
import { API_URL, mediaUrl } from "../store/api/client";

/**
 * Список підлог для 3D-візуалізатора.
 *
 * Джерело — бекенд (/api/floors), де підлога це товар із заповненою
 * текстурою та ввімкненим available_in_3d. Але стартуємо ми з існуючого
 * захардкодженого floorData: якщо бекенд не запущено, 3D-зал працює
 * рівно так, як працював досі, і нічого не ламається.
 *
 * Форма елемента збережена сумісною з TextureSelection:
 *   { id, name, textureImg, previewImg, price, unit, repeat }
 */

/* Адреса API та розкриття шляхів до файлів беруться зі спільного клієнта
   (store/api/client.js). Раніше тут була власна копія цієї логіки, і в
   ній використовувався `||`: у продакшн-збірці REACT_APP_API_URL порожній
   (той самий домен), а порожній рядок хибний — тому копія підставляла
   http://localhost:8000, і на задеплоєному сайті 3D-зал стукав у
   localhost відвідувача замість сервера. */
const absolute = mediaUrl;

export const useFloors = create((set) => ({
  floors: floorData,
  source: "static",
  loading: false,
  error: null,

  setFloors: (floors) => set({ floors, source: "api", loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false })
}));

export async function loadFloors() {
  useFloors.getState().setLoading(true);

  try {
    const response = await fetch(API_URL + "/api/floors", { cache: "no-store" });
    if (!response.ok) throw new Error("bad status");

    const payload = await response.json();

    if (Array.isArray(payload) && payload.length) {
      useFloors.getState().setFloors(
        payload.map((floor) => ({
          id: floor.id,
          name: floor.name,
          textureImg: absolute(floor.textureImg),
          previewImg: absolute(floor.previewImg),
          price: floor.price,
          unit: floor.unit,
          repeat: floor.repeat || 4,
          slug: floor.slug
        }))
      );
      return;
    }

    /* Активних підлог не лишилося (адміністратор їх вимкнув або видалив).
       Повертаємось до стандартного набору, інакше в залі висів би вже
       неіснуючий матеріал до перезавантаження сторінки. */
    useFloors.setState({
      floors: floorData,
      source: "static",
      loading: false,
      error: null
    });
  } catch (error) {
    useFloors.getState().setError("Не вдалося завантажити підлоги — показано стандартний набір");
  }
}

export default useFloors;
