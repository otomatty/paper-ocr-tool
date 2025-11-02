/**
 * Layout Component Tests
 *
 * Related Documentation:
 *   ├─ Spec: ./Layout.spec.md
 *   ├─ Implementation: ./Layout.tsx
 */

import { afterEach, describe, expect, it } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Helper to render with Router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Layout Component', () => {
  describe('TC-LAYOUT-001: 基本的なレンダリング', () => {
    it('should render header, nav, and main content', () => {
      renderWithRouter(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Header exists
      const header = screen.getByRole('banner');
      expect(header).toBeDefined();

      // Main content exists
      const main = screen.getByRole('main');
      expect(main).toBeDefined();
      expect(screen.getByText('Test Content')).toBeDefined();

      // Navigation exists
      const nav = screen.getByRole('navigation');
      expect(nav).toBeDefined();
    });
  });

  describe('TC-LAYOUT-002: ナビゲーションリンク', () => {
    it('should render all navigation links with correct hrefs', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const homeLink = screen.getByRole('link', { name: 'ホーム' });
      expect(homeLink).toBeDefined();
      expect(homeLink.getAttribute('href')).toBe('/');

      const templateLink = screen.getByRole('link', {
        name: 'テンプレート管理',
      });
      expect(templateLink).toBeDefined();
      expect(templateLink.getAttribute('href')).toBe('/template');

      const dataInputLink = screen.getByRole('link', { name: 'データ入力' });
      expect(dataInputLink).toBeDefined();
      expect(dataInputLink.getAttribute('href')).toBe('/data-input');
    });
  });

  describe('TC-LAYOUT-003: タイトルのカスタマイズ', () => {
    it('should render custom title when provided', () => {
      renderWithRouter(
        <Layout title="カスタムタイトル">
          <div>Content</div>
        </Layout>
      );

      const title = screen.getByRole('heading', { level: 1 });
      expect(title.textContent).toBe('カスタムタイトル');
    });
  });

  describe('TC-LAYOUT-004: デフォルトタイトル', () => {
    it('should render default title when not provided', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const title = screen.getByRole('heading', { level: 1 });
      expect(title.textContent).toBe('紙アンケートOCR入力効率化アプリ');
    });
  });

  describe('TC-LAYOUT-005: Semantic HTML', () => {
    it('should use semantic HTML elements', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      // Check for semantic elements
      expect(screen.getByRole('banner')).toBeDefined(); // header
      expect(screen.getByRole('navigation')).toBeDefined(); // nav
      expect(screen.getByRole('main')).toBeDefined(); // main
    });
  });

  describe('Edge Cases', () => {
    it('should render even with empty children', () => {
      renderWithRouter(<Layout>{null}</Layout>);

      const header = screen.getByRole('banner');
      expect(header).toBeDefined();

      const main = screen.getByRole('main');
      expect(main).toBeDefined();
    });

    it('should render with undefined children', () => {
      renderWithRouter(<Layout>{undefined}</Layout>);

      const header = screen.getByRole('banner');
      expect(header).toBeDefined();
    });
  });
});
