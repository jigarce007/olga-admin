import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPrivacyRequests, setPrivacyRequestStatus } from '../api/admin';
import { Badge, PageHeader, QueryState, fmtDate } from '../components/ui';

export function Privacy() {
  const qc = useQueryClient();
  const requests = useQuery({ queryKey: ['privacy'], queryFn: getPrivacyRequests });
  const update = useMutation({
    mutationFn: ({ id, s }: { id: string; s: string }) => setPrivacyRequestStatus(id, s),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['privacy'] }); qc.invalidateQueries({ queryKey: ['stats'] }); },
  });
  const rows = [...(requests.data ?? [])].sort((a, b) => Date.parse(a.dueAt ?? '') - Date.parse(b.dueAt ?? ''));

  return (
    <>
      <PageHeader title="Privacy requests" subtitle="Data export and deletion requests (GDPR)" />
      <section className="card">
        <QueryState isLoading={requests.isLoading} error={requests.error} empty={requests.isSuccess && rows.length === 0} />
        {rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Request</th><th>Member</th><th>Type</th><th>Received</th><th>Due</th><th>Status</th><th /></tr></thead>
              <tbody>
                {rows.map((p) => {
                  const overdue = p.status !== 'COMPLETED' && p.dueAt && Date.parse(p.dueAt) < Date.now();
                  return (
                    <tr key={p.privacyRequestId}>
                      <td>{p.privacyRequestId}</td>
                      <td>{p.memberId}</td>
                      <td>{p.requestType}</td>
                      <td>{fmtDate(p.createdAt)}</td>
                      <td className={overdue ? 'error' : undefined}>{fmtDate(p.dueAt)}</td>
                      <td><Badge value={p.status} /></td>
                      <td className="row-actions">
                        {p.status === 'RECEIVED' && <button className="btn" disabled={update.isPending} onClick={() => update.mutate({ id: p.privacyRequestId, s: 'IN_PROGRESS' })}>Start</button>}
                        {p.status === 'IN_PROGRESS' && <button className="btn btn-primary" disabled={update.isPending} onClick={() => update.mutate({ id: p.privacyRequestId, s: 'COMPLETED' })}>Mark complete</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
