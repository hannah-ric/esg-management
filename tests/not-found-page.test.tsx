import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import NotFoundPage from '../src/pages/NotFoundPage';

describe('NotFoundPage', () => {
  it('renders not found message', () => {
    const html = renderToString(<NotFoundPage />);
    expect(html).toContain('Page Not Found');
  });
});
