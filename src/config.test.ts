import { describe, expect, it } from 'vitest';
import { validateConfig, type AppConfig } from './config';

const base: AppConfig = {
  environment: 'production',
  apiBaseUrl: 'https://api.olga.example',
  useMocks: false,
  requestTimeoutMs: 15000,
  auth: { enabled: true, authority: 'https://login.microsoftonline.com/tid', clientId: 'cid', apiScopes: ['api://x/access_as_user'], requiredRole: 'Olga.Admin' },
};

describe('validateConfig', () => {
  it('accepts a complete production config', () => {
    expect(validateConfig(base)).toEqual([]);
  });

  it('rejects mocks, disabled auth and http API outside local', () => {
    const errors = validateConfig({ ...base, useMocks: true, apiBaseUrl: 'http://api', auth: { ...base.auth, enabled: false } });
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringContaining('useMocks'), expect.stringContaining('auth.enabled'), expect.stringContaining('https'),
    ]));
  });

  it('allows the local defaults', () => {
    expect(validateConfig({ ...base, environment: 'local', apiBaseUrl: '', useMocks: true, auth: { ...base.auth, enabled: false } })).toEqual([]);
  });

  it('requires authority and clientId when auth is enabled', () => {
    const errors = validateConfig({ ...base, auth: { ...base.auth, authority: '', clientId: '' } });
    expect(errors).toHaveLength(2);
  });
});
