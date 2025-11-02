/**
 * Main Application Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/index.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react-router-dom
 *   ├─ src/pages/HomePage.tsx
 *   ├─ src/pages/TemplateManagementPage.tsx
 *   └─ src/pages/DataInputPage.tsx
 *
 * Related Documentation:
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DataInputPage } from './pages/DataInputPage';
import { HomePage } from './pages/HomePage';
import { TemplateManagementPage } from './pages/TemplateManagementPage';
import './styles/globals.css';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/template" element={<TemplateManagementPage />} />
        <Route path="/data-input" element={<DataInputPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
