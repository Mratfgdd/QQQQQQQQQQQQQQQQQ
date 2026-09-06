import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { api, mediaUrl } from '../api/client';
import { Button, ConfirmDialog, GhostBtn, Notice, PageTitle, Panel } from './AdminUI';
import { media } from '../utils/responsive';

/**
 * Розділ «Галерея» адмін-панелі.
 *
 * Керує тими самими даними, що показує сторінка /collection: таблиця
 * gallery_photos у спільній базі, файли — у backend/uploads через
 * існуючий /api/admin/uploads. Ніякого localStorage і жодного
 * паралельного сховища.
 *
 * Фотографії галереї — НЕ товари: у них немає ціни, slug і категорії,
 * і вони не потрапляють ні в каталог, ні в кошик, ні в обране.
 *
 * Кожна дія зберігається одразу, окремої кнопки «Зберегти» немає
 * навмисно: завантаження файлу вже є збереженням, а прихований стан
 * «змінено, але не збережено» — найлегший спосіб втратити роботу.
 */

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
  margin-top: 16px;

  ${media.mobile} {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
`;

const Card = styled.div`
  border: 1px solid var(--pp-divider);
  border-radius: 14px;
  overflow: hidden;
  background-color: var(--pp-surface-2);
  opacity: ${props => (props.$dim ? 0.5 : 1)};
  transition: opacity 0.2s ease;

  .preview {
    position: relative;
    height: 150px;
    background-color: var(--pp-surface-3);
    background-size: cover;
    background-position: center;
  }

  .order {
    position: absolute;
    top: 8px;
    left: 8px;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background-color: rgba(18, 14, 10, 0.72);
    color: #ffffff;
    font-size: 11px;
    line-height: 22px;
    text-align: center;
  }

  .hidden-flag {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 8px;
    border-radius: 999px;
    background-color: rgba(18, 14, 10, 0.72);
    color: #ffffff;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .bar {
    display: flex;
    gap: 4px;
    padding: 7px;

    button {
      flex: 1;
      min-width: 30px;
      font-family: inherit;
      font-size: 11.5px;
      padding: 6px 4px;
      border-radius: 7px;
      border: 1px solid var(--pp-divider);
      background: var(--pp-surface);
      color: var(--pp-text-2);
      cursor: pointer;

      &:hover:not(:disabled) {
        border-color: var(--pp-accent);
      }

      &:disabled {
        opacity: 0.35;
        cursor: default;
      }
    }

    ${media.mobile} {
      flex-wrap: wrap;

      button {
        min-height: 34px;
      }
    }
  }
`;

const Empty = styled(Panel)`
  text-align: center;
  color: var(--pp-text-3);
  font-size: 14px;
  padding: 40px 20px;
`;

export default function AdminGallery({ onDataChanged }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);

  const fileInput = useRef(null);

  const reload = useCallback(async () => {
    try {
      setPhotos(await api.get('/api/admin/gallery'));
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Не вдалося завантажити галерею');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /* Після кожної зміни оновлюємо і публічний стор, щоб сайт у сусідній
     вкладці показував той самий список без перезавантаження */
  const sync = useCallback(
    async note => {
      await reload();
      if (onDataChanged) await onDataChanged();
      setMessage(note);
    },
    [reload, onDataChanged]
  );

  const upload = async event => {
    const files = Array.from(event.target.files || []);
    /* Скидаємо input одразу: інакше повторний вибір того самого файлу
       не викличе onChange */
    event.target.value = '';
    if (!files.length) return;

    setBusy(true);
    setError('');
    setMessage('');

    try {
      for (const file of files) {
        const uploaded = await api.upload(file);
        await api.post('/api/admin/gallery', {
          url: uploaded.url,
          alt: '',
          is_active: true
        });
      }
      await sync(
        files.length === 1
          ? 'Фотографію додано — вона вже на сайті'
          : `Додано фотографій: ${files.length}`
      );
    } catch (uploadError) {
      setError(uploadError.message || 'Не вдалося завантажити фотографію');
    } finally {
      setBusy(false);
    }
  };

  const move = async (index, step) => {
    const next = photos.slice();
    const target = index + step;
    if (target < 0 || target >= next.length) return;

    const moved = next[index];
    next[index] = next[target];
    next[target] = moved;

    /* Показуємо новий порядок одразу, не чекаючи відповіді */
    setPhotos(next);
    setBusy(true);

    try {
      await api.put('/api/admin/gallery/reorder', {
        ids: next.map(photo => photo.id)
      });
      await sync('Порядок збережено');
    } catch (moveError) {
      setError(moveError.message || 'Не вдалося змінити порядок');
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const toggle = async photo => {
    setBusy(true);
    try {
      await api.put(`/api/admin/gallery/${photo.id}`, {
        is_active: !photo.is_active
      });
      await sync(photo.is_active ? 'Фото приховано на сайті' : 'Фото показано на сайті');
    } catch (toggleError) {
      setError(toggleError.message || 'Не вдалося змінити видимість');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.del(`/api/admin/gallery/${removing.id}`);
      setRemoving(null);
      await sync('Фотографію видалено — вона зникла з сайту');
    } catch (deleteError) {
      setError(deleteError.message || 'Не вдалося видалити фотографію');
      setRemoving(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageTitle>
        <div>
          <h1>Галерея</h1>
          <p>
            {loading
              ? 'Завантаження…'
              : `${photos.length} фото · сторінка /collection`}
          </p>
        </div>
        <Button type="button" disabled={busy} onClick={() => fileInput.current.click()}>
          {busy ? 'Зачекайте…' : '+ Додати фотографію'}
        </Button>
      </PageTitle>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={upload}
        style={{ display: 'none' }}
      />

      {error && <Notice $error>{error}</Notice>}
      {message && !error && <Notice>{message}</Notice>}

      {!loading && photos.length === 0 && (
        <Empty>
          Галерея порожня. Натисніть «+ Додати фотографію» — вона одразу з'явиться
          на сторінці колекції.
        </Empty>
      )}

      <Board>
        {photos.map((photo, index) => (
          <Card key={photo.id} $dim={!photo.is_active}>
            <div
              className="preview"
              style={{ backgroundImage: `url(${mediaUrl(photo.url)})` }}
            >
              <span className="order">{index + 1}</span>
              {!photo.is_active && <span className="hidden-flag">Приховано</span>}
            </div>
            <div className="bar">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={busy || index === 0}
                title="Перемістити раніше"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={busy || index === photos.length - 1}
                title="Перемістити пізніше"
              >
                →
              </button>
              <button
                type="button"
                onClick={() => toggle(photo)}
                disabled={busy}
                title={photo.is_active ? 'Приховати на сайті' : 'Показати на сайті'}
              >
                {photo.is_active ? 'Сховати' : 'Показати'}
              </button>
              <button
                type="button"
                onClick={() => setRemoving(photo)}
                disabled={busy}
                title="Видалити"
              >
                ×
              </button>
            </div>
          </Card>
        ))}
      </Board>

      {photos.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <GhostBtn type="button" disabled={busy} onClick={() => fileInput.current.click()}>
            + Додати ще фотографії
          </GhostBtn>
        </div>
      )}

      {removing && (
        <ConfirmDialog
          title="Видалити фотографію?"
          text="Вона одразу зникне з галереї на сайті. Каталогу й товарів це не торкнеться."
          confirmLabel="Видалити"
          onCancel={() => setRemoving(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
