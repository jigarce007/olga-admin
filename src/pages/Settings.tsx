import { useQuery } from '@tanstack/react-query';
import { useMocks } from '../api/client';
import { PageHeader } from '../components/ui';

const apiUrl = import.meta.env.VITE_CORE_API_URL || '(same origin)';

export function Settings() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await fetch(`${import.meta.env.VITE_CORE_API_URL ?? ''}/ready`)).ok,
    retry: false,
  });

  return (
    <>
      <PageHeader title="Settings" subtitle="Environment and connectivity" />
      <section className="card">
        <div className="field"><label>Core API URL</label><code>{apiUrl}</code></div>
        <div className="field"><label>Data source</label><span>{useMocks ? 'Mock data (VITE_USE_MOCKS=true)' : 'Live API'}</span></div>
        <div className="field">
          <label>Core API readiness</label>
          <span className={health.data ? undefined : 'error'}>
            {health.isLoading ? 'Checking…' : health.data ? 'Ready' : 'Unreachable'}
          </span>
        </div>
      </section>
    </>
  );
}
