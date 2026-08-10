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
  Rows,
  Toolbar
} from './AdminUI';
import { media } from '../utils/responsive';

/**
 * Керування товарами: список із пошуком, фільтрами, сортуванням і
 * пагінацією + форма створення/редагування з галереєю фотографій.
 *
 * Список тягнемо з публічного /api/products (там уже є фільтри й
 * пагінація), а зміни йдуть у захищені /api/admin/products.
 */

const PER_PAGE = 8;

const ICONS = ['tree', 'sort', 'joint', 'polish', 'layers', 'shield', 'ruler', 'drop', 'brush'];

const Pager = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  font-size: 13px;
  color: var(--pp-text-2);
`;

const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 12px;
  margin-top: 10px;

  .slot {
    border: 1px solid var(--pp-divider);
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--pp-surface-2);
  }

  .preview {
    height: 96px;
    background-size: cover;
    background-position: center;
  }

  .bar {
    display: flex;
    gap: 4px;
    padding: 6px;
    flex-wrap: wrap;

    button {
      flex: 1;
      min-width: 30px;
      font-family: inherit;
      font-size: 11px;
      padding: 5px 4px;
      border-radius: 6px;
      border: 1px solid var(--pp-divider);
      background: var(--pp-surface);
      color: var(--pp-text-2);
      cursor: pointer;

      &:hover { border-color: var(--pp-accent); }
      &:disabled { opacity: 0.4; cursor: default; }
    }
  }

  .main-flag {
    font-size: 10.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--pp-accent);
    padding: 0 6px 6px 6px;
  }
`;

const SpecRow = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr) minmax(0, 1fr) 40px;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;

  select,
  input {
    font-family: inherit;
    font-size: 13px;
    padding: 9px 10px;
    border-radius: 8px;
    border: 1px solid var(--pp-divider);
    background: var(--pp-bg);
    color: var(--pp-text);
    width: 100%;
    box-sizing: border-box;
  }

  ${media.mobile} {
    grid-template-columns: 1fr 1fr;
  }
`;

const emptyProduct = categoryId => ({
  slug: '',
  category_id: categoryId || 1,
  title: '',
  title_top: '',
  title_bottom: '',
  short_description: '',
  description: '',
  price: 0,
  old_price: null,
  unit: 'м²',
  pack_qty: 0,
  in_stock: true,
  is_popular: false,
  discount: 0,
  position: 0,
  specs: [],
  images: []
});

function ProductForm({ product, categories, onCancel, onSaved }) {
  const [form, setForm] = useState(product);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isNew = !product.id;

  const set = (field, value) => setForm(prev => Object.assign({}, prev, { [field]: value }));

  const upload = async event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    setError('');

    for (const file of files) {
      try {
        const result = await api.upload(file);
        setForm(prev =>
          Object.assign({}, prev, {
            images: prev.images.concat({
              url: result.url,
              position: prev.images.length,
              is_main: prev.images.length === 0
            })
          })
        );
      } catch (uploadError) {
        setError(uploadError.message);
      }
    }
  };

  const moveImage = (index, delta) => {
    setForm(prev => {
      const images = prev.images.slice();
      const target = index + delta;
      if (target < 0 || target >= images.length) return prev;
      const [item] = images.splice(index, 1);
      images.splice(target, 0, item);
      return Object.assign({}, prev, {
        images: images.map((image, i) => Object.assign({}, image, { position: i, is_main: i === 0 }))
      });
    });
  };

  const removeImage = index => {
    setForm(prev => {
      const images = prev.images.filter((_, i) => i !== index);
      return Object.assign({}, prev, {
        images: images.map((image, i) => Object.assign({}, image, { position: i, is_main: i === 0 }))
      });
    });
  };

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');

    const payload = {
      slug: form.slug.trim(),
      category_id: Number(form.category_id),
      title: form.title.trim(),
      title_top: form.title_top || '',
      title_bottom: form.title_bottom || '',
      short_description: form.short_description || '',
      description: form.description || '',
      price: Number(form.price) || 0,
      old_price: form.old_price === '' || form.old_price === null ? null : Number(form.old_price),
      unit: form.unit || 'м²',
      pack_qty: Number(form.pack_qty) || 0,
      in_stock: Boolean(form.in_stock),
      is_popular: Boolean(form.is_popular),
      discount: Number(form.discount) || 0,
      position: Number(form.position) || 0,
      specs: (form.specs || []).filter(spec => spec.label && spec.value),
      images: (form.images || []).map((image, index) => ({
        url: image.url,
        position: index,
        is_main: index === 0
      }))
    };

    try {
      if (isNew) {
        await api.post('/api/admin/products', payload);
      } else {
        await api.put(`/api/admin/products/${product.id}`, payload);
      }
      await onSaved();
    } catch (saveError) {
      setError(saveError.message);
      setBusy(false);
    }
  };

  return (
    <Panel as="form" onSubmit={submit}>
      <PageTitle>
        <div>
          <h1>{isNew ? 'Новий товар' : `Редагування: ${product.title}`}</h1>
          <p>Зміни одразу застосовуються на сайті</p>
        </div>
        <GhostBtn type="button" onClick={onCancel}>
          ← Назад до списку
        </GhostBtn>
      </PageTitle>

      {error && <Notice $error>{error}</Notice>}

      <FormGrid>
        <Field>
          <span className="label">Назва товару</span>
          <input value={form.title} onChange={e => set('title', e.target.value)} required />
        </Field>
        <Field>
          <span className="label">Slug (адреса)</span>
          <input
            value={form.slug}
            onChange={e => set('slug', e.target.value)}
            pattern="[a-z0-9-]+"
            title="Лише малі латинські літери, цифри й дефіс"
            required
          />
        </Field>
        <Field>
          <span className="label">Категорія</span>
          <select value={form.category_id} onChange={e => set('category_id', e.target.value)}>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <span className="label">Одиниця виміру</span>
          <input value={form.unit} onChange={e => set('unit', e.target.value)} />
        </Field>
        <Field>
          <span className="label">Заголовок на картці, рядок 1 (порожньо → «Назва»)</span>
          <input value={form.title_top} onChange={e => set('title_top', e.target.value)} />
        </Field>
        <Field>
          <span className="label">Заголовок на картці, рядок 2</span>
          <input value={form.title_bottom} onChange={e => set('title_bottom', e.target.value)} />
        </Field>
        <Field>
          <span className="label">Ціна, грн</span>
          <input type="number" step="1" min="0" value={form.price} onChange={e => set('price', e.target.value)} />
        </Field>
        <Field>
          <span className="label">Стара ціна (необов'язково)</span>
          <input
            type="number"
            step="1"
            min="0"
            value={form.old_price === null ? '' : form.old_price}
            onChange={e => set('old_price', e.target.value)}
          />
        </Field>
        <Field>
          <span className="label">Кількість в упаковці</span>
          <input type="number" step="0.01" min="0" value={form.pack_qty} onChange={e => set('pack_qty', e.target.value)} />
        </Field>
        <Field>
          <span className="label">Знижка, %</span>
          <input type="number" min="0" max="95" value={form.discount} onChange={e => set('discount', e.target.value)} />
        </Field>
        <Field>
          <span className="label">Порядок відображення</span>
          <input type="number" value={form.position} onChange={e => set('position', e.target.value)} />
        </Field>
        <Field>
          <span className="label">Статус</span>
          <select
            value={form.in_stock ? 'yes' : 'no'}
            onChange={e => set('in_stock', e.target.value === 'yes')}
          >
            <option value="yes">В наявності</option>
            <option value="no">Немає в наявності</option>
          </select>
        </Field>
        <Field>
          <span className="label">Популярний товар</span>
          <select
            value={form.is_popular ? 'yes' : 'no'}
            onChange={e => set('is_popular', e.target.value === 'yes')}
          >
            <option value="no">Ні</option>
            <option value="yes">Так</option>
          </select>
        </Field>
      </FormGrid>

      <div style={{ marginTop: 16 }}>
        <Field>
          <span className="label">Короткий опис</span>
          <input
            value={form.short_description}
            onChange={e => set('short_description', e.target.value)}
          />
        </Field>
      </div>

      <div style={{ marginTop: 16 }}>
        <Field>
          <span className="label">Опис</span>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} />
        </Field>
      </div>

      {/* ── Характеристики ── */}
      <div style={{ marginTop: 24 }}>
        <span className="label" style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pp-text-3)' }}>
          Характеристики
        </span>
        <div style={{ marginTop: 10 }}>
          {(form.specs || []).map((spec, index) => (
            <SpecRow key={index}>
              <select
                value={spec.icon}
                onChange={e => {
                  const specs = form.specs.slice();
                  specs[index] = Object.assign({}, spec, { icon: e.target.value });
                  set('specs', specs);
                }}
              >
                {ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <input
                placeholder="Назва"
                value={spec.label}
                onChange={e => {
                  const specs = form.specs.slice();
                  specs[index] = Object.assign({}, spec, { label: e.target.value });
                  set('specs', specs);
                }}
              />
              <input
                placeholder="Значення"
                value={spec.value}
                onChange={e => {
                  const specs = form.specs.slice();
                  specs[index] = Object.assign({}, spec, { value: e.target.value });
                  set('specs', specs);
                }}
              />
              <button
                type="button"
                onClick={() => set('specs', form.specs.filter((_, i) => i !== index))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b23a2e', fontSize: 18 }}
                aria-label="Видалити характеристику"
              >
                ×
              </button>
            </SpecRow>
          ))}
          <GhostBtn
            type="button"
            onClick={() => set('specs', (form.specs || []).concat({ icon: 'tree', label: '', value: '' }))}
          >
            + Характеристика
          </GhostBtn>
        </div>
      </div>

      {/* ── Фотографії ── */}
      <div style={{ marginTop: 24 }}>
        <span className="label" style={{ fontSize: 11.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pp-text-3)' }}>
          Фотографії — перша є головною
        </span>

        <Gallery>
          {(form.images || []).map((image, index) => (
            <div className="slot" key={image.url + index}>
              <div className="preview" style={{ backgroundImage: `url(${mediaUrl(image.url)})` }} />
              {index === 0 && <div className="main-flag">Головне</div>}
              <div className="bar">
                <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} title="Ліворуч">←</button>
                <button type="button" onClick={() => moveImage(index, 1)} disabled={index === form.images.length - 1} title="Праворуч">→</button>
                <button type="button" onClick={() => removeImage(index)} title="Видалити">×</button>
              </div>
            </div>
          ))}
        </Gallery>

        <div style={{ marginTop: 12 }}>
          <input
            id="pp-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={upload}
            style={{ display: 'none' }}
          />
          <GhostBtn type="button" onClick={() => document.getElementById('pp-upload').click()}>
            + Додати фотографії
          </GhostBtn>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
        <Button type="submit" disabled={busy}>
          {busy ? 'Зберігаємо…' : 'Зберегти зміни'}
        </Button>
        <GhostBtn type="button" onClick={onCancel}>
          Скасувати
        </GhostBtn>
      </div>
    </Panel>
  );
}

export default function AdminProducts({ categories, onDataChanged }) {
  const [saved, setSaved] = useState('');
  const [list, setList] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [sort, setSort] = useState('position');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE), sort });
    if (search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    if (stock) params.set('in_stock', stock);
    if (sort === 'price' || sort === 'created') params.set('order', 'desc');

    try {
      setList(await api.get(`/api/products?${params.toString()}`));
      setError('');
    } catch (loadError) {
      setError('Не вдалося завантажити товари. Перевірте, чи запущено бекенд.');
    }
  }, [page, search, category, stock, sort]);

  useEffect(() => {
    load();
  }, [load]);

  /* Повідомлення показуємо ТІЛЬКИ після успішної відповіді бекенда:
     якщо запит упав, форма лишається відкритою з текстом помилки. */
  const afterChange = async message => {
    setEditing(null);
    await load();
    if (onDataChanged) await onDataChanged();
    setSaved(typeof message === 'string' ? message : 'Зміни збережено — сайт уже оновлено');
    window.setTimeout(() => setSaved(''), 4000);
  };

  const confirmDelete = async () => {
    try {
      await api.del(`/api/admin/products/${removing.id}`);
      setRemoving(null);
      await afterChange('Товар видалено — його більше немає на сайті');
    } catch (deleteError) {
      setError(deleteError.message);
      setRemoving(null);
    }
  };

  if (editing) {
    return (
      <ProductForm
        product={editing}
        categories={categories}
        onCancel={() => setEditing(null)}
        onSaved={afterChange}
      />
    );
  }

  return (
    <div>
      <PageTitle>
        <div>
          <h1>Товари</h1>
          <p>Знайдено {list.total} товар(ів)</p>
        </div>
        <Button type="button" onClick={() => setEditing(emptyProduct(categories[0] && categories[0].id))}>
          + Додати товар
        </Button>
      </PageTitle>

      {saved && <Notice>{saved}</Notice>}
      {error && <Notice $error>{error}</Notice>}

      <Toolbar>
        <input
          type="search"
          placeholder="🔍 Пошук товару…"
          value={search}
          onChange={e => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select value={category} onChange={e => { setPage(1); setCategory(e.target.value); }}>
          <option value="">Усі категорії</option>
          {categories.map(item => (
            <option key={item.id} value={item.slug}>{item.title}</option>
          ))}
        </select>
        <select value={stock} onChange={e => { setPage(1); setStock(e.target.value); }}>
          <option value="">Будь-яка наявність</option>
          <option value="true">В наявності</option>
          <option value="false">Немає</option>
        </select>
        <select value={sort} onChange={e => { setPage(1); setSort(e.target.value); }}>
          <option value="position">За порядком</option>
          <option value="title">За назвою</option>
          <option value="price">За ціною</option>
          <option value="created">За датою</option>
          <option value="popular">За популярністю</option>
        </select>
      </Toolbar>

      <Rows>
        {list.items.map(product => {
          const main = (product.images || [])[0];

          return (
            <Row key={product.id}>
              <div
                className="thumb"
                style={main ? { backgroundImage: `url(${mediaUrl(main.url)})` } : undefined}
              />
              <div className="name">
                <strong>{product.title}</strong>
                <small>/{product.slug}</small>
              </div>
              <span className="muted">
                {(categories.find(c => c.id === product.category_id) || {}).title || '—'}
              </span>
              <span className="muted">
                {product.price.toLocaleString('uk-UA')} грн / {product.unit}
              </span>
              <Badge $on={product.in_stock}>
                {product.in_stock ? 'В наявності' : 'Немає'}
              </Badge>
              <div className="actions">
                <GhostBtn type="button" onClick={() => setEditing(product)}>
                  Редагувати
                </GhostBtn>
                <DangerBtn type="button" onClick={() => setRemoving(product)}>
                  Видалити
                </DangerBtn>
              </div>
            </Row>
          );
        })}
      </Rows>

      {list.pages > 1 && (
        <Pager>
          <GhostBtn type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ←
          </GhostBtn>
          <span>Сторінка {list.page} з {list.pages}</span>
          <GhostBtn type="button" disabled={page >= list.pages} onClick={() => setPage(page + 1)}>
            →
          </GhostBtn>
        </Pager>
      )}

      {removing && (
        <ConfirmDialog
          title="Видалити товар?"
          text={`Ви впевнені, що хочете видалити «${removing.title}»? Його також буде прибрано з кошиків і обраного у відвідувачів.`}
          onCancel={() => setRemoving(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
