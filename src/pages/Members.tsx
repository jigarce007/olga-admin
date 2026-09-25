import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMembers, setMemberStatus } from '../api/admin';
import type { ProfileStatus } from '../api/types';
import { Badge, PageHeader, QueryState, fmtDate } from '../components/ui';

export function Members() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const members = useQuery({ queryKey: ['members'], queryFn: getMembers });
  const update = useMutation({
    mutationFn: ({ id, s }: { id: string; s: ProfileStatus }) => setMemberStatus(id, s),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); qc.invalidateQueries({ queryKey: ['stats'] }); },
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (members.data ?? []).filter((m) =>
      (!status || m.profileStatus === status) &&
      (!q || m.displayName.toLowerCase().includes(q) || m.memberId.includes(q) || (m.headline ?? '').toLowerCase().includes(q)));
  }, [members.data, search, status]);

  return (
    <>
      <PageHeader title="Members" subtitle={members.data ? `${members.data.length} members` : undefined} />
      <section className="card">
        <div className="toolbar">
          <input placeholder="Search name, ID or headline" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {['ACTIVE', 'DRAFT', 'SUSPENDED', 'DELETED'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <QueryState isLoading={members.isLoading} error={members.error} empty={members.isSuccess && rows.length === 0} />
        {rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Role</th><th>Contact</th><th>Completeness</th><th>Status</th><th>Joined</th><th /></tr></thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.memberId}>
                    <td>{m.displayName}<span className="sub">{m.memberId}</span></td>
                    <td>{m.roleCategory ?? '—'}<span className="sub">{m.headline}</span></td>
                    <td>{m.emailHint ?? '—'}<span className="sub">{m.phoneHint}</span></td>
                    <td>{Math.round(m.completenessScore * 100)}%</td>
                    <td><Badge value={m.profileStatus} /></td>
                    <td>{fmtDate(m.createdAt)}</td>
                    <td className="row-actions">
                      {m.profileStatus === 'SUSPENDED' ? (
                        <button className="btn" disabled={update.isPending} onClick={() => update.mutate({ id: m.memberId, s: 'ACTIVE' })}>Reinstate</button>
                      ) : m.profileStatus !== 'DELETED' && (
                        <button className="btn btn-danger" disabled={update.isPending}
                          onClick={() => confirm(`Suspend ${m.displayName}?`) && update.mutate({ id: m.memberId, s: 'SUSPENDED' })}>Suspend</button>
                      )}
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
