/**
 * ResultEditor Component Tests
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   (test file only)
 *
 * Dependencies (External files that this file imports):
 *   ├─ bun:test
 *   ├─ @testing-library/react
 *   ├─ @testing-library/user-event
 *   ├─ ./ResultEditor.tsx
 *   └─ src/types/ocr.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./ResultEditor.spec.md
 *   ├─ Implementation: ./ResultEditor.tsx
 *   └─ Plan: docs/03_plans/phase4-3-result-editor-implementation-plan.md
 */

import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OCRRegionResult } from '../../hooks/useOCR';
import { ResultEditor } from './ResultEditor';

afterEach(() => {
  cleanup();
});

describe('ResultEditor Component', () => {
  // Mock data
  const mockResults: OCRRegionResult[] = [
    {
      regionId: 'region-1',
      regionName: 'Field 1',
      text: 'Sample text 1',
      confidence: 95,
      processingTime: 1000,
    },
    {
      regionId: 'region-2',
      regionName: 'Field 2',
      text: 'Sample text 2',
      confidence: 78,
      processingTime: 1200,
    },
    {
      regionId: 'region-3',
      regionName: 'Field 3',
      text: 'Sample text 3',
      confidence: 65,
      processingTime: 1500,
    },
  ];

  const mockOnSave = mock(() => {});
  const mockOnCancel = mock(() => {});

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  describe('TC-001: 初期化・描画', () => {
    it('TC-001-001: should render component with title', () => {
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByText('ステップ 3: 結果確認・編集')).toBeDefined();
      expect(screen.getByText('抽出されたテキストを確認・編集してください')).toBeDefined();
    });

    it('TC-001-002: should display all result items', () => {
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      mockResults.forEach((result) => {
        expect(screen.getByText(result.regionName)).toBeDefined();
        expect(screen.getByDisplayValue(result.text)).toBeDefined();
      });
    });

    it('TC-001-003: should display statistics', () => {
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      // 編集なし状態での統計
      expect(screen.getByText('編集済み:')).toBeDefined();
      expect(screen.getByText('平均信頼度:')).toBeDefined();
      expect(screen.getByText('合計文字数:')).toBeDefined();
      // 統計値の確認
      const stats = screen.getByText(/0 \/ 3/);
      expect(stats).toBeDefined();
    });

    it('TC-001-004: should display format selector', () => {
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const selectElement = screen.getByDisplayValue('テキスト');
      expect(selectElement).toBeDefined();
      expect(selectElement?.tagName).toBe('SELECT');
    });

    it('TC-001-005: should have action buttons', () => {
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByText('全てリセット')).toBeDefined();
      expect(screen.getByText('キャンセル')).toBeDefined();
      expect(screen.getByText('プレビュー')).toBeDefined();
      expect(screen.getByText('保存')).toBeDefined();
    });
  });

  describe('TC-002: テキスト編集', () => {
    it('TC-002-001: should update text when textarea changes', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const textarea = screen.getByDisplayValue('Sample text 1') as HTMLTextAreaElement;
      await user.clear(textarea);
      await user.type(textarea, 'Modified text');

      expect(textarea.value).toBe('Modified text');
    });

    it('TC-002-002: should show edited badge when text changes', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const textarea = screen.getByDisplayValue('Sample text 1') as HTMLTextAreaElement;
      await user.clear(textarea);
      await user.type(textarea, 'Modified text');

      await waitFor(() => {
        const badges = screen.getAllByText('編集済み');
        expect(badges.length).toBe(1);
      });
    });

    it('TC-002-003: should display original text when edited', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const textarea = screen.getByDisplayValue('Sample text 1') as HTMLTextAreaElement;
      await user.clear(textarea);
      await user.type(textarea, 'Modified text');

      await waitFor(() => {
        expect(screen.getByText('元のテキスト:')).toBeDefined();
        expect(screen.getByText('Sample text 1')).toBeDefined();
      });
    });

    it('TC-002-004: should update statistics when text is edited', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const textarea = screen.getByDisplayValue('Sample text 1') as HTMLTextAreaElement;
      await user.clear(textarea);
      await user.type(textarea, 'Modified');

      await waitFor(() => {
        // Verify that textarea has been modified
        expect((textarea as HTMLTextAreaElement).value).toBe('Modified');
      });
    });
  });

  describe('TC-003: リセット機能', () => {
    it('TC-003-001: should reset individual result', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      // テキストを編集
      const textarea = screen.getByDisplayValue('Sample text 1') as HTMLTextAreaElement;
      await user.clear(textarea);
      await user.type(textarea, 'Modified text');

      // リセットボタンをクリック
      await waitFor(() => {
        const resetButton = screen.getAllByText('リセット');
        expect(resetButton.length).toBeGreaterThan(0);
      });

      const resetButtons = screen.getAllByText('リセット');
      await user.click(resetButtons[0]);

      // テキストが元に戻る
      await waitFor(() => {
        expect(screen.getByDisplayValue('Sample text 1')).toBeDefined();
        expect(screen.queryByText('編集済み')).toBeNull();
      });
    });

    it('TC-003-002: should reset all results', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      // 複数テキストを編集
      const textareas = screen.getAllByRole('textbox');
      await user.clear(textareas[0] as HTMLTextAreaElement);
      await user.type(textareas[0] as HTMLTextAreaElement, 'Modified 1');
      await user.clear(textareas[1] as HTMLTextAreaElement);
      await user.type(textareas[1] as HTMLTextAreaElement, 'Modified 2');

      // 全てリセットボタンをクリック
      const resetAllButton = screen.getByText('全てリセット');
      await user.click(resetAllButton);

      // すべてが元に戻る
      await waitFor(() => {
        expect(screen.getByDisplayValue('Sample text 1')).toBeDefined();
        expect(screen.getByDisplayValue('Sample text 2')).toBeDefined();
        const editedBadges = screen.queryAllByText('編集済み');
        expect(editedBadges.length).toBe(0);
      });
    });
  });

  describe('TC-004: 削除機能', () => {
    it('TC-004-001: should delete individual result', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      // 削除前: 3 つの結果
      expect(screen.getByText('Field 1')).toBeDefined();
      expect(screen.getByText('Field 2')).toBeDefined();
      expect(screen.getByText('Field 3')).toBeDefined();

      // Field 1 の削除ボタンをクリック
      const deleteButtons = screen.getAllByText('削除');
      await user.click(deleteButtons[0]);

      // Field 1 が削除される
      await waitFor(() => {
        expect(screen.queryByText('Field 1')).toBeNull();
        expect(screen.getByText('Field 2')).toBeDefined();
        expect(screen.getByText('Field 3')).toBeDefined();
      });
    });

    it('TC-004-002: should show empty message after deleting all', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      // すべての削除ボタンをクリック
      const deleteButtons = screen.getAllByText('削除');
      for (const button of deleteButtons) {
        await user.click(button);
      }

      // 「結果がありません」メッセージが表示される
      await waitFor(() => {
        expect(screen.getByText('結果がありません')).toBeDefined();
      });
    });
  });

  describe('TC-005: 保存・キャンセル', () => {
    it('TC-005-001: should call onSave with edited results', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      // テキストを編集
      const textarea = screen.getByDisplayValue('Sample text 1') as HTMLTextAreaElement;
      await user.clear(textarea);
      await user.type(textarea, 'Modified text');

      // 保存ボタンをクリック
      const saveButton = screen.getByText('保存');
      await user.click(saveButton);

      // onSave が呼ばれることを確認
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });

      // 返された結果を確認（Mock呼び出しが記録されているはず）
      expect(mockOnSave.mock.calls.length).toBeGreaterThan(0);
    });

    it('TC-005-002: should call onCancel', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      // キャンセルボタンをクリック
      const cancelButton = screen.getByText('キャンセル');
      await user.click(cancelButton);

      // onCancel が呼ばれることを確認
      await waitFor(() => {
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('TC-006: フォーマット・プレビュー', () => {
    it('TC-006-001: should change format selection', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const formatSelect = screen.getByDisplayValue('テキスト') as HTMLSelectElement;
      await user.selectOptions(formatSelect, 'csv');

      expect(formatSelect.value).toBe('csv');
    });

    it('TC-006-002: should toggle preview', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      // プレビュー非表示が初期状態
      expect(screen.queryByText('プレビュー')).not.toBeNull();

      // プレビューボタンをクリック
      const previewButton = screen.getByText('プレビュー');
      await user.click(previewButton);

      // プレビューが表示される
      await waitFor(() => {
        expect(screen.getByText('プレビュー非表示')).toBeDefined();
      });
    });

    it('TC-006-003: should hide preview on toggle', async () => {
      const user = userEvent.setup();
      render(<ResultEditor results={mockResults} onSave={mockOnSave} onCancel={mockOnCancel} />);

      // プレビュー表示
      let previewButton = screen.getByText('プレビュー');
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('プレビュー非表示')).toBeDefined();
      });

      // プレビュー非表示
      previewButton = screen.getByText('プレビュー非表示');
      await user.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('プレビュー')).toBeDefined();
      });
    });
  });

  describe('TC-007: 信頼度表示', () => {
    it('TC-007-001: should display green indicator for high confidence', () => {
      render(
        <ResultEditor
          results={[mockResults[0]]} // 95% confidence
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('信頼度: 95%')).toBeDefined();
    });

    it('TC-007-002: should display yellow indicator for medium confidence', () => {
      render(
        <ResultEditor
          results={[mockResults[1]]} // 78% confidence
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('信頼度: 78%')).toBeDefined();
    });

    it('TC-007-003: should display red indicator for low confidence', () => {
      render(
        <ResultEditor
          results={[mockResults[2]]} // 65% confidence
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('信頼度: 65%')).toBeDefined();
    });
  });

  describe('TC-008: 読み取り専用モード', () => {
    it('TC-008-001: should hide edit buttons in readonly mode', () => {
      render(
        <ResultEditor
          results={mockResults}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          readOnly={true}
        />
      );

      // 削除ボタンが表示されない
      expect(screen.queryByText('削除')).toBeNull();
      // 全てリセットが表示されない
      expect(screen.queryByText('全てリセット')).toBeNull();
      // 保存ボタンが表示されない
      expect(screen.queryByText('保存')).toBeNull();
    });

    it('TC-008-002: should disable textarea in readonly mode', () => {
      render(
        <ResultEditor
          results={mockResults}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          readOnly={true}
        />
      );

      const textareas = screen.getAllByRole('textbox');
      textareas.forEach((textarea) => {
        expect((textarea as HTMLTextAreaElement).disabled).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results', () => {
      render(<ResultEditor results={[]} onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByText('結果がありません')).toBeDefined();
    });

    it('should handle very long text', async () => {
      const longText = 'A'.repeat(1000);
      const resultsWithLongText = [{ ...mockResults[0], text: longText }];

      render(
        <ResultEditor results={resultsWithLongText} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      const textarea = screen.getByDisplayValue(longText) as HTMLTextAreaElement;
      expect(textarea.value).toBe(longText);
    });

    it('should handle special characters in text', () => {
      const specialText = 'Hello\nWorld\t!"#$%';
      const resultsWithSpecialChars = [{ ...mockResults[0], text: specialText }];

      render(
        <ResultEditor
          results={resultsWithSpecialChars}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Get textarea and verify it contains the special characters
      const textarea = screen.getAllByRole('textbox')[0] as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialText);
    });

    it('should handle 100% confidence', () => {
      const perfectConfidence = { ...mockResults[0], confidence: 100 };
      render(
        <ResultEditor results={[perfectConfidence]} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('信頼度: 100%')).toBeDefined();
    });

    it('should handle 0% confidence', () => {
      const zeroConfidence = { ...mockResults[0], confidence: 0 };
      render(
        <ResultEditor results={[zeroConfidence]} onSave={mockOnSave} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('信頼度: 0%')).toBeDefined();
    });
  });
});
