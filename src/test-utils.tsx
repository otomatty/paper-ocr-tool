/**
 * Test Utilities for React Router and Component Testing
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/DataInput/OCRProcessor.test.tsx
 *   ├─ src/pages/DataInputPage.test.tsx
 *   └─ (other component tests using Router)
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ @testing-library/react
 *   └─ react-router-dom
 *
 * Related Documentation:
 *   └─ Plan: docs/03_plans/phase4-revised-implementation-plan.md
 */

import { type RenderOptions, render as rtlRender } from '@testing-library/react';
import type React from 'react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that wraps components with BrowserRouter
 * Resolves the useLocation() context issue in tests
 *
 * @param ui - The component to render
 * @param options - Additional render options
 * @returns Render result with Router context
 */
export function renderWithRouter(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return BrowserRouter ? <BrowserRouter>{children}</BrowserRouter> : children;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

/**
 * Re-export common testing utilities
 */
export * from '@testing-library/react';
