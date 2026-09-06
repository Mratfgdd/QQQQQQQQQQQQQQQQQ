import React from 'react';
import styled from 'styled-components';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { media } from '../utils/responsive';

/**
 * Сторінка 404.
 *
 * Потрібна не «для повноти», а щоб у роутері не лишалося жодної адреси,
 * на якій React не малює НІЧОГО. Саме така діра давала порожній чорний
 * екран: адреса не збігалася з жодним <Route>, Switch повертав null, і
 * користувач бачив голий фон документа без шапки й підказки.
 */

const Page = styled.div`
  background-color: var(--pp-bg);
  color: var(--pp-text);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', sans-serif;
`;

const Body = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 100px 24px 120px 24px;

  .code {
    font-family: 'Times New Roman', serif;
    font-size: 84px;
    line-height: 1;
    color: var(--pp-accent);
    margin-bottom: 18px;
  }

  h1 {
    font-family: 'Times New Roman', serif;
    font-size: 34px;
    font-weight: 400;
    margin: 0 0 14px 0;
  }

  p {
    font-size: 15px;
    color: var(--pp-text-2);
    line-height: 1.6;
    max-width: 460px;
    margin: 0 0 32px 0;
  }

  .path {
    font-size: 13px;
    color: var(--pp-text-3);
    margin-bottom: 32px;
    word-break: break-all;
  }

  button {
    appearance: none;
    background-color: var(--pp-accent);
    border: none;
    color: #ffffff;
    font-family: inherit;
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 15px 34px;
    border-radius: 999px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
      background-color: var(--pp-accent-strong);
      transform: translateY(-1px);
    }
  }

  ${media.mobile} {
    padding: 64px 20px 80px 20px;

    .code {
      font-size: 62px;
    }

    h1 {
      font-size: 26px;
    }
  }
`;

export default function NotFound() {
  const history = useHistory();
  const location = useLocation();

  return (
    <Page>
      <Header />
      <Body>
        <div className="code">404</div>
        <h1>Сторінку не знайдено</h1>
        <p>
          Такої адреси на сайті немає. Можливо, сторінку перейменували або
          посилання застаріло.
        </p>
        <div className="path">{location.pathname}</div>
        <button type="button" onClick={() => history.push('/')}>
          На головну
        </button>
      </Body>
      <Footer />
    </Page>
  );
}
