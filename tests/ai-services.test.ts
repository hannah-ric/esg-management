import { vi, describe, it, expect } from 'vitest';
import { getFrameworkRecommendations } from '@/lib/ai-services';

vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      functions: {
        invoke: vi.fn(() => Promise.resolve({ data: { content: 'ok' }, error: null }))
      }
    }
  };
});

describe('getFrameworkRecommendations', () => {
  it('calls supabase function and returns content', async () => {
    const res = await getFrameworkRecommendations({}, []);
    expect(res.success).toBe(true);
    expect(res.content).toBe('ok');
  });
});
