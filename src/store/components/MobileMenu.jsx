import React, { useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import ThemeToggle from './ThemeToggle';
import { media } from '../utils/responsive';

/* ======================================================
   Перевикористовуване мобільне меню (drawer) для магазину.

   Компонент повністю прихований на десктопі (> 1024px) через media query,
   тому desktop-верстка залишається недоторканою — ніяких перевірок
   window.innerWidth у JS немає, лише CSS.
   ====================================================== */

/* Блокуємо скрол сторінки, поки меню відкрите.
   Селектори продубльовані (.body-store-mode.body-store-mode) навмисно —
   так специфічність перебиває глобальні `overflow-y: auto !important`
   з src/index.js та ProductDetail.jsx незалежно від порядку інжекту стилів.
   Правило діє тільки в мобільному діапазоні, тож десктоп не зачіпає. */
const BodyScrollLock = createGlobalStyle`
  ${media.tablet} {
    html.body-store-mode.body-store-mode,
    body.body-store-mode.body-store-mode {
      overflow: hidden !important;
    }
  }
`;

export const HamburgerButton = styled.button`
  /* На десктопі кнопки не існує взагалі */
  display: none;

  ${media.tablet} {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 44px;
    height: 44px;
    padding: 0;
    margin: 0;
    background: transparent;
    border: none;
    outline: none;
    cursor: pointer;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;

    span {
      display: block;
      width: 22px;
      height: 2px;
      border-radius: 2px;
      background: ${props => props.color || '#ffffff'};
      transition: transform 0.25s ease, opacity 0.2s ease;
    }
  }
`;

const Overlay = styled.div`
  display: none;

  ${media.tablet} {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(6, 8, 12, 0.62);
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
    z-index: 998;
    opacity: ${props => (props.isOpen ? 1 : 0)};
    visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
    transition: opacity 0.28s ease, visibility 0.28s ease;
  }
`;

const Panel = styled.aside`
  display: none;

  ${media.tablet} {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 340px;
    max-width: 86vw;
    box-sizing: border-box;
    padding: 12px 18px calc(28px + env(safe-area-inset-bottom, 0px)) 18px;
    background: linear-gradient(180deg, var(--pp-chrome-menu) 0%, var(--pp-chrome-bottom) 100%);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: -18px 0 44px rgba(0, 0, 0, 0.45);
    color: #ffffff;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    z-index: 999;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    transform: translateX(${props => (props.isOpen ? '0' : '100%')});
    visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.3s ease;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  margin-bottom: 6px;

  .panel-title {
    font-family: 'Times New Roman', serif;
    font-size: 15px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--pp-accent);
  }
`;

const CloseButton = styled.button`
  width: 44px;
  height: 44px;
  margin-right: -10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  border-radius: 50%;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: rgba(255, 255, 255, 0.08);
  }

  svg {
    stroke: currentColor;
    fill: none;
    stroke-width: 1.6;
    stroke-linecap: round;
  }
`;

const SectionTitle = styled.div`
  font-size: 10px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
  margin: 18px 0 6px 0;
`;

const MenuList = styled.nav`
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
`;

const MenuItem = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  color: #ffffff;
  font-size: 15px;
  font-family: inherit;
  text-align: left;
  min-height: 52px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  width: 100%;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: rgba(255, 255, 255, 0.05);
  }

  .chevron {
    color: rgba(255, 255, 255, 0.35);
    font-size: 16px;
  }

  /* Кількість в обраному / кошику поруч із назвою пункту */
  .count {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    margin-left: 8px;
    border-radius: 999px;
    background-color: var(--pp-accent);
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    line-height: 20px;
    text-align: center;
    box-sizing: border-box;
  }

  .label-row {
    display: flex;
    align-items: center;
    min-width: 0;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.78);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);

  .icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    flex-shrink: 0;
    color: #ffffff;
    opacity: 0.8;

    svg {
      stroke: currentColor;
      fill: none;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }
`;

const ContactLink = styled.a`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 52px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  color: #ffffff;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;

  .contact-label {
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.38);
  }

  .contact-value {
    font-size: 15px;
    margin-top: 2px;
    word-break: break-word;
  }
`;

const CtaButton = styled.button`
  margin-top: 22px;
  width: 100%;
  min-height: 48px;
  padding: 12px 18px;
  background-color: var(--pp-accent);
  color: #ffffff;
  border: none;
  border-radius: 24px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background-color: var(--pp-accent-strong);
  }
`;

/* Рядок перемикача теми — той самий контрол, що й у шапці */
const ThemeRow = styled.div`
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;

  .theme-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.82);
  }
`;

/**
 * @param {boolean}  isOpen
 * @param {Function} onClose
 * @param {Array}    links     [{ label, onClick }]
 * @param {Array}    info      [{ label, icon }]   — нелінковані пункти (як на десктопі)
 * @param {Array}    contacts  [{ label, value, href }]
 * @param {Object}   cta       { label, onClick }
 */
export default function MobileMenu({
  isOpen = false,
  onClose,
  links = [],
  info = [],
  contacts = [],
  cta = null
}) {
  /* Закриття по Escape (актуально для планшетів з клавіатурою) */
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = event => {
      if (event.key === 'Escape' || event.key === 'Esc') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNavigate = action => () => {
    onClose();
    if (typeof action === 'function') action();
  };

  return (
    <React.Fragment>
      {isOpen && <BodyScrollLock />}

      <Overlay isOpen={isOpen} onClick={onClose} aria-hidden="true" />

      <Panel
        isOpen={isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Головне меню"
        aria-hidden={!isOpen}
      >
        <PanelHeader>
          <span className="panel-title">Меню</span>
          <CloseButton type="button" onClick={onClose} aria-label="Закрити меню">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </CloseButton>
        </PanelHeader>

        {links.length > 0 && (
          <React.Fragment>
            <SectionTitle>Навігація</SectionTitle>
            <MenuList>
              {links.map(link => (
                <MenuItem
                  key={link.label}
                  type="button"
                  onClick={handleNavigate(link.onClick)}
                >
                  <span className="label-row">
                    {link.label}
                    {link.badge > 0 && <span className="count">{link.badge}</span>}
                  </span>
                  <span className="chevron">›</span>
                </MenuItem>
              ))}
            </MenuList>
          </React.Fragment>
        )}

        {info.length > 0 && (
          <React.Fragment>
            <SectionTitle>Сервіс</SectionTitle>
            <div>
              {info.map(item => (
                <InfoRow key={item.label}>
                  {item.icon && <span className="icon-box">{item.icon}</span>}
                  <span>{item.label}</span>
                </InfoRow>
              ))}
            </div>
          </React.Fragment>
        )}

        {contacts.length > 0 && (
          <React.Fragment>
            <SectionTitle>Контакти</SectionTitle>
            <div>
              {contacts.map(contact => (
                <ContactLink key={contact.value} href={contact.href}>
                  <span className="contact-label">{contact.label}</span>
                  <span className="contact-value">{contact.value}</span>
                </ContactLink>
              ))}
            </div>
          </React.Fragment>
        )}

        <SectionTitle>Оформлення</SectionTitle>
        <ThemeRow>
          <span className="theme-label">Нічна тема</span>
          <ThemeToggle />
        </ThemeRow>

        {cta && (
          <CtaButton type="button" onClick={handleNavigate(cta.onClick)}>
            {cta.label}
          </CtaButton>
        )}
      </Panel>
    </React.Fragment>
  );
}
