import { vi, describe, it, expect } from 'vitest';
import { getESGDataPoints } from '@/lib/esg-data-services';

vi.mock('@/lib/supabase', () => {
  const from = vi.fn(() => ({
    select: vi.fn((...args: any[]) => {
      if (args[1]?.count) {
        return { eq: vi.fn(() => Promise.resolve({ count: 1, error: null })) };
      }
      return {
        eq: vi.fn(() => ({
          range: vi.fn(() => Promise.resolve({ data: [{ id: '1', resource_id: 'r1', metric_id: 'm1', value: 'v' }], error: null }))
        }))
      };
    })
  }));
  return { supabase: { from } };
});

describe('getESGDataPoints', () => {
  it('returns data from supabase', async () => {
    const result = await getESGDataPoints('r1', { page: 1, pageSize: 10 });
    expect(result.data.length).toBe(1);
    expect(result.count).toBe(1);
  });
});
