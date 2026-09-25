import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../api/admin';
import { Badge, PageHeader, QueryState, fmtDate } from '../components/ui';

export function Events() {
  const events = useQuery({ queryKey: ['events'], queryFn: getEvents });
  const rows = [...(events.data ?? [])].sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));

  return (
    <>
      <PageHeader title="Events" subtitle="Networking events and live-mode status" />
      <section className="card">
        <QueryState isLoading={events.isLoading} error={events.error} empty={events.isSuccess && rows.length === 0} />
        {rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Event</th><th>Starts</th><th>Ends</th><th>Registered</th><th>Live mode</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.eventId}>
                    <td>{e.name}<span className="sub">{e.venue ?? e.eventId}</span></td>
                    <td>{fmtDate(e.startsAt)}</td>
                    <td>{fmtDate(e.endsAt)}</td>
                    <td>{e.registeredCount}</td>
                    <td>{e.liveModeEnabled ? 'Enabled' : 'Off'}</td>
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
