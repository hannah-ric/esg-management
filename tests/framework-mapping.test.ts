import { describe, it, expect } from 'vitest';
import { compareFrameworks } from '../src/lib/framework-mapping';

describe('framework mapping', () => {
  it('compares frameworks', () => {
    const a = { id: 'A', version: '1', name: 'A', metrics: [{ id: 'm1', description: '', disclosures: [] }] };
    const b = { id: 'B', version: '1', name: 'B', metrics: [{ id: 'm1', description: '', disclosures: [] }, { id: 'm2', description: '', disclosures: [] }] };
    const res = compareFrameworks(a, b);
    expect(res.overlapCount).toBe(1);
    expect(res.totalA).toBe(1);
    expect(res.totalB).toBe(2);
  });
});
