import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMembers, setMemberStatus } from '../api/admin';
import type { AdminMember, ProfileStatus } from '../api/types';
import { Pagination, usePagination } from '../components/Pagination';
import { useConfirm, useToast } from '../components/feedback';
import { Badge, PageHeader, QueryState, errorMessage, fmtDate } from '../components/ui';

export function Members() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const members = useQuery({ queryKey: ['members'], queryFn: getMembers });
  const update = useMutation({
    mutationFn: ({ m, s }: { m: AdminMember; s: ProfileStatus }) => setMemberStatus(m.memberId, s),
    onSuccess: (_, { m, s }) => {
      toast('success', `${m.displayName} ${s === 'SUSPENDED' ? 'suspended' : 'reinstated'}`);
      qc.invalidateQueries({ queryKey: ['members'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (e) => toast('error', `Update failed: ${errorMessage(e)}`),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (members.data ?? []).filter((m) =>
      (!status || m.profileStatus === status) &&
      (!q || m.displayName.toLowerCase().includes(q) || m.memberId.toLowerCase().includes(q) || (m.headline ?? '').toLowerCase().includes(q)));
  }, [members.data, search, status]);
  const { pageRows, ...pager } = usePagination(rows);

  const suspend = async (m: AdminMember) => {
    const ok = await confirm({
      title: `Suspend ${m.displayName}?`,
      message: 'They will be hidden from other members and unable to connect until reinstated.',
      confirmLabel: 'Suspend', danger: true,
    });
    if (ok) update.mutate({ m, s: 'SUSPENDED' });
  };

  return (
    <>
      <PageHeader title="Members" subtitle={members.data ? `${members.data.length} members` : undefined} />
      <section className="card">
        <div className="toolbar">
          <input type="search" aria-label="Search members" placeholder="Search name, ID or headline" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {['ACTIVE', 'DRAFT', 'SUSPENDED', 'DELETED'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <QueryState isLoading={members.isLoading} error={members.error} empty={members.isSuccess && rows.length === 0} />
        {rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Role</th><th>Contact</th><th>Completeness</th><th>Status</th><th>Joined</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {pageRows.map((m) => (
                  <tr key={m.memberId}>
                    <td>{m.displayName}<span className="sub">{m.memberId}</span></td>
                    <td>{m.roleCategory ?? '—'}<span className="sub">{m.headline}</span></td>
                    <td>{m.emailHint ?? '—'}<span className="sub">{m.phoneHint}</span></td>
                    <td>{Math.round(m.completenessScore * 100)}%</td>
                    <td><Badge value={m.profileStatus} /></td>
                    <td>{fmtDate(m.createdAt)}</td>
                    <td className="row-actions">
                      {m.profileStatus === 'SUSPENDED' ? (
                        <button className="btn" disabled={update.isPending} onClick={() => update.mutate({ m, s: 'ACTIVE' })}>Reinstate</button>
                      ) : m.profileStatus !== 'DELETED' && (
                        <button className="btn btn-danger" disabled={update.isPending} onClick={() => void suspend(m)}>Suspend</button>
                      )}
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
