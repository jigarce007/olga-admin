import type { AdminEvent, AdminMember, ModerationReport, PrivacyRequest } from './types';

const day = 86_400_000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();

const names = ['Aisha Khan', 'Ben Carter', 'Chloe Martin', 'Dev Patel', 'Elena Rossi', 'Farah Ali', 'George Lee', 'Hana Suzuki', 'Ivan Petrov', 'Julia Costa', 'Kofi Mensah', 'Lina Haddad'];
const roles = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'Founder'];
const statuses: AdminMember['profileStatus'][] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'DRAFT', 'SUSPENDED'];

export const members: AdminMember[] = names.map((n, i) => ({
  memberId: `mbr_${(1000 + i).toString(36)}`,
  displayName: n,
  headline: `${roles[i % roles.length]} lead`,
  roleCategory: roles[i % roles.length],
  profileStatus: statuses[i % statuses.length],
  visibility: 'MEMBERS',
  completenessScore: Math.round((0.4 + ((i * 7) % 6) / 10) * 100) / 100,
  emailHint: `${n.split(' ')[0][0].toLowerCase()}***@example.com`,
  phoneHint: `***${(4100 + i * 37).toString().slice(-4)}`,
  createdAt: iso(-60 + i * 3),
  updatedAt: iso(-10 + i),
}));

export const events: AdminEvent[] = [
  { eventId: 'evt_london_tech', name: 'London Tech Week Mixer', startsAt: iso(3), endsAt: iso(3.2), status: 'PUBLISHED', liveModeEnabled: true, venue: 'Olympia London', registeredCount: 184, liveCount: 0 },
  { eventId: 'evt_founders', name: 'Founders Breakfast', startsAt: iso(10), endsAt: iso(10.1), status: 'PUBLISHED', liveModeEnabled: true, venue: 'The Ned', registeredCount: 42, liveCount: 0 },
  { eventId: 'evt_design', name: 'Design Leaders Meetup', startsAt: iso(21), endsAt: iso(21.15), status: 'DRAFT', liveModeEnabled: false, venue: null, registeredCount: 0, liveCount: 0 },
  { eventId: 'evt_ai_summit', name: 'AI Summit Networking', startsAt: iso(-5), endsAt: iso(-4.8), status: 'COMPLETED', liveModeEnabled: true, venue: 'ExCeL London', registeredCount: 312, liveCount: 0 },
];

export const reports: ModerationReport[] = [
  { reportId: 'rpt_001', reporterId: members[0].memberId, subjectMemberId: members[4].memberId, subjectDisplayName: members[4].displayName, reason: 'SPAM', details: 'Sending the same pitch to everyone at the event.', status: 'OPEN', createdAt: iso(-1) },
  { reportId: 'rpt_002', reporterId: members[2].memberId, subjectMemberId: members[9].memberId, subjectDisplayName: members[9].displayName, reason: 'HARASSMENT', details: 'Repeated messages after I declined.', status: 'REVIEWING', createdAt: iso(-2) },
  { reportId: 'rpt_003', reporterId: members[5].memberId, subjectMemberId: members[7].memberId, subjectDisplayName: members[7].displayName, reason: 'FAKE_PROFILE', details: null, status: 'DISMISSED', createdAt: iso(-8) },
];

export const privacyRequests: PrivacyRequest[] = [
  { privacyRequestId: 'prv_001', memberId: members[3].memberId, requestType: 'EXPORT', status: 'RECEIVED', createdAt: iso(-2), dueAt: iso(28) },
  { privacyRequestId: 'prv_002', memberId: members[8].memberId, requestType: 'DELETE', status: 'IN_PROGRESS', createdAt: iso(-12), dueAt: iso(18) },
  { privacyRequestId: 'prv_003', memberId: members[1].memberId, requestType: 'EXPORT', status: 'COMPLETED', createdAt: iso(-40), dueAt: iso(-10) },
];
