import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPrivacyRequests, setPrivacyRequestStatus } from '../api/admin';
import type { PrivacyRequest } from '../api/types';
import { Pagination, usePagination } from '../components/Pagination';
import { useConfirm, useToast } from '../components/feedback';
import { Badge, PageHeader, QueryState, errorMessage, fmtDate, useNow } from '../components/ui';

export function Privacy() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const now = useNow();
  const requests = useQuery({ queryKey: ['privacy'], queryFn: getPrivacyRequests });
  const update = useMutation({
    mutationFn: ({ p, s }: { p: PrivacyRequest; s: string }) => setPrivacyRequestStatus(p.privacyRequestId, s),
    onSuccess: (_, { p, s }) => {
      toast('success', `${p.privacyRequestId} marked ${s.replace(/_/g, ' ').toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ['privacy'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (e) => toast('error', `Update failed: ${errorMessage(e)}`),
  });
  // Soonest due first; requests without a due date last.
  const rows = [...(requests.data ?? [])].sort((a, b) =>
    (a.dueAt ? Date.parse(a.dueAt) : Infinity) - (b.dueAt ? Date.parse(b.dueAt) : Infinity));
  const { pageRows, ...pager } = usePagination(rows);

  const complete = async (p: PrivacyRequest) => {
    const ok = await confirm({
      title: 'Mark request complete?',
      message: `Confirm the ${p.requestType.toLowerCase()} for member ${p.memberId} has been fully fulfilled.`,
      confirmLabel: 'Mark complete',
    });
    if (ok) update.mutate({ p, s: 'COMPLETED' });
  };

  return (
    <>
      <PageHeader title="Privacy requests" subtitle="Data export and deletion requests (GDPR)" />
      <section className="card">
        <QueryState isLoading={requests.isLoading} error={requests.error} empty={requests.isSuccess && rows.length === 0} />
        {rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Request</th><th>Member</th><th>Type</th><th>Received</th><th>Due</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {pageRows.map((p) => {
                  const overdue = p.status !== 'COMPLETED' && p.dueAt !== null && Date.parse(p.dueAt) < now;
                  return (
                    <tr key={p.privacyRequestId}>
                      <td>{p.privacyRequestId}</td>
                      <td>{p.memberId}</td>
                      <td>{p.requestType}</td>
                      <td>{fmtDate(p.createdAt)}</td>
                      <td className={overdue ? 'error' : undefined}>{fmtDate(p.dueAt)}{overdue && <span className="sub">Overdue</span>}</td>
                      <td><Badge value={p.status} /></td>
                      <td className="row-actions">
                        {p.status === 'RECEIVED' && <button className="btn" disabled={update.isPending} onClick={() => update.mutate({ p, s: 'IN_PROGRESS' })}>Start</button>}
                        {p.status === 'IN_PROGRESS' && <button className="btn btn-primary" disabled={update.isPending} onClick={() => void complete(p)}>Mark complete</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination {...pager} />
      </section>
    </>
  );
}
