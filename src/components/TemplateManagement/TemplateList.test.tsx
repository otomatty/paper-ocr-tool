/**
 * TemplateList Component Tests
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react';
import type { UseTemplateReturn } from '../../hooks/useTemplate';
import type { Template } from '../../types/template';
import { TemplateList } from './TemplateList';

// Create mock return value helper
const createMockReturn = (overrides?: Partial<UseTemplateReturn>): UseTemplateReturn => ({
  templates: [],
  loading: false,
  error: null,
  createTemplate: mock(() => Promise.resolve({} as Template)),
  updateTemplate: mock(() => Promise.resolve()),
  deleteTemplate: mock(() => Promise.resolve()),
  getTemplate: mock(() => undefined),
  ...overrides,
});

// Mock useTemplate hook
const mockUseTemplate = mock(createMockReturn);
mock.module('../../hooks/useTemplate', () => ({
  useTemplate: mockUseTemplate,
}));

describe('TemplateList Component', () => {
  beforeEach(() => {
    mockUseTemplate.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const createTemplate = (id: string, name: string): Template => ({
    id,
    name,
    baseImageData: 'data:image/png;base64,test',
    regions: [],
    createdAt: new Date('2024-11-02'),
    updatedAt: new Date('2024-11-02'),
  });

  it('TC-001: should display template cards when templates exist', () => {
    const templates = [createTemplate('1', 'テンプレート1'), createTemplate('2', 'テンプレート2')];

    mockUseTemplate.mockReturnValue(createMockReturn({ templates }));
    render(<TemplateList />);

    expect(screen.getByText('テンプレート1')).toBeDefined();
    expect(screen.getByText('テンプレート2')).toBeDefined();
  });

  it('TC-002: should display empty state when no templates', () => {
    mockUseTemplate.mockReturnValue(createMockReturn());
    render(<TemplateList />);

    expect(screen.getByText('テンプレートがありません')).toBeDefined();
    expect(screen.getByRole('button', { name: '新規作成' })).toBeDefined();
  });

  it('TC-003: should display loading state', () => {
    mockUseTemplate.mockReturnValue(createMockReturn({ loading: true }));
    render(<TemplateList />);

    expect(screen.getByText('読み込み中...')).toBeDefined();
  });

  it('TC-004: should display error state', () => {
    mockUseTemplate.mockReturnValue(
      createMockReturn({
        error: 'エラーが発生しました',
      })
    );
    render(<TemplateList />);

    expect(screen.getByText('エラーが発生しました')).toBeDefined();
    expect(screen.getByRole('button', { name: '再試行' })).toBeDefined();
  });

  it('TC-005: should not show select button when showSelection is false', () => {
    const templates = [createTemplate('1', 'テスト')];
    mockUseTemplate.mockReturnValue(createMockReturn({ templates }));
    render(<TemplateList showSelection={false} />);

    expect(screen.queryByRole('button', { name: 'テストを選択' })).toBeNull();
  });

  it('TC-006: should show select button when showSelection is true', () => {
    const templates = [createTemplate('1', 'テスト')];
    mockUseTemplate.mockReturnValue(createMockReturn({ templates }));
    render(<TemplateList showSelection={true} />);

    expect(screen.getByRole('button', { name: 'テストを選択' })).toBeDefined();
  });

  it('TC-007: should display placeholder when no image', () => {
    const template = {
      ...createTemplate('1', 'テスト'),
      baseImageData: undefined,
    };
    mockUseTemplate.mockReturnValue(createMockReturn({ templates: [template] }));
    render(<TemplateList />);

    expect(screen.getByText('画像なし')).toBeDefined();
  });

  it('TC-008: should display date correctly', () => {
    const templates = [createTemplate('1', 'テスト')];
    mockUseTemplate.mockReturnValue(createMockReturn({ templates }));
    render(<TemplateList />);

    expect(screen.getByText(/作成日: 2024\/11\/02/)).toBeDefined();
  });

  it('TC-009: should have delete button for each template', () => {
    const templates = [createTemplate('1', 'テスト1'), createTemplate('2', 'テスト2')];
    mockUseTemplate.mockReturnValue(createMockReturn({ templates }));
    render(<TemplateList />);

    expect(screen.getByRole('button', { name: 'テスト1を削除' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'テスト2を削除' })).toBeDefined();
  });

  it('TC-010: should apply responsive grid classes', () => {
    const templates = [createTemplate('1', 'テスト')];
    mockUseTemplate.mockReturnValue(createMockReturn({ templates }));
    const { container } = render(<TemplateList />);

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
  });
});
