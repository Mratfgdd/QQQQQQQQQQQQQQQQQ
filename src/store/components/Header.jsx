import React, { useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import MobileMenu, { HamburgerButton } from './MobileMenu';
import ThemeToggle from './ThemeToggle';
import { useShop, selectFavoritesCount, selectCartCount } from '../state/shopStore';
import { media } from '../utils/responsive';

const HeaderContainer = styled.header`
  background: linear-gradient(180deg, var(--pp-chrome-top) 0%, var(--pp-chrome-bottom) 100%);
  padding: 18px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-family: 'Helvetica Neue', sans-serif;
  box-sizing: border-box;
  width: 100%;

  /* ── ПЛАНШЕТ / МОБІЛЬНИЙ ── */
  ${media.tablet} {
    padding: 10px 20px;
    position: sticky;
    top: 0;
    z-index: 90;
  }

  ${media.mobile} {
    padding: 8px 16px;
  }

  ${media.smallMobile} {
    padding: 8px 12px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  min-width: 0;

  .logo-circle {
    width: 24px;
    height: 24px;
    border: 1.5px solid var(--pp-accent);
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }

  h1 {
    font-family: 'Times New Roman', serif;
    font-size: 20px;
    font-weight: 400;
    letter-spacing: 2.5px;
    color: #ffffff;
    margin: 0;
    text-transform: uppercase;
    white-space: nowrap;
  }

  ${media.tablet} {
    gap: 10px;

    h1 {
      font-size: 17px;
      letter-spacing: 1.6px;
    }
  }

  ${media.smallMobile} {
    gap: 8px;

    .logo-circle {
      width: 20px;
      height: 20px;
    }

    h1 {
      font-size: 14px;
      letter-spacing: 1px;
    }
  }
`;

const NavLinks = styled.nav`
  display: flex;
  align-items: center;
  gap: 35px;

  /* Текстова навігація не вміщується на планшеті — переїжджає в drawer */
  ${media.tablet} {
    display: none;
  }
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;

  .icon-box {
    color: #ffffff;
    display: flex;
    align-items: center;
    opacity: 0.9;

    svg {
      stroke: #ffffff;
      fill: none;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .label {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    .sub-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 1px;
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;

  ${media.tablet} {
    gap: 12px;
  }

  ${media.mobile} {
    gap: 4px;
  }

  /* На найвужчих екранах у шапці не вистачає місця одразу на перемикач
     теми, обране, кошик і бургер. Перемикач ховаємо — він продубльований
     окремим рядком у мобільному меню. */
  ${media.smallMobile} {
    gap: 2px;

    .pp-header-theme {
      display: none;
    }
  }
`;

const CartIcon = styled.div`
  position: relative; /* якір для лічильника */
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.9;
  transition: transform 0.2s;

  svg {
    stroke: #ffffff;
    fill: none;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    transform: scale(1.05);
    opacity: 1;
  }

  /* Маленький бейдж із кількістю. З'являється лише коли є що рахувати. */
  .badge {
    position: absolute;
    top: -6px;
    right: -8px;
    min-width: 17px;
    height: 17px;
    padding: 0 4px;
    border-radius: 999px;
    background-color: var(--pp-accent);
    color: #ffffff;
    font-size: 10.5px;
    font-weight: 600;
    line-height: 17px;
    text-align: center;
    box-sizing: border-box;
    pointer-events: none;
  }

  /* Збільшуємо зону натискання під палець */
  ${media.tablet} {
    width: 44px;
    height: 44px;
    justify-content: center;
    flex-shrink: 0;

    .badge {
      top: 2px;
      right: 0;
    }
  }

  /* Телефон: у шапці тепер три контроли — трохи стискаємо */
  ${media.mobile} {
    width: 38px;
    height: 38px;

    svg {
      width: 21px;
      height: 21px;
    }
  }
`;

const VisualBtn = styled.button`
  background-color: var(--pp-accent);
  color: #ffffff;
  border: none;
  padding: 11px 26px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 4px 12px rgba(185, 147, 90, 0.15);
  white-space: nowrap;

  &:hover {
    background-color: var(--pp-accent-strong);
    transform: translateY(-1px);
  }

  /* Планшет: компактна кнопка залишається */
  ${media.tablet} {
    padding: 11px 16px;
    font-size: 11px;
    letter-spacing: 0.5px;
    min-height: 44px;
  }

  /* Телефон: кнопка переїжджає в мобільне меню */
  ${media.mobile} {
    display: none;
  }
`;

/* ── Іконки (спільні для десктопної шапки та мобільного меню) ── */
const PaymentIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const DeliveryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7" />
    <path d="M14 18H8.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <path d="M19 13h3l-3-4V4" />
  </svg>
);

const MailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function Header() {
  const history = useHistory();
  const [menuOpen, setMenuOpen] = useState(false);

  /* Лічильники беруться зі спільного стану, тому оновлюються миттєво
     з будь-якої сторінки */
  const favoritesCount = useShop(selectFavoritesCount);
  const cartCount = useShop(selectCartCount);

  const closeMenu = () => setMenuOpen(false);

  return (
    <React.Fragment>
      <HeaderContainer>
        <LogoSection onClick={() => history.push('/')}>
          <div className="logo-circle" />
          <h1>Parket Planet</h1>
        </LogoSection>

        <NavLinks>
          {/* Оплата */}
          <NavItem>
            <div className="icon-box">
              <PaymentIcon />
            </div>
            <div className="content">
              <span className="label">Оплата</span>
            </div>
          </NavItem>

          {/* Доставка */}
          <NavItem>
            <div className="icon-box">
              <DeliveryIcon />
            </div>
            <div className="content">
              <span className="label">Доставка</span>
            </div>
          </NavItem>

          {/* E-mail */}
          <NavItem>
            <div className="icon-box">
              <MailIcon />
            </div>
            <div className="content">
              <span className="label">E-mail</span>
              <span className="sub-label">parket_planet@i.ua</span>
            </div>
          </NavItem>

          {/* Телефон */}
          <NavItem>
            <div className="icon-box">
              <PhoneIcon />
            </div>
            <div className="content">
              <span className="label">Телефон</span>
              <span className="sub-label">+38 (067) 673 06 70</span>
            </div>
          </NavItem>
        </NavLinks>

        <RightSection>
          <ThemeToggle className="pp-header-theme" />

          <CartIcon
            onClick={() => history.push('/favorites')}
            role="button"
            tabIndex={0}
            aria-label={`Обране${favoritesCount ? `: ${favoritesCount}` : ''}`}
            title="Обране"
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M12 20.5s-7.5-4.7-7.5-10a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8c0 5.3-7.5 10-7.5 10z" />
            </svg>
            {favoritesCount > 0 && <span className="badge">{favoritesCount}</span>}
          </CartIcon>

          <CartIcon
            onClick={() => history.push('/cart')}
            role="button"
            tabIndex={0}
            aria-label={`Кошик${cartCount ? `: ${cartCount}` : ''}`}
            title="Кошик"
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </CartIcon>
          <VisualBtn onClick={() => history.push('/hall')}>
            3D Візуалізація
          </VisualBtn>

          {/* Видима лише на планшеті/телефоні (CSS) */}
          <HamburgerButton
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Відкрити меню"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </HamburgerButton>
        </RightSection>
      </HeaderContainer>

      <MobileMenu
        isOpen={menuOpen}
        onClose={closeMenu}
        links={[
          { label: 'Головна', onClick: () => history.push('/') },
          { label: 'Каталог', onClick: () => history.push('/catalog') },
          {
            label: 'Обране',
            badge: favoritesCount,
            onClick: () => history.push('/favorites')
          },
          { label: 'Кошик', badge: cartCount, onClick: () => history.push('/cart') }
        ]}
        info={[
          { label: 'Оплата', icon: <PaymentIcon /> },
          { label: 'Доставка', icon: <DeliveryIcon /> }
        ]}
        contacts={[
          {
            label: 'E-mail',
            value: 'parket_planet@i.ua',
            href: 'mailto:parket_planet@i.ua'
          },
          {
            label: 'Телефон',
            value: '+38 (067) 673 06 70',
            href: 'tel:+380676730670'
          }
        ]}
        cta={{ label: '3D Візуалізація', onClick: () => history.push('/hall') }}
      />
    </React.Fragment>
  );
}
