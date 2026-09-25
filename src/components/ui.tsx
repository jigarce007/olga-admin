import { useState, type ReactNode } from 'react';
import { ApiError } from '../api/client';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </header>
  );
}

const tone: Record<string, string> = {
  ACTIVE: 'ok', PUBLISHED: 'ok', COMPLETED: 'neutral', ACTIONED: 'ok',
  DRAFT: 'neutral', RECEIVED: 'warn', IN_PROGRESS: 'info', REVIEWING: 'info',
  OPEN: 'warn', SUSPENDED: 'bad', DELETED: 'bad', DISMISSED: 'neutral', CANCELLED: 'bad',
};

export function Badge({ value }: { value: string }) {
  return <span className={`badge badge-${tone[value] ?? 'neutral'}`}>{value.replace(/_/g, ' ')}</span>;
}

export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card stat">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function QueryState({ isLoading, error, empty }: { isLoading: boolean; error: unknown; empty?: boolean }) {
  if (isLoading) return <p className="muted pad">Loading…</p>;
  if (error) {
    return <p className="error pad" role="alert">Failed to load: {errorMessage(error)}</p>;
  }
  if (empty) return <p className="muted pad">Nothing here yet.</p>;
  return null;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return `${error.message}${error.correlationId ? ` (correlation ${error.correlationId})` : ''}`;
  return error instanceof Error ? error.message : String(error);
}

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

/** Timestamp captured once per mount, so render stays pure. */
export function useNow() {
  const [now] = useState(Date.now);
  return now;
}
