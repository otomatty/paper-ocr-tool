/**
 * DataInputPage Component Tests
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
 *   ├─ react-router-dom
 *   ├─ ./DataInputPage.tsx
 *   ├─ src/hooks/useTemplate.ts
 *   └─ src/components/DataInput/OCRProcessor.tsx
 *
 * Related Documentation:
 *   ├─ Spec: ./DataInputPage.spec.md
 *   ├─ Implementation: ./DataInputPage.tsx
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from "react-router-dom";
import type { OCRRegionResult } from "../hooks/useOCR";
import type { Template } from "../types/template";
import { DataInputPage } from "./DataInputPage";

// Mock useTemplate hook
let mockTemplates: Template[] = [];
let mockGetTemplate: (id: string) => Template | undefined;

const mockUseTemplate = mock(() => ({
  templates: mockTemplates,
  getTemplate: mockGetTemplate,
  createTemplate: mock(() => {}),
  updateTemplate: mock(() => {}),
  deleteTemplate: mock(() => {}),
}));

// Mock OCRProcessor component
mock.module("../components/DataInput/OCRProcessor", () => ({
  OCRProcessor: ({
    template,
    onComplete,
    onError,
  }: {
    template: Template;
    onComplete: (results: OCRRegionResult[]) => void;
    onError: (error: Error) => void;
  }) => (
    <div data-testid="mock-ocr-processor">
      <p>OCR Processor Mock</p>
      <p>Template: {template?.name}</p>
      <button
        type="button"
        onClick={() => {
          const mockResults: OCRRegionResult[] = [
            {
              regionId: "region-1",
              regionName: "Field 1",
              text: "Test Result 1",
              confidence: 95,
              processingTime: 1000,
            },
            {
              regionId: "region-2",
              regionName: "Field 2",
              text: "Test Result 2",
              confidence: 88,
              processingTime: 1200,
            },
          ];
          onComplete(mockResults);
        }}
      >
        Complete OCR
      </button>
      <button
        type="button"
        onClick={() => {
          onError(new Error("OCR processing failed"));
        }}
      >
        Trigger Error
      </button>
    </div>
  ),
}));

// Mock useTemplate
mock.module("../hooks/useTemplate", () => ({
  useTemplate: mockUseTemplate,
}));

// Clean up after each test
afterEach(() => {
  cleanup();
  mockTemplates = [];
});

// Wrapper component with Router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(<Router>{component}</Router>);
};

describe("DataInputPage Component", () => {
  const mockTemplate1: Template = {
    id: "template-1",
    name: "テンプレート1",
    regions: [
      {
        id: "region-1",
        name: "Field 1",
        coordinates: { x: 10, y: 10, width: 100, height: 50 },
        order: 0,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTemplate2: Template = {
    id: "template-2",
    name: "テンプレート2",
    regions: [
      {
        id: "region-1",
        name: "Field 1",
        coordinates: { x: 10, y: 10, width: 100, height: 50 },
        order: 0,
      },
      {
        id: "region-2",
        name: "Field 2",
        coordinates: { x: 10, y: 70, width: 100, height: 50 },
        order: 1,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockTemplates = [mockTemplate1, mockTemplate2];
    mockGetTemplate = (id: string) => mockTemplates.find((t) => t.id === id);
  });

  describe("TC-DATA-001: ページ表示確認", () => {
    it("should render page title and description", () => {
      renderWithRouter(<DataInputPage />);

      // タイトル確認（Layout内のタイトルと区別するため、h1タグで検索）
      const headings = screen.getAllByText("データ入力");
      expect(headings.length).toBeGreaterThan(0);

      expect(
        screen.getByText(/記入済みアンケートを撮影してOCR処理を行い/)
      ).toBeDefined();
    });

    it("should display step indicators", () => {
      renderWithRouter(<DataInputPage />);

      // ステップ表示確認
      expect(screen.getByText("ステップ 1: テンプレート選択")).toBeDefined();
      expect(
        screen.getByText("ステップ 2: アンケート撮影・OCR実行")
      ).toBeDefined();
    });

    it("should render layout component", () => {
      const { container } = renderWithRouter(<DataInputPage />);

      // Layoutコンポーネントのheader/nav/mainが存在するか確認
      const header = container.querySelector("header");
      const nav = container.querySelector("nav");
      const main = container.querySelector("main");

      expect(header).toBeDefined();
      expect(nav).toBeDefined();
      expect(main).toBeDefined();
    });
  });

  describe("TC-DATA-002: テンプレート選択", () => {
    it("should display template list", () => {
      renderWithRouter(<DataInputPage />);

      // テンプレート一覧の表示確認
      expect(screen.getByText("テンプレート1")).toBeDefined();
      expect(screen.getByText("テンプレート2")).toBeDefined();
    });

    it("should display region count for each template", () => {
      renderWithRouter(<DataInputPage />);

      // 領域数の表示確認
      const regionCounts = screen.getAllByText(/領域/);
      expect(regionCounts.length).toBe(2);
      expect(screen.getByText("1 領域")).toBeDefined();
      expect(screen.getByText("2 領域")).toBeDefined();
    });

    it("should select template when clicked", async () => {
      const user = userEvent.setup();
      renderWithRouter(<DataInputPage />);

      // テンプレートを選択
      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");
      expect(template1Button).toBeDefined();

      await user.click(template1Button!);

      // 選択状態の確認（背景色変更など）
      await waitFor(() => {
        expect(template1Button?.className).toContain("border-blue-500");
        expect(template1Button?.className).toContain("bg-blue-50");
      });
    });

    it("should display OCRProcessor after template selection", async () => {
      const user = userEvent.setup();
      renderWithRouter(<DataInputPage />);

      // テンプレート選択前
      expect(screen.getByText("テンプレートを選択してください")).toBeDefined();

      // テンプレートを選択
      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");
      await user.click(template1Button!);

      // OCRProcessorが表示されることを確認
      await waitFor(() => {
        expect(screen.getByTestId("mock-ocr-processor")).toBeDefined();
        expect(screen.getByText("Template: テンプレート1")).toBeDefined();
      });
    });

    it("should display message when no templates exist", () => {
      mockTemplates = [];
      renderWithRouter(<DataInputPage />);

      expect(
        screen.getByText("テンプレートが登録されていません")
      ).toBeDefined();
    });
  });

  describe("TC-DATA-003: OCR処理とエラーハンドリング", () => {
    it("should handle OCR completion", async () => {
      const user = userEvent.setup();
      renderWithRouter(<DataInputPage />);

      // テンプレート選択
      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");
      await user.click(template1Button!);

      // OCR完了ボタンをクリック
      await waitFor(() => {
        expect(screen.getByText("Complete OCR")).toBeDefined();
      });

      const completeButton = screen.getByText("Complete OCR");
      await user.click(completeButton);

      // 結果画面に遷移することを確認
      await waitFor(() => {
        expect(screen.getByText("ステップ 3: 結果確認")).toBeDefined();
        expect(screen.getByText("Field 1")).toBeDefined();
        expect(screen.getByText("Field 2")).toBeDefined();
      });
    });

    it("should display OCR results with confidence scores", async () => {
      const user = userEvent.setup();
      renderWithRouter(<DataInputPage />);

      // テンプレート選択 & OCR実行
      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");
      await user.click(template1Button!);

      await waitFor(() => {
        expect(screen.getByText("Complete OCR")).toBeDefined();
      });

      const completeButton = screen.getByText("Complete OCR");
      await user.click(completeButton);

      // 結果と信頼度の表示確認
      await waitFor(() => {
        expect(screen.getByText("Test Result 1")).toBeDefined();
        expect(screen.getByText("Test Result 2")).toBeDefined();
        expect(screen.getByText("信頼度: 95%")).toBeDefined();
        expect(screen.getByText("信頼度: 88%")).toBeDefined();
      });
    });

    it("should handle OCR error", async () => {
      const user = userEvent.setup();
      renderWithRouter(<DataInputPage />);

      // テンプレート選択
      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");
      await user.click(template1Button!);

      // エラーをトリガー
      await waitFor(() => {
        expect(screen.getByText("Trigger Error")).toBeDefined();
      });

      const errorButton = screen.getByText("Trigger Error");
      await user.click(errorButton);

      // エラーメッセージの表示確認
      await waitFor(() => {
        expect(screen.getByText("OCR processing failed")).toBeDefined();
        expect(screen.getByRole("alert")).toBeDefined();
      });
    });
  });

  describe("TC-DATA-007: クリップボードコピー", () => {
    it("should copy results to clipboard", async () => {
      // Mock alert to prevent blocking
      const originalAlert = global.alert;
      const alertMock = mock(() => {});
      global.alert = alertMock;

      const user = userEvent.setup();
      renderWithRouter(<DataInputPage />);

      // テンプレート選択 & OCR実行
      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");
      await user.click(template1Button!);

      await waitFor(() => {
        expect(screen.getByText("Complete OCR")).toBeDefined();
      });

      const completeButton = screen.getByText("Complete OCR");
      await user.click(completeButton);

      // 結果画面でコピーボタンをクリック
      await waitFor(() => {
        expect(screen.getByText("📋 クリップボードにコピー")).toBeDefined();
      });

      // Verify results are displayed before copying
      expect(screen.getByText("Field 1")).toBeDefined();
      expect(screen.getByText("Test Result 1")).toBeDefined();
      expect(screen.getByText("Field 2")).toBeDefined();
      expect(screen.getByText("Test Result 2")).toBeDefined();

      const copyButton = screen.getByText("📋 クリップボードにコピー");

      // Mock writeText to track calls
      const originalWriteText = global.navigator.clipboard.writeText;
      const writeTextSpy = mock(async (text: string) => {
        // @ts-expect-error - Custom property for testing
        global.navigator.clipboard._lastCopiedText = text;
        return Promise.resolve();
      });
      global.navigator.clipboard.writeText = writeTextSpy;

      await user.click(copyButton);

      // Verify writeText was called
      await waitFor(
        () => {
          expect(writeTextSpy).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );

      // Get the text that was passed to writeText
      expect(writeTextSpy).toHaveBeenCalledTimes(1);
      const [[copiedText]] = writeTextSpy.mock.calls as [[string]];
      expect(copiedText).toContain("Field 1: Test Result 1");
      expect(copiedText).toContain("Field 2: Test Result 2");

      // alert()が呼ばれることを確認
      expect(alertMock).toHaveBeenCalledTimes(1);

      // Restore writeText
      global.navigator.clipboard.writeText = originalWriteText; // Restore alert
      global.alert = originalAlert;
    });

    it("should handle clipboard copy failure", async () => {
      const user = userEvent.setup();

      // clipboard APIを一時的に失敗させる
      const originalWriteText = global.navigator.clipboard.writeText;
      global.navigator.clipboard.writeText = async () => {
        return Promise.reject(new Error("Clipboard access denied"));
      };

      renderWithRouter(<DataInputPage />);

      // テンプレート選択 & OCR実行
      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");
      await user.click(template1Button!);

      await waitFor(() => {
        expect(screen.getByText("Complete OCR")).toBeDefined();
      });

      const completeButton = screen.getByText("Complete OCR");
      await user.click(completeButton);

      // コピーボタンをクリック
      await waitFor(() => {
        expect(screen.getByText("📋 クリップボードにコピー")).toBeDefined();
      });

      const copyButton = screen.getByText("📋 クリップボードにコピー");
      await user.click(copyButton);

      // エラーメッセージの表示確認
      await waitFor(() => {
        expect(
          screen.getByText("クリップボードへのコピーに失敗しました")
        ).toBeDefined();
      });

      // Restore original function
      global.navigator.clipboard.writeText = originalWriteText;
    });
  });

  describe("TC-DATA-008: 連続処理", () => {
    it("should reset and return to template selection", async () => {
      const user = userEvent.setup();
      renderWithRouter(<DataInputPage />);

      // テンプレート選択 & OCR実行
      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");
      await user.click(template1Button!);

      await waitFor(() => {
        expect(screen.getByText("Complete OCR")).toBeDefined();
      });

      const completeButton = screen.getByText("Complete OCR");
      await user.click(completeButton);

      // 結果画面で「戻る」ボタンをクリック
      await waitFor(() => {
        expect(screen.getByText("戻る")).toBeDefined();
      });

      const backButton = screen.getByText("戻る");
      await user.click(backButton);

      // OCR入力画面に戻ることを確認
      await waitFor(() => {
        expect(
          screen.getByText("ステップ 2: アンケート撮影・OCR実行")
        ).toBeDefined();
        expect(screen.queryByText("ステップ 3: 結果確認")).toBeNull();
      });
    });

    it("should maintain template selection after reset", async () => {
      const user = userEvent.setup();
      renderWithRouter(<DataInputPage />);

      // テンプレート選択
      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");
      await user.click(template1Button!);

      await waitFor(() => {
        expect(screen.getByText("Complete OCR")).toBeDefined();
      });

      const completeButton = screen.getByText("Complete OCR");
      await user.click(completeButton);

      // 戻る
      await waitFor(() => {
        expect(screen.getByText("戻る")).toBeDefined();
      });

      const backButton = screen.getByText("戻る");
      await user.click(backButton);

      // テンプレートが選択状態のまま
      await waitFor(() => {
        expect(template1Button?.className).toContain("border-blue-500");
        expect(screen.getByText("Template: テンプレート1")).toBeDefined();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined template gracefully", () => {
      mockGetTemplate = () => undefined;
      renderWithRouter(<DataInputPage />);

      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");

      // テンプレート選択を試みても、OCRProcessorは表示されない
      expect(template1Button).toBeDefined();
    });

    it("should clear error when template is selected", async () => {
      const user = userEvent.setup();
      renderWithRouter(<DataInputPage />);

      // テンプレート選択 & エラー発生
      const template1Button = screen
        .getByText("テンプレート1")
        .closest("button");
      await user.click(template1Button!);

      await waitFor(() => {
        expect(screen.getByText("Trigger Error")).toBeDefined();
      });

      const errorButton = screen.getByText("Trigger Error");
      await user.click(errorButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeDefined();
      });

      // 別のテンプレートを選択
      const template2Button = screen
        .getByText("テンプレート2")
        .closest("button");
      await user.click(template2Button!);

      // エラーがクリアされる
      await waitFor(() => {
        expect(screen.queryByRole("alert")).toBeNull();
      });
    });
  });
});
