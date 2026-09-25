import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { activeAccount, logout } from '../auth/msal';
import { config } from '../config';
import { ErrorBoundary } from './feedback';

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/members', label: 'Members' },
  { to: '/events', label: 'Events' },
  { to: '/moderation', label: 'Moderation' },
  { to: '/privacy', label: 'Privacy requests' },
  { to: '/settings', label: 'Settings' },
];

const envLabel = { local: 'Local', dev: 'Dev', staging: 'Staging', production: 'Production' } as const;

export function Layout() {
  const { environment, useMocks, auth } = config();
  const account = activeAccount();

  return (
    <div className="shell">
      <a href="#main" className="skip-link">Skip to content</a>
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">O</span> Olga Admin
          <span className={`env env-${environment}`}>{envLabel[environment]}</span>
        </div>
        <nav aria-label="Main">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          {useMocks && <div className="mock-flag">Mock data</div>}
          {auth.enabled && account && (
            <div className="user">
              <span className="user-name" title={account.username}>{account.name ?? account.username}</span>
              <button className="btn btn-sm" onClick={() => void logout()}>Sign out</button>
            </div>
          )}
        </div>
      </aside>
      <main className="content" id="main">
        <ErrorBoundary>
          <Suspense fallback={<p className="muted pad">Loading…</p>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}
