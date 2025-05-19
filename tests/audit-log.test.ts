import { vi, describe, it, expect } from 'vitest';
import { recordAuditLog, queryAuditLogs } from '../src/lib/audit-log';

vi.mock('../src/lib/supabase', () => {
  const insert = vi.fn(() => Promise.resolve({ error: null }));
  const select = vi.fn(() => ({
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null })),
  }));
  const auth = {
    getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'u1', user_metadata: { role: 'admin' } } } })),
  };
  return { supabase: { from: vi.fn(() => ({ insert, select })), auth } };
});

describe('audit log', () => {
  it('records an audit log entry', async () => {
    const ok = await recordAuditLog({
      entity_type: 'test',
      entity_id: '1',
      action: 'create',
      source: 'test',
    });
    expect(ok).toBe(true);
  });

  it('queries audit logs', async () => {
    const res = await queryAuditLogs({ entityType: 'test' });
    expect(Array.isArray(res)).toBe(true);
  });
});
