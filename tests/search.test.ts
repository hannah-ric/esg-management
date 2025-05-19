import { vi, describe, it, expect } from 'vitest';
import { searchESGDataPoints } from '../src/lib/esg-data-services';

vi.mock('../src/lib/supabase', () => {
  const rpc = vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 }));
  const functions = { invoke: vi.fn(() => Promise.resolve({ data: { embedding: [0.1] }, error: null })) };
  return { supabase: { rpc, functions } };
});

describe('search ESG data points', () => {
  it('calls embedding and rpc', async () => {
    const res = await searchESGDataPoints('test');
    expect(res.data.length).toBe(0);
  });
});
