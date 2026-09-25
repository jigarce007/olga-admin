// Shapes mirror Olga.Core.Contracts where a contract exists; admin-only shapes are proposals.

export type ProfileStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface AdminMember {
  memberId: string;
  displayName: string;
  headline: string | null;
  roleCategory: string | null;
  profileStatus: ProfileStatus;
  visibility: string;
  completenessScore: number;
  emailHint: string | null;
  phoneHint: string | null;
  createdAt: string;
  updatedAt: string;
}

// Olga.Core.Contracts.EventResponse
export interface EventResponse {
  eventId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: string;
  liveModeEnabled: boolean;
}

export interface AdminEvent extends EventResponse {
  venue: string | null;
  registeredCount: number;
  liveCount: number;
}

export type ReportStatus = 'OPEN' | 'REVIEWING' | 'ACTIONED' | 'DISMISSED';

export interface ModerationReport {
  reportId: string;
  reporterId: string;
  subjectMemberId: string;
  subjectDisplayName: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
}

// Olga.Core.Contracts.PrivacyRequestResponse + member reference
export interface PrivacyRequest {
  privacyRequestId: string;
  memberId: string;
  requestType: string;
  status: string;
  createdAt: string;
  dueAt: string | null;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  upcomingEvents: number;
  openReports: number;
  pendingPrivacyRequests: number;
  connectionsLast7Days: number;
}
