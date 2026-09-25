import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getReports, setReportStatus } from '../api/admin';
import type { ModerationReport, ReportStatus } from '../api/types';
import { Pagination, usePagination } from '../components/Pagination';
import { useConfirm, useToast } from '../components/feedback';
import { Badge, PageHeader, QueryState, errorMessage, fmtDate } from '../components/ui';

export function Moderation() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const reports = useQuery({ queryKey: ['reports'], queryFn: getReports });
  const update = useMutation({
    mutationFn: ({ r, s }: { r: ModerationReport; s: ReportStatus }) => setReportStatus(r.reportId, s),
    onSuccess: (_, { r, s }) => {
      toast('success', `Report on ${r.subjectDisplayName} marked ${s.toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ['reports'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (e) => toast('error', `Update failed: ${errorMessage(e)}`),
  });
  const rows = (reports.data ?? []).filter((r) => filter === 'all' || r.status === 'OPEN' || r.status === 'REVIEWING');
  const { pageRows, ...pager } = usePagination(rows);

  const resolve = async (r: ModerationReport, s: 'ACTIONED' | 'DISMISSED') => {
    const ok = await confirm({
      title: s === 'ACTIONED' ? 'Action this report?' : 'Dismiss this report?',
      message: `Report on ${r.subjectDisplayName} (${r.reason.replace(/_/g, ' ').toLowerCase()}) will be closed.`,
      confirmLabel: s === 'ACTIONED' ? 'Action' : 'Dismiss',
    });
    if (ok) update.mutate({ r, s });
  };

  return (
    <>
      <PageHeader title="Moderation" subtitle="Member reports" />
      <section className="card">
        <div className="toolbar">
          <select aria-label="Filter reports" value={filter} onChange={(e) => setFilter(e.target.value as 'active' | 'all')}>
            <option value="active">Open and reviewing</option>
            <option value="all">All reports</option>
          </select>
        </div>
        <QueryState isLoading={reports.isLoading} error={reports.error} empty={reports.isSuccess && rows.length === 0} />
        {rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Reported member</th><th>Reason</th><th>Details</th><th>Reported</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.reportId}>
                    <td>{r.subjectDisplayName}<span className="sub">{r.subjectMemberId}</span></td>
                    <td><Badge value={r.reason} /></td>
                    <td className="wrap">{r.details ?? <span className="muted">—</span>}</td>
                    <td>{fmtDate(r.createdAt)}</td>
                    <td><Badge value={r.status} /></td>
                    <td className="row-actions">
                      {r.status === 'OPEN' && <button className="btn" disabled={update.isPending} onClick={() => update.mutate({ r, s: 'REVIEWING' })}>Review</button>}
                      {(r.status === 'OPEN' || r.status === 'REVIEWING') && <>
                        <button className="btn btn-primary" disabled={update.isPending} onClick={() => void resolve(r, 'ACTIONED')}>Action</button>
                        <button className="btn" disabled={update.isPending} onClick={() => void resolve(r, 'DISMISSED')}>Dismiss</button>
                      </>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination {...pager} />
      </section>
    </>
  );
}
