import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getDashboardStats, getEvents } from '../api/admin';
import { Badge, PageHeader, QueryState, StatCard, fmtDate, useNow } from '../components/ui';

export function Dashboard() {
  const stats = useQuery({ queryKey: ['stats'], queryFn: getDashboardStats });
  const events = useQuery({ queryKey: ['events'], queryFn: getEvents });
  const now = useNow();
  const upcoming = (events.data ?? []).filter((e) => Date.parse(e.startsAt) > now).slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Platform overview" />
      <QueryState isLoading={stats.isLoading} error={stats.error} />
      {stats.data && (
        <div className="grid">
          <StatCard label="Total members" value={stats.data.totalMembers} />
          <StatCard label="Active members" value={stats.data.activeMembers} />
          <StatCard label="Upcoming events" value={stats.data.upcomingEvents} />
          <StatCard label="Connections (7 days)" value={stats.data.connectionsLast7Days} />
          <StatCard label="Open reports" value={stats.data.openReports} />
          <StatCard label="Pending privacy requests" value={stats.data.pendingPrivacyRequests} />
        </div>
      )}
      <section className="card">
        <h2>Upcoming events <Link to="/events" className="muted" style={{ float: 'right', fontWeight: 400, fontSize: '.85rem' }}>View all</Link></h2>
        <QueryState isLoading={events.isLoading} error={events.error} empty={events.isSuccess && upcoming.length === 0} />
        {upcoming.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Event</th><th>Starts</th><th>Registered</th><th>Status</th></tr></thead>
              <tbody>
                {upcoming.map((e) => (
                  <tr key={e.eventId}>
                    <td>{e.name}<span className="sub">{e.venue ?? 'Venue TBC'}</span></td>
                    <td>{fmtDate(e.startsAt)}</td>
                    <td>{e.registeredCount}</td>
                    <td><Badge value={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
