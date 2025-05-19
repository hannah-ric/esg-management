import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ESGMetricsPage from '../src/pages/ESGMetricsPage';

describe('ESGMetricsPage', () => {
  it('renders dashboard heading', () => {
    const html = renderToString(<ESGMetricsPage />);
    expect(html).toContain('ESG Metrics Dashboard');
  });
});
