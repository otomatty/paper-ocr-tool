/**
 * Application Entry Point
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/index.html
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ react-dom/client
 *   ├─ ./App.tsx
 *   └─ ./styles/globals.css
 *
 * Related Documentation:
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
