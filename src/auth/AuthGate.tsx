import type { ReactNode } from 'react';
import { config } from '../config';
import { activeAccount, hasRequiredRole, login, logout } from './msal';

export function AuthGate({ children }: { children: ReactNode }) {
  if (!config().auth.enabled) return <>{children}</>;

  const account = activeAccount();
  if (!account) {
    return (
      <div className="center-screen">
        <div className="card auth-card">
          <span className="logo lg">O</span>
          <h1>Olga Admin</h1>
          <p className="muted">Sign in with your organisation account to continue.</p>
          <button className="btn btn-primary btn-block" onClick={() => void login()}>Sign in</button>
        </div>
      </div>
    );
  }

  if (!hasRequiredRole(account)) {
    return (
      <div className="center-screen">
        <div className="card auth-card">
          <h1>Access denied</h1>
          <p className="muted">
            <strong>{account.username}</strong> is signed in but doesn't have the <code>{config().auth.requiredRole}</code> role.
            Ask an administrator to grant it.
          </p>
          <button className="btn btn-block" onClick={() => void logout()}>Sign out</button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
