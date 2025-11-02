/**
 * TemplateEditor Component Tests
 *
 * Tests for the TemplateEditor component using bun:test
 */

import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Region, Template } from '../../types/template';
import { TemplateEditor } from './TemplateEditor';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock hooks
const mockTemplates: Template[] = [];
const mockCreateTemplate = mock(
  async (data: { name: string; baseImageData: string; regions: Region[] }): Promise<Template> => {
    const template: Template = {
      id: `template-${Date.now()}`,
      name: data.name,
      baseImageData: data.baseImageData,
      regions: data.regions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTemplates.push(template);
    return template;
  }
);

const mockUpdateTemplate = mock(
  async (
    id: string,
    data: { name: string; baseImageData: string; regions: Region[] }
  ): Promise<void> => {
    const template = mockTemplates.find((t) => t.id === id);
    if (template) {
      template.name = data.name;
      template.baseImageData = data.baseImageData;
      template.regions = data.regions;
      template.updatedAt = new Date();
    }
  }
);

// Mock useTemplate hook
mock.module('../../hooks/useTemplate', () => ({
  useTemplate: () => ({
    templates: mockTemplates,
    createTemplate: mockCreateTemplate,
    updateTemplate: mockUpdateTemplate,
    deleteTemplate: mock(),
  }),
}));

// Mock Camera component
mock.module('../Camera/Camera', () => ({
  Camera: ({ onCapture }: { onCapture: (data: string) => void }) => (
    <div data-testid="mock-camera">
      <button type="button" onClick={() => onCapture('data:image/png;base64,mockImageData')}>
        Mock Capture
      </button>
    </div>
  ),
}));

// Mock RegionSelector component
mock.module('./RegionSelector', () => ({
  RegionSelector: ({
    onRegionsChange,
  }: {
    imageData: string;
    regions: Region[];
    onRegionsChange: (regions: Region[]) => void;
  }) => (
    <div data-testid="mock-region-selector">
      <button
        type="button"
        onClick={() =>
          onRegionsChange([
            {
              id: 'region-1',
              name: 'テスト領域',
              coordinates: { x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
              order: 1,
            },
          ])
        }
      >
        Mock Add Region
      </button>
    </div>
  ),
}));

describe('TemplateEditor', () => {
  beforeEach(() => {
    mockTemplates.length = 0;
    mockCreateTemplate.mockClear();
    mockUpdateTemplate.mockClear();
  });

  // TC-001: 初期表示テスト（新規作成モード）
  test('TC-001: should initialize in create mode', () => {
    render(<TemplateEditor />);

    // Step 1が表示される
    expect(screen.getByText('ベース画像撮影')).toBeDefined();
    expect(screen.getByText('空のアンケート用紙を撮影してください')).toBeDefined();

    // テンプレート名入力フィールドが空
    const nameInput = screen.getByPlaceholderText(/テンプレート名を入力/);
    expect(nameInput).toBeDefined();
    expect((nameInput as HTMLInputElement).value).toBe('');

    // Cameraコンポーネントが表示される
    expect(screen.getByTestId('mock-camera')).toBeDefined();

    // 「次へ」ボタンが無効
    const nextButton = screen.getByText('次へ') as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);
  });

  // TC-002: 画像撮影フローテスト
  test('TC-002: should enable next button after image capture', async () => {
    render(<TemplateEditor />);

    // 初期状態で「次へ」ボタンは無効
    const nextButton = screen.getByText('次へ') as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);

    // 画像を撮影
    const captureButton = screen.getByText('Mock Capture');
    fireEvent.click(captureButton);

    // 「次へ」ボタンが有効化
    await waitFor(() => {
      expect(nextButton.disabled).toBe(false);
    });

    // 撮影完了メッセージが表示される
    expect(screen.getByText('✓ 画像が撮影されました')).toBeDefined();
  });

  // TC-003: ステップ遷移テスト
  test('TC-003: should navigate through steps', async () => {
    render(<TemplateEditor />);

    // Step 1: 画像撮影
    const captureButton = screen.getByText('Mock Capture');
    fireEvent.click(captureButton);

    // Step 2に進む
    const nextButton = screen.getByText('次へ') as HTMLButtonElement;
    await waitFor(() => expect(nextButton.disabled).toBe(false));
    fireEvent.click(nextButton);

    // Step 2が表示される
    await waitFor(() => {
      expect(screen.getByText('OCR領域選択')).toBeDefined();
    });
  });

  // TC-004: 保存フローテスト
  test('TC-004: should save template', async () => {
    const mockOnSave = mock(() => {});
    render(<TemplateEditor onSave={mockOnSave} />);

    // Step 1: 画像撮影
    fireEvent.click(screen.getByText('Mock Capture'));
    await waitFor(() =>
      expect((screen.getByText('次へ') as HTMLButtonElement).disabled).toBe(false)
    );

    // テンプレート名を入力
    const nameInput = screen.getByPlaceholderText(/テンプレート名を入力/);
    fireEvent.change(nameInput, { target: { value: 'テストテンプレート' } });

    // Step 2に進む
    fireEvent.click(screen.getByText('次へ'));

    // 領域を追加
    await waitFor(() => expect(screen.getByTestId('mock-region-selector')).toBeDefined());
    fireEvent.click(screen.getByText('Mock Add Region'));

    // Step 3に進む
    await waitFor(() =>
      expect((screen.getByText('次へ') as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(screen.getByText('次へ'));

    // Step 3が表示される
    await waitFor(() => {
      expect(screen.getByText('確認・保存')).toBeDefined();
    });

    // 保存ボタンが表示される
    const saveButton = screen.getByText('保存') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);

    // 保存をクリック
    fireEvent.click(saveButton);

    // createTemplateが呼ばれる
    await waitFor(() => {
      expect(mockCreateTemplate).toHaveBeenCalledTimes(1);
    });
  });

  // TC-005: ステップ戻るテスト
  test('TC-005: should navigate back through steps', async () => {
    render(<TemplateEditor />);

    // Step 2まで進む
    fireEvent.click(screen.getByText('Mock Capture'));
    await waitFor(() =>
      expect((screen.getByText('次へ') as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(screen.getByText('次へ'));

    // Step 2が表示される
    await waitFor(() => {
      expect(screen.getByText('OCR領域選択')).toBeDefined();
    });

    // 「戻る」ボタンをクリック
    const backButton = screen.getByText('戻る') as HTMLButtonElement;
    expect(backButton.disabled).toBe(false);
    fireEvent.click(backButton);

    // Step 1に戻る
    await waitFor(() => {
      expect(screen.getByText('ベース画像撮影')).toBeDefined();
    });

    // 画像が保持されている
    expect(screen.getByText('✓ 画像が撮影されました')).toBeDefined();
  });

  // TC-006: テンプレート名バリデーションテスト
  test('TC-006: should validate template name', async () => {
    render(<TemplateEditor />);

    const nameInput = screen.getByPlaceholderText(/テンプレート名を入力/);

    // 51文字以上のエラー
    const longName = 'a'.repeat(51);
    fireEvent.change(nameInput, { target: { value: longName } });

    await waitFor(() => {
      expect(screen.getByText('テンプレート名は50文字以内で入力してください')).toBeDefined();
    });
  });

  // TC-009: キャンセル処理テスト
  test('TC-009: should show cancel confirmation dialog', async () => {
    const mockOnCancel = mock(() => {});
    render(<TemplateEditor onCancel={mockOnCancel} />);

    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    // 確認ダイアログが表示される
    await waitFor(() => {
      expect(screen.getByText('編集を中止しますか？')).toBeDefined();
    });

    // 「中止する」をクリック
    const confirmButton = screen.getByText('中止する');
    fireEvent.click(confirmButton);

    // onCancelが呼ばれる
    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  // TC-012: ステップインジケーター表示テスト
  test('TC-012: should display step indicator', async () => {
    render(<TemplateEditor />);

    // Step 1のインジケーター
    const stepIndicators = screen.getAllByText(/[1-3✓]/);
    expect(stepIndicators.length).toBeGreaterThan(0);

    // Step 2に進む
    fireEvent.click(screen.getByText('Mock Capture'));
    await waitFor(() =>
      expect((screen.getByText('次へ') as HTMLButtonElement).disabled).toBe(false)
    );
    fireEvent.click(screen.getByText('次へ'));

    // Step 1が完了（緑のチェックマーク）
    await waitFor(() => {
      expect(screen.getByText('✓')).toBeDefined();
    });
  });
});
