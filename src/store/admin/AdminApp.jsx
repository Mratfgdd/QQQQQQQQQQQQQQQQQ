import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { api } from '../api/client';
import { loadCatalog } from '../data/catalogStore';
import ThemeToggle from '../components/ThemeToggle';
import AdminLogin from './AdminLogin';
import AdminProducts from './AdminProducts';
import {
  AdminShell,
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
  useAdminSession
} from './AdminUI';
import { media } from '../utils/responsive';

/**
 * Адмін-панель Parket Planet.
 *
 * Доступ визначає бекенд: поки /api/auth/me не підтвердив сесію (HttpOnly-кука),
 * показуємо екран входу. Це зручність для користувача, а не захист —
 * справжній захист стоїть на кожному /api/admin/* ендпоїнті.
 *
 * Тема — спільна з сайтом (CSS-змінні --pp-*), тому Day/Night працює тут
 * так само, і перемикач у сайдбарі це той самий компонент, що й у шапці.
 */

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products', label: 'Товари' },
  { key: 'categories', label: 'Категорії' },
  { key: 'settings', label: 'Налаштування' }
];

const Sidebar = styled.aside`
  width: 246px;
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--pp-chrome-top) 0%, var(--pp-chrome-bottom) 100%);
  color: #ffffff;
  padding: 26px 18px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: sticky;
  top: 0;
  height: 100vh;

  .brand {
    padding: 0 8px 22px 8px;

    h2 {
      font-family: 'Times New Roman', serif;
      font-size: 19px;
      font-weight: 400;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 0 0 4px 0;
    }

    span {
      font-size: 10.5px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--pp-accent);
    }
  }

  .spacer {
    flex: 1;
  }

  .foot {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .who {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      padding: 0 8px;
    }

    .theme {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 0 8px;
      font-size: 12.5px;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  /* ── ПЛАНШЕТ / ТЕЛЕФОН: сайдбар стає верхнім меню ── */
  ${media.tablet} {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    padding: 14px 16px;
    gap: 8px;

    .brand {
      padding: 0 8px 0 0;
      width: 100%;
    }

    .spacer {
      display: none;
    }

    .foot {
      width: 100%;
      border-top: none;
      padding-top: 4px;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }
`;

/* Помітна, але спокійна кнопка виходу на сайт */
const BackToSite = styled.a`
  display: block;
  margin: 0 0 14px 0;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
  text-align: center;
  transition: border-color 0.25s ease, color 0.25s ease;

  &:hover {
    border-color: var(--pp-accent);
    color: #ffffff;
  }

  ${media.tablet} {
    margin: 0;
    min-height: 44px;
    line-height: 24px;
    flex: 1 1 auto;
  }
`;

const NavItem = styled.button`
  appearance: none;
  border: none;
  background: ${props => (props.$active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  color: ${props => (props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.68)')};
  font-family: inherit;
  font-size: 14px;
  text-align: left;
  padding: 11px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.25s ease, color 0.25s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.07);
  }

  ${media.tablet} {
    flex: 1 1 auto;
    min-height: 44px;
    text-align: center;
    font-size: 13px;
  }
`;

const Content = styled.main`
  flex: 1;
  min-width: 0;
  padding: 30px 34px 60px 34px;
  box-sizing: border-box;

  ${media.tablet} {
    padding: 22px 20px 48px 20px;
  }

  ${media.mobile} {
    padding: 18px 14px 40px 14px;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 24px;

  ${media.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Stat = styled(Panel)`
  .value {
    font-family: 'Times New Roman', serif;
    font-size: 34px;
    color: var(--pp-text);
    line-height: 1;
  }

  .label {
    display: block;
    margin-top: 8px;
    font-size: 11.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--pp-text-3);
  }
`;

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  ${media.tablet} {
    grid-template-columns: 1fr;
  }
`;

const MiniList = styled.ul`
  list-style: none;
  margin: 12px 0 0 0;
  padding: 0;

  li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 13.5px;
    color: var(--pp-text-2);
    padding: 9px 0;
    border-bottom: 1px solid var(--pp-divider);

    &:last-child { border-bottom: none; }

    span:last-child { color: var(--pp-text-3); white-space: nowrap; }
  }
`;

/* ── Dashboard ── */
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/api/admin/stats')
      .then(setStats)
      .catch(() => setError('Не вдалося завантажити статистику'));
  }, []);

  if (error) return <Notice $error>{error}</Notice>;
  if (!stats) return <Notice>Завантаження…</Notice>;

  return (
    <div>
      <PageTitle>
        <div>
          <h1>Parket Planet</h1>
          <p>Адмін-панель — огляд магазину</p>
        </div>
      </PageTitle>

      <StatGrid>
        <Stat><div className="value">{stats.products}</div><span className="label">Товари</span></Stat>
        <Stat><div className="value">{stats.categories}</div><span className="label">Категорії</span></Stat>
        <Stat><div className="value">{stats.in_stock}</div><span className="label">В наявності</span></Stat>
        <Stat><div className="value">{stats.popular}</div><span className="label">Популярні</span></Stat>
      </StatGrid>

      <TwoColumns>
        <Panel>
          <strong>Останні додані товари</strong>
          <MiniList>
            {stats.latest.map(item => (
              <li key={item.id}>
                <span>{item.title}</span>
                <span>{item.price.toLocaleString('uk-UA')} грн</span>
              </li>
            ))}
          </MiniList>
        </Panel>
        <Panel>
          <strong>Нещодавно змінені</strong>
          <MiniList>
            {stats.recently_updated.map(item => (
              <li key={item.id}>
                <span>{item.title}</span>
                <span>{new Date(item.updated_at).toLocaleDateString('uk-UA')}</span>
              </li>
            ))}
          </MiniList>
        </Panel>
      </TwoColumns>
    </div>
  );
}

/* ── Категорії ── */
function Categories({ categories, reload }) {
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState('');

  const save = async event => {
    event.preventDefault();
    const payload = {
      slug: editing.slug.trim(),
      title: editing.title.trim(),
      breadcrumb: editing.breadcrumb || editing.title,
      subtitle: editing.subtitle || '',
      image: editing.image || '',
      position: Number(editing.position) || 0
    };

    try {
      if (editing.id) {
        await api.put(`/api/admin/categories/${editing.id}`, payload);
      } else {
        await api.post('/api/admin/categories', payload);
      }
      setEditing(null);
      setError('');
      await reload();
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const remove = async force => {
    try {
      await api.del(`/api/admin/categories/${removing.id}${force ? '?force=true' : ''}`);
      setRemoving(null);
      setError('');
      await reload();
    } catch (deleteError) {
      /* 409 — у категорії є товари; показуємо попередження й пропонуємо підтвердити */
      if (deleteError.status === 409) {
        setRemoving(Object.assign({}, removing, { warning: deleteError.message }));
      } else {
        setError(deleteError.message);
        setRemoving(null);
      }
    }
  };

  return (
    <div>
      <PageTitle>
        <div>
          <h1>Категорії</h1>
          <p>{categories.length} категорії на сайті</p>
        </div>
        <Button
          type="button"
          onClick={() =>
            setEditing({ slug: '', title: '', breadcrumb: '', subtitle: '', image: '', position: categories.length })
          }
        >
          + Додати категорію
        </Button>
      </PageTitle>

      {error && <Notice $error>{error}</Notice>}

      {editing && (
        <Panel as="form" onSubmit={save} style={{ marginBottom: 18 }}>
          <FormGrid>
            <Field>
              <span className="label">Назва</span>
              <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} required />
            </Field>
            <Field>
              <span className="label">Slug (адреса)</span>
              <input
                value={editing.slug}
                onChange={e => setEditing({ ...editing, slug: e.target.value })}
                pattern="[a-z0-9-]+"
                required
              />
            </Field>
            <Field>
              <span className="label">Хлібні крихти</span>
              <input value={editing.breadcrumb} onChange={e => setEditing({ ...editing, breadcrumb: e.target.value })} />
            </Field>
            <Field>
              <span className="label">Порядок</span>
              <input type="number" value={editing.position} onChange={e => setEditing({ ...editing, position: e.target.value })} />
            </Field>
          </FormGrid>
          <div style={{ marginTop: 16 }}>
            <Field>
              <span className="label">Опис</span>
              <input value={editing.subtitle} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <Button type="submit">Зберегти</Button>
            <GhostBtn type="button" onClick={() => setEditing(null)}>Скасувати</GhostBtn>
          </div>
        </Panel>
      )}

      <Rows>
        {categories.map(category => (
          <Row key={category.id}>
            <div className="thumb" />
            <div className="name">
              <strong>{category.title}</strong>
              <small>/{category.slug}</small>
            </div>
            <span className="muted">{category.subtitle}</span>
            <span className="muted">{category.product_count} товар(ів)</span>
            <Badge $on={category.product_count > 0}>#{category.position}</Badge>
            <div className="actions">
              <GhostBtn type="button" onClick={() => setEditing(category)}>Редагувати</GhostBtn>
              <DangerBtn type="button" onClick={() => setRemoving(category)}>Видалити</DangerBtn>
            </div>
          </Row>
        ))}
      </Rows>

      {removing && (
        <ConfirmDialog
          title="Видалити категорію?"
          text={
            removing.warning
              ? `${removing.warning} Товари буде видалено разом із категорією.`
              : `Ви впевнені, що хочете видалити «${removing.title}»?`
          }
          confirmLabel={removing.warning ? 'Так, видалити з товарами' : 'Видалити'}
          onCancel={() => setRemoving(null)}
          onConfirm={() => remove(Boolean(removing.warning))}
        />
      )}
    </div>
  );
}

/* ── Налаштування: зміна пароля ── */
function Settings({ user }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const save = async event => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (next !== repeat) {
      setError('Новий пароль і підтвердження не збігаються');
      return;
    }

    try {
      await api.post('/api/auth/password', { current_password: current, new_password: next });
      setCurrent('');
      setNext('');
      setRepeat('');
      setMessage('Пароль змінено. Він збережений лише у вигляді bcrypt-хешу.');
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <div>
      <PageTitle>
        <div>
          <h1>Налаштування</h1>
          <p>Обліковий запис адміністратора: {user.username}</p>
        </div>
      </PageTitle>

      {message && <Notice>{message}</Notice>}
      {error && <Notice $error>{error}</Notice>}

      <Panel as="form" onSubmit={save} style={{ maxWidth: 520 }}>
        <FormGrid $columns={1}>
          <Field>
            <span className="label">Поточний пароль</span>
            <input type="password" value={current} onChange={e => setCurrent(e.target.value)} required autoComplete="current-password" />
          </Field>
          <Field>
            <span className="label">Новий пароль (мінімум 6 символів)</span>
            <input type="password" value={next} onChange={e => setNext(e.target.value)} minLength={6} required autoComplete="new-password" />
          </Field>
          <Field>
            <span className="label">Повторіть новий пароль</span>
            <input type="password" value={repeat} onChange={e => setRepeat(e.target.value)} minLength={6} required autoComplete="new-password" />
          </Field>
        </FormGrid>
        <div style={{ marginTop: 18 }}>
          <Button type="submit">Змінити пароль</Button>
        </div>
      </Panel>
    </div>
  );
}

export default function AdminApp() {
  const { user, checking, refresh, setUser } = useAdminSession();
  const [section, setSection] = useState('dashboard');
  const [categories, setCategories] = useState([]);

  const reloadCategories = useCallback(async () => {
    try {
      setCategories(await api.get('/api/admin/categories'));
    } catch (error) {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    if (user) reloadCategories();
  }, [user, reloadCategories]);

  /* Після будь-якої зміни оновлюємо і публічний каталог, щоб сайт
     в іншій вкладці/за навігацією одразу показував свіжі дані */
  const syncSite = useCallback(async () => {
    await reloadCategories();
    await loadCatalog();
  }, [reloadCategories]);

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      /* навіть якщо запит не пройшов — локально виходимо */
    }
    setUser(null);
  };

  if (checking) {
    return (
      <AdminShell>
        <Content>
          <Notice>Перевіряємо сесію…</Notice>
        </Content>
      </AdminShell>
    );
  }

  if (!user) return <AdminLogin onSuccess={refresh} />;

  return (
    <AdminShell>
      <Sidebar>
        <div className="brand">
          <h2>Parket Planet</h2>
          <span>Адмін-панель</span>
        </div>

        <BackToSite href="/" title="Відкрити головну сторінку сайту">
          ← Повернутися на сайт
        </BackToSite>

        {SECTIONS.map(item => (
          <NavItem
            key={item.key}
            type="button"
            $active={section === item.key}
            onClick={() => setSection(item.key)}
          >
            {item.label}
          </NavItem>
        ))}

        <div className="spacer" />

        <div className="foot">
          <div className="theme">
            <span>Тема</span>
            <ThemeToggle />
          </div>
          <div className="who">Ви увійшли як {user.username}</div>
          <NavItem type="button" onClick={logout}>
            Вийти
          </NavItem>
        </div>
      </Sidebar>

      <Content>
        {section === 'dashboard' && <Dashboard />}
        {section === 'products' && (
          <AdminProducts categories={categories} onDataChanged={syncSite} />
        )}
        {section === 'categories' && <Categories categories={categories} reload={syncSite} />}
        {section === 'settings' && <Settings user={user} />}
      </Content>
    </AdminShell>
  );
}
