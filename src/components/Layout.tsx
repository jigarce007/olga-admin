import { NavLink, Outlet } from 'react-router-dom';
import { useMocks } from '../api/client';

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/members', label: 'Members' },
  { to: '/events', label: 'Events' },
  { to: '/moderation', label: 'Moderation' },
  { to: '/privacy', label: 'Privacy requests' },
  { to: '/settings', label: 'Settings' },
];

export function Layout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="logo">O</span> Olga Admin</div>
        <nav>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        {useMocks && <div className="mock-flag">Mock data</div>}
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
