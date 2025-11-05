/**
 * Layout Component - Minimal Design
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
 *   ├─ lucide-react
 *   └─ src/components/common/Logo/Logo.tsx
 *
 * Related Documentation:
 *   ├─ Spec: ./Layout.spec.md
 *   ├─ Tests: ./Layout.test.tsx
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_02_common-components-development.md
 *   └─ Prompt: docs/00_prompts/20241102_02_phase2-common-components.md
 */

import { FileText, Home, ScanText } from "lucide-react";
import type React from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "../Logo/Logo";

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout Component - Minimal Design
 *
 * Provides a clean, minimal layout structure inspired by Apple's design language.
 * Features: subtle shadows, refined typography, and smooth transitions.
 *
 * @param children - The main content to display
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "ホーム", icon: Home },
    { path: "/template", label: "テンプレート管理", icon: FileText },
    { path: "/data-input", label: "データ入力", icon: ScanText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            <Link to="/" className="inline-block">
              <Logo size={140} />
            </Link>
            <nav aria-label="メインナビゲーション">
              <ul className="flex flex-wrap gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`
                          inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-neutral-900 text-white shadow-sm"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                          }
                        `}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
      <footer className="bg-white border-t border-neutral-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-neutral-500">
            © 2024 紙アンケートOCR入力効率化アプリ
          </p>
        </div>
      </footer>
    </div>
  );
};
