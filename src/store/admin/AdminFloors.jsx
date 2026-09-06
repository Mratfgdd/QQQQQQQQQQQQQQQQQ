import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { api, mediaUrl } from '../api/client';
import {
  Badge,
  Button,
  ConfirmDialog,
  DangerBtn,
  Field,
  FormGrid,
  GhostBtn,
  Notice,
  PageTitle,
  Panel,
  Row,
  Rows
} from './AdminUI';

/**
 * Розділ «3D Матеріали».
 *
 * ОКРЕМА СУТНІСТЬ. Матеріал живе у власній таблиці floor_materials і
 * керується через /api/admin/floors. Він НЕ є товаром: створення матеріалу
 * не додає нічого в каталог, пошук, кошик чи обране, а видалення матеріалу
 * не чіпає товари — і навпаки.
 *
 * Раніше 3D-підлога була товаром із прапорцем available_in_3d, через що
 * матеріал для залу автоматично з'являвся в каталозі. Це виправлено на
 * рівні даних, а не фільтром у відображенні.
 */

const KINDS = ['Паркет', 'Паркетна дошка', 'Ламінат'];

const TextureBox = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 10px;

  .preview {
    width: 92px;
    height: 92px;
    border-radius: 10px;
    border: 1px solid var(--pp-divider);
    background-color: var(--pp-surface-2);
    background-size: cover;
    background-position: center;
    flex-shrink: 0;
  }

  .hint {
    font-size: 12.5px;
    color: var(--pp-text-3);
    line-height: 1.5;
    max-width: 46ch;
  }
`;

const emptyFloor = () => ({
  slug: '',
  name: '',
  kind: KINDS[0],
  description: '',
  preview_url: '',
  texture_url: '',
  texture_repeat: 4,
  is_active: true,
  position: 0
});

function FloorForm({ floor, onCancel, onSaved }) {
  const [form, setForm] = useState(floor);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState('');
  const isNew = !floor.id;

  const set = (field, value) => setForm(prev => Object.assign({}, prev, { [field]: value }));

  const uploadFile = async (event, kind) => {
    const file = (event.target.files || [])[0];
    event.target.value = '';
    if (!file) return;

    setUploading(kind);
    setError('');

    try {
      const result = await api.upload(file);
      set(kind === 'texture' ? 'texture_url' : 'preview_url', result.url);
    } catch (uploadError) {
      setError(
        kind === 'texture'
          ? `Не вдалося завантажити текстуру: ${uploadError.message}`
          : `Не вдалося завантажити прев'ю: ${uploadError.message}`
      );
    } finally {
      setUploading('');
    }
  };

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');

    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      kind: form.kind || KINDS[0],
      description: form.description || '',
      preview_url: form.preview_url || '',
      texture_url: form.texture_url || '',
      texture_repeat: Number(form.texture_repeat) || 4,
      is_active: Boolean(form.is_active),
      position: Number(form.position) || 0
    };

    if (!payload.texture_url) {
      setError('Завантажте текстуру — без неї матеріал не можна показати у 3D');
      setBusy(false);
      return;
    }

    try {
      if (isNew) {
        await api.post('/api/admin/floors', payload);
      } else {
        await api.put(`/api/admin/floors/${floor.id}`, payload);
      }
      await onSaved(
        isNew
          ? 'Матеріал додано — він доступний у 3D і НЕ потрапив у каталог'
          : 'Зміни збережено'
      );
    } catch (saveError) {
      setError(saveError.message);
      setBusy(false);
    }
  };

  return (
    <Panel as="form" onSubmit={submit}>
      <PageTitle>
        <div>
          <h1>{isNew ? 'Новий 3D-матеріал' : `Редагування: ${floor.name}`}</h1>
          <p>Використовується лише у 3D-візуалізаторі — у каталог не потрапляє</p>
        </div>
        <GhostBtn type="button" onClick={onCancel}>
          ← Назад до списку
        </GhostBtn>
      </PageTitle>

      {error && <Notice $error>{error}</Notice>}

      <FormGrid>
        <Field>
          <span className="label">Назва</span>
          <input value={form.name} onChange={e => set('name', e.target.value)} required />
        </Field>
        <Field>
          <span className="label">Slug (технічний ідентифікатор)</span>
          <input
            value={form.slug}
            onChange={e => set('slug', e.target.value)}
            pattern="[a-z0-9-]+"
            title="Лише малі латинські літери, цифри й дефіс"
            required
          />
        </Field>
        <Field>
          <span className="label">Тип</span>
          <select value={form.kind} onChange={e => set('kind', e.target.value)}>
            {KINDS.map(kind => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <span className="label">Масштаб текстури (повторів)</span>
          <input
            type="number"
            step="0.5"
            min="0.5"
            value={form.texture_repeat}
            onChange={e => set('texture_repeat', e.target.value)}
          />
        </Field>
        <Field>
          <span className="label">Активний у 3D</span>
          <select
            value={form.is_active ? 'yes' : 'no'}
            onChange={e => set('is_active', e.target.value === 'yes')}
          >
            <option value="yes">Так — показувати у візуалізаторі</option>
            <option value="no">Ні</option>
          </select>
        </Field>
        <Field>
          <span className="label">Порядок відображення</span>
          <input
            type="number"
            value={form.position}
            onChange={e => set('position', e.target.value)}
          />
        </Field>
      </FormGrid>

      <div style={{ marginTop: 16 }}>
        <Field>
          <span className="label">Опис (службовий, на сайті не показується)</span>
          <input value={form.description} onChange={e => set('description', e.target.value)} />
        </Field>
      </div>

      {/* ── Прев'ю для списку вибору в 3D ── */}
      <div style={{ marginTop: 22 }}>
        <span
          className="label"
          style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pp-text-3)' }}
        >
          Прев'ю (плитка у списку вибору)
        </span>
        <TextureBox>
          <div
            className="preview"
            style={form.preview_url ? { backgroundImage: `url(${mediaUrl(form.preview_url)})` } : undefined}
          />
          <div>
            <input
              id="pp-floor-preview"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={e => uploadFile(e, 'preview')}
              style={{ display: 'none' }}
            />
            <GhostBtn
              type="button"
              disabled={uploading === 'preview'}
              onClick={() => document.getElementById('pp-floor-preview').click()}
            >
              {uploading === 'preview' ? 'Завантаження…' : 'Завантажити прев’ю'}
            </GhostBtn>
            <div className="hint" style={{ marginTop: 10 }}>
              Необов'язково. Якщо не завантажити — у списку показується сама текстура.
            </div>
          </div>
        </TextureBox>
      </div>

      {/* ── Текстура ── */}
      <div style={{ marginTop: 22 }}>
        <span
          className="label"
          style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pp-text-3)' }}
        >
          3D-текстура (обов'язково)
        </span>
        <TextureBox>
          <div
            className="preview"
            style={form.texture_url ? { backgroundImage: `url(${mediaUrl(form.texture_url)})` } : undefined}
          />
          <div>
            <input
              id="pp-floor-texture"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={e => uploadFile(e, 'texture')}
              style={{ display: 'none' }}
            />
            <GhostBtn
              type="button"
              disabled={uploading === 'texture'}
              onClick={() => document.getElementById('pp-floor-texture').click()}
            >
              {uploading === 'texture'
                ? 'Завантаження…'
                : form.texture_url
                ? 'Замінити текстуру'
                : 'Завантажити текстуру'}
            </GhostBtn>
            <div className="hint" style={{ marginTop: 10 }}>
              Безшовне квадратне зображення дерева, 1024×1024 або 2048×2048.
              Текстура повторюється по підлозі — масштаб задає поле вище.
            </div>
          </div>
        </TextureBox>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
        <Button type="submit" disabled={busy}>
          {busy ? 'Зберігаємо…' : isNew ? 'Створити матеріал' : 'Зберегти зміни'}
        </Button>
        <GhostBtn type="button" onClick={onCancel}>
          Скасувати
        </GhostBtn>
      </div>
    </Panel>
  );
}

export default function AdminFloors({ onDataChanged }) {
  const [materials, setMaterials] = useState([]);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMaterials(await api.get('/api/admin/floors'));
      setError('');
    } catch (loadError) {
      setError('Помилка завантаження. Перевірте, чи запущено бекенд.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const afterChange = async text => {
    setEditing(null);
    await load();
    if (onDataChanged) await onDataChanged();
    setMessage(typeof text === 'string' ? text : 'Збережено');
    window.setTimeout(() => setMessage(''), 4000);
  };

  const toggleActive = async material => {
    try {
      await api.put(`/api/admin/floors/${material.id}`, { is_active: !material.is_active });
      await afterChange(
        material.is_active ? 'Матеріал прибрано з 3D' : 'Матеріал увімкнено для 3D'
      );
    } catch (toggleError) {
      setError(toggleError.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.del(`/api/admin/floors/${removing.id}`);
      setRemoving(null);
      await afterChange('Матеріал видалено — товарів це не зачепило');
    } catch (deleteError) {
      setError(deleteError.message);
      setRemoving(null);
    }
  };

  if (editing) {
    return <FloorForm floor={editing} onCancel={() => setEditing(null)} onSaved={afterChange} />;
  }

  const active = materials.filter(material => material.is_active);

  return (
    <div>
      <PageTitle>
        <div>
          <h1>3D Матеріали</h1>
          <p>
            {loading
              ? 'Завантаження…'
              : `${active.length} з ${materials.length} доступні у візуалізаторі · у каталог не потрапляють`}
          </p>
        </div>
        <Button type="button" onClick={() => setEditing(emptyFloor())}>
          + Додати матеріал
        </Button>
      </PageTitle>

      {message && <Notice>{message}</Notice>}
      {error && <Notice $error>{error}</Notice>}

      {!loading && materials.length === 0 && (
        <Notice>
          Матеріалів ще немає. Поки список порожній, 3D-візуалізатор показує
          стандартний набір текстур проєкту.
        </Notice>
      )}

      <Rows>
        {materials.map(material => (
          <Row key={material.id}>
            <div
              className="thumb"
              style={{
                backgroundImage: `url(${mediaUrl(material.preview_url || material.texture_url)})`
              }}
            />
            <div className="name">
              <strong>{material.name}</strong>
              <small>{material.kind}</small>
            </div>
            <span className="muted">повторів: {material.texture_repeat}</span>
            <span className="muted">#{material.position}</span>
            <Badge $on={material.is_active}>
              {material.is_active ? '✓ Активний у 3D' : 'Вимкнений'}
            </Badge>
            <div className="actions">
              <GhostBtn type="button" onClick={() => toggleActive(material)}>
                {material.is_active ? 'Вимкнути' : 'Увімкнути'}
              </GhostBtn>
              <GhostBtn type="button" onClick={() => setEditing(material)}>
                Редагувати
              </GhostBtn>
              <DangerBtn type="button" onClick={() => setRemoving(material)}>
                Видалити
              </DangerBtn>
            </div>
          </Row>
        ))}
      </Rows>

      {removing && (
        <ConfirmDialog
          title="Видалити цей 3D-матеріал?"
          text={`Ви впевнені, що хочете видалити «${removing.name}»? Він зникне лише з 3D-візуалізатора — товари каталогу це не зачепить.`}
          onCancel={() => setRemoving(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
