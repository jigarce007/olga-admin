// Admin data access. Only GET /v1/events exists in Olga.Core today; every other
// /v1/admin/* route below is a proposed contract and is served from mocks until built.
// Mocks are imported lazily so they never load when useMocks is false.
import { mocksEnabled, request } from './client';
import type { AdminEvent, AdminMember, DashboardStats, EventResponse, ModerationReport, PrivacyRequest, ProfileStatus, ReportStatus } from './types';

const delay = <T,>(value: T) => new Promise<T>((r) => setTimeout(() => r(structuredClone(value)), 150));

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!mocksEnabled()) return request('GET', '/v1/admin/stats');
  const mock = await import('./mock');
  const now = Date.now();
  return delay({
    totalMembers: mock.members.length,
    activeMembers: mock.members.filter((m) => m.profileStatus === 'ACTIVE').length,
    upcomingEvents: mock.events.filter((e) => Date.parse(e.startsAt) > now).length,
    openReports: mock.reports.filter((r) => r.status === 'OPEN' || r.status === 'REVIEWING').length,
    pendingPrivacyRequests: mock.privacyRequests.filter((p) => p.status !== 'COMPLETED').length,
    connectionsLast7Days: 57,
  });
}

export async function getMembers(): Promise<AdminMember[]> {
  if (!mocksEnabled()) return request('GET', '/v1/admin/members');
  const mock = await import('./mock');
  return delay(mock.members);
}

export async function setMemberStatus(memberId: string, profileStatus: ProfileStatus): Promise<void> {
  if (!mocksEnabled()) return request('PATCH', `/v1/admin/members/${encodeURIComponent(memberId)}`, { profileStatus });
  const mock = await import('./mock');
  const m = mock.members.find((x) => x.memberId === memberId);
  if (m) { m.profileStatus = profileStatus; m.updatedAt = new Date().toISOString(); }
  return delay(undefined);
}

export async function getEvents(): Promise<AdminEvent[]> {
  if (!mocksEnabled()) {
    // Real endpoint; admin-only fields default until an admin events endpoint exists.
    const events = await request<EventResponse[]>('GET', '/v1/events');
    return events.map((e) => ({ ...e, venue: null, registeredCount: 0, liveCount: 0 }));
  }
  const mock = await import('./mock');
  return delay(mock.events);
}

export async function getReports(): Promise<ModerationReport[]> {
  if (!mocksEnabled()) return request('GET', '/v1/admin/reports');
  const mock = await import('./mock');
  return delay(mock.reports);
}

export async function setReportStatus(reportId: string, status: ReportStatus): Promise<void> {
  if (!mocksEnabled()) return request('PATCH', `/v1/admin/reports/${encodeURIComponent(reportId)}`, { status });
  const mock = await import('./mock');
  const r = mock.reports.find((x) => x.reportId === reportId);
  if (r) r.status = status;
  return delay(undefined);
}

export async function getPrivacyRequests(): Promise<PrivacyRequest[]> {
  if (!mocksEnabled()) return request('GET', '/v1/admin/privacy-requests');
  const mock = await import('./mock');
  return delay(mock.privacyRequests);
}

export async function setPrivacyRequestStatus(id: string, status: string): Promise<void> {
  if (!mocksEnabled()) return request('PATCH', `/v1/admin/privacy-requests/${encodeURIComponent(id)}`, { status });
  const mock = await import('./mock');
  const p = mock.privacyRequests.find((x) => x.privacyRequestId === id);
  if (p) p.status = status;
  return delay(undefined);
}
