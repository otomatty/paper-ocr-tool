/**
 * Layout Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/pages/HomePage.tsx
 *   ├─ src/pages/TemplateManagementPage.tsx
 *   └─ src/pages/DataInputPage.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ react-router-dom
 *   └─ ./Layout.module.css
 *
 * Related Documentation:
 *   ├─ Spec: ./Layout.spec.md
 *   ├─ Tests: ./Layout.test.tsx
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_02_common-components-development.md
 *   └─ Prompt: docs/00_prompts/20241102_02_phase2-common-components.md
 */

import type React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Layout Component
 *
 * Provides a consistent layout structure for all pages with header, navigation, and main content area.
 *
 * @param children - The main content to display
 * @param title - Optional custom title (defaults to app name)
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  title = '紙アンケートOCR入力効率化アプリ',
}) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'ホーム' },
    { path: '/template', label: 'テンプレート管理' },
    { path: '/data-input', label: 'データ入力' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">{title}</h1>
            <nav aria-label="メインナビゲーション">
              <ul className="flex flex-wrap gap-2 sm:gap-4">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          location.pathname === item.path
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                      aria-current={location.pathname === item.path ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};
