import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import config from './config';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

const server = setupServer(
  rest.get(`${config.API_BASE_URL}/api/users/me`, (req, res, ctx) => {
    const authToken = req.headers.get('x-auth-token');
    if (authToken === 'fake-auth-token-admin') {
      return res(ctx.status(200), ctx.json({ id: '1', is_admin: true }));
    }
    return res(ctx.status(200), ctx.json({ id: '1', is_admin: false }));
  }),
  rest.post(`${config.API_BASE_URL}/api/users/logout`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderApp = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <App router={MemoryRouter} />
    </I18nextProvider>
  );
};

test('renders app with game list and login links', () => {
  renderApp();
  const drinkMateElements = screen.queryAllByText(/DrinkMate/i);
  const drinkingGamesElements = screen.queryAllByText(/Drinking Games/i);
  const submitGameElements = screen.queryAllByText(/Submit a Game/i);
  const loginElements = screen.queryAllByText(/Login/i);

  expect(drinkMateElements.length).toBeGreaterThan(0);
  expect(drinkingGamesElements.length).toBeGreaterThan(0);
  expect(submitGameElements.length).toBeGreaterThan(0);
  expect(loginElements.length).toBeGreaterThan(0);
});

test('renders app with admin dashboard when user is admin', async () => {
  localStorage.setItem('authToken', 'fake-auth-token-admin');
  renderApp();
  await screen.findByText(/Admin Dashboard/i);
  expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Logout/i)).toBeInTheDocument();
});

test('renders app without admin dashboard when user is not admin', async () => {
  server.use(
    rest.get(`${config.API_BASE_URL}/api/users/me`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ id: '1', is_admin: false }));
    }),
  );

  localStorage.setItem('authToken', 'fake-auth-token');
  renderApp();
  await screen.findByText(/Logout/i);
  expect(screen.queryByText(/Admin Dashboard/i)).not.toBeInTheDocument();
});

test('user can log out', async () => {
  localStorage.setItem('authToken', 'fake-auth-token');
  renderApp();
  await screen.findByText(/Logout/i);
  fireEvent.click(screen.getByText(/Logout/i));
  await screen.findByText(/Login/i);
  expect(screen.getByText(/Login/i)).toBeInTheDocument();
});

test('user logs in but encounters an error', async () => {
  server.use(
    rest.get(`${config.API_BASE_URL}/api/users/me`, (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Test error message' }));
    }),
  );

  localStorage.setItem('authToken', 'fake-auth-token-error');
  renderApp();
  await screen.findByText(/Test error message/i, { selector: '.error-message' });
  expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
});

test('user logs in but receives an unauthorized resopnse', async () => {
  server.use(
    rest.get(`${config.API_BASE_URL}/api/users/me`, (req, res, ctx) => {
      return res(ctx.status(401));
    }),
  );

  localStorage.setItem('authToken', 'fake-auth-token-unauthorized');
  renderApp();
  await waitFor(() => expect(localStorage.getItem('authToken')).toBe(null));
});

test('component mounts with authToken in localStorage', async () => {
  server.use(
    rest.get(`${config.API_BASE_URL}/api/users/me`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ id: '1', is_admin: false }));
    }),
  );

  localStorage.setItem('authToken', 'fake-auth-token');
  renderApp();
  await screen.findByText(/Logout/i);
  expect(screen.getByText(/Logout/i)).toBeInTheDocument();
});
