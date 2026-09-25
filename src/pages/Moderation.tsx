import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getReports, setReportStatus } from '../api/admin';
import type { ReportStatus } from '../api/types';
import { Badge, PageHeader, QueryState, fmtDate } from '../components/ui';

export function Moderation() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const reports = useQuery({ queryKey: ['reports'], queryFn: getReports });
  const update = useMutation({
    mutationFn: ({ id, s }: { id: string; s: ReportStatus }) => setReportStatus(id, s),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); qc.invalidateQueries({ queryKey: ['stats'] }); },
  });
  const rows = (reports.data ?? []).filter((r) => filter === 'all' || r.status === 'OPEN' || r.status === 'REVIEWING');

  return (
    <>
      <PageHeader title="Moderation" subtitle="Member reports" />
      <section className="card">
        <div className="toolbar">
          <select value={filter} onChange={(e) => setFilter(e.target.value as 'active' | 'all')}>
            <option value="active">Open and reviewing</option>
            <option value="all">All reports</option>
          </select>
        </div>
        <QueryState isLoading={reports.isLoading} error={reports.error} empty={reports.isSuccess && rows.length === 0} />
        {rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Reported member</th><th>Reason</th><th>Details</th><th>Reported</th><th>Status</th><th /></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.reportId}>
                    <td>{r.subjectDisplayName}<span className="sub">{r.subjectMemberId}</span></td>
                    <td><Badge value={r.reason} /></td>
                    <td className="wrap">{r.details ?? <span className="muted">—</span>}</td>
                    <td>{fmtDate(r.createdAt)}</td>
                    <td><Badge value={r.status} /></td>
                    <td className="row-actions">
                      {r.status === 'OPEN' && <button className="btn" disabled={update.isPending} onClick={() => update.mutate({ id: r.reportId, s: 'REVIEWING' })}>Review</button>}
                      {(r.status === 'OPEN' || r.status === 'REVIEWING') && <>
                        <button className="btn btn-primary" disabled={update.isPending} onClick={() => update.mutate({ id: r.reportId, s: 'ACTIONED' })}>Action</button>
                        <button className="btn" disabled={update.isPending} onClick={() => update.mutate({ id: r.reportId, s: 'DISMISSED' })}>Dismiss</button>
                      </>}
                    </td>
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
