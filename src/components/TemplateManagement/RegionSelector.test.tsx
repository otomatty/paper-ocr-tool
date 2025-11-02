/**
 * RegionSelector Component Tests
 *
 * Tests for the OCR region selection component
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react';
import type { Region } from '../../types/template';
import { RegionSelector } from './RegionSelector';

// Mock image data
const mockImageData =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const createMockRegion = (id: string, name: string, order: number): Region => ({
  id,
  name,
  order,
  coordinates: {
    x: 0.1,
    y: 0.1,
    width: 0.2,
    height: 0.2,
  },
});

describe('RegionSelector', () => {
  let mockOnRegionsChange: (regions: Region[]) => void;

  beforeEach(() => {
    mockOnRegionsChange = () => {};
  });

  afterEach(() => {
    cleanup();
  });

  describe('TC-001: 初期表示テスト', () => {
    it('should render canvas and region list', () => {
      render(
        <RegionSelector
          imageData={mockImageData}
          regions={[]}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      // Canvas should be rendered
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeTruthy();

      // Region list should be rendered
      expect(screen.getByText('領域リスト')).toBeTruthy();
      expect(screen.getByText('領域が選択されていません')).toBeTruthy();
    });

    it('should display guide message when no regions', () => {
      render(
        <RegionSelector
          imageData={mockImageData}
          regions={[]}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      expect(screen.getByText('ドラッグして新規領域を選択してください')).toBeTruthy();
    });
  });

  describe('TC-016: 既存領域の編集モードテスト', () => {
    it('should display existing regions', () => {
      const regions = [createMockRegion('r1', '氏名', 1), createMockRegion('r2', 'Q1', 2)];

      render(
        <RegionSelector
          imageData={mockImageData}
          regions={regions}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      const inputs = screen.getAllByPlaceholderText('領域名を入力');
      expect(inputs.length).toBe(2);
      expect((inputs[0] as HTMLInputElement).value).toBe('氏名');
      expect((inputs[1] as HTMLInputElement).value).toBe('Q1');
      expect(screen.getByText(/2\/20 個の領域/)).toBeTruthy();
    });
  });

  describe('TC-017: 読み取り専用モードテスト', () => {
    it('should disable editing in readOnly mode', () => {
      const regions = [createMockRegion('r1', '氏名', 1)];

      render(
        <RegionSelector
          imageData={mockImageData}
          regions={regions}
          onRegionsChange={mockOnRegionsChange}
          readOnly={true}
        />
      );

      // Name input should be disabled
      const nameInput = screen.getByDisplayValue('氏名') as HTMLInputElement;
      expect(nameInput.disabled).toBe(true);

      // Delete button should not be rendered
      expect(screen.queryByText('削除')).toBeNull();
    });

    it('should not show guide message in readOnly mode', () => {
      render(
        <RegionSelector
          imageData={mockImageData}
          regions={[]}
          onRegionsChange={mockOnRegionsChange}
          readOnly={true}
        />
      );

      expect(screen.queryByText('ドラッグして新規領域を選択してください')).toBeNull();
    });
  });

  describe('TC-018: 無効な画像データエラーテスト', () => {
    it('should display error message for invalid image data', async () => {
      render(
        <RegionSelector
          imageData="invalid-data"
          regions={[]}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      // Wait for error to appear
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(screen.getByText('画像の読み込みに失敗しました')).toBeTruthy();
      expect(screen.getByText('再試行')).toBeTruthy();
    });
  });

  describe('TC-007: 領域名変更テスト', () => {
    it('should have editable name inputs', () => {
      const regions = [createMockRegion('r1', '氏名', 1)];

      render(
        <RegionSelector
          imageData={mockImageData}
          regions={regions}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      const nameInput = screen.getByDisplayValue('氏名') as HTMLInputElement;
      expect(nameInput).toBeTruthy();
      expect(nameInput.disabled).toBe(false);
      expect(nameInput.type).toBe('text');
    });
  });

  describe('TC-008: 領域削除テスト', () => {
    it('should render delete buttons for each region', () => {
      const regions = [
        createMockRegion('r1', '領域1', 1),
        createMockRegion('r2', '領域2', 2),
        createMockRegion('r3', '領域3', 3),
      ];

      render(
        <RegionSelector
          imageData={mockImageData}
          regions={regions}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      const deleteButtons = screen.getAllByText('削除');
      expect(deleteButtons.length).toBe(3);
    });
  });

  describe('TC-009: 順序変更テスト（上へ）', () => {
    it('should render up buttons for regions', () => {
      const regions = [
        createMockRegion('r1', '領域1', 1),
        createMockRegion('r2', '領域2', 2),
        createMockRegion('r3', '領域3', 3),
      ];

      render(
        <RegionSelector
          imageData={mockImageData}
          regions={regions}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      const upButtons = screen.getAllByText('↑');
      expect(upButtons.length).toBe(3);
    });

    it('should disable up button for first region', () => {
      const regions = [createMockRegion('r1', '領域1', 1)];

      render(
        <RegionSelector
          imageData={mockImageData}
          regions={regions}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      const upButton = screen.getByText('↑') as HTMLButtonElement;
      expect(upButton.disabled).toBe(true);
    });
  });

  describe('TC-010: 順序変更テスト（下へ）', () => {
    it('should render down buttons for regions', () => {
      const regions = [
        createMockRegion('r1', '領域1', 1),
        createMockRegion('r2', '領域2', 2),
        createMockRegion('r3', '領域3', 3),
      ];

      render(
        <RegionSelector
          imageData={mockImageData}
          regions={regions}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      const downButtons = screen.getAllByText('↓');
      expect(downButtons.length).toBe(3);
    });

    it('should disable down button for last region', () => {
      const regions = [createMockRegion('r1', '領域1', 1)];

      render(
        <RegionSelector
          imageData={mockImageData}
          regions={regions}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      const downButton = screen.getByText('↓') as HTMLButtonElement;
      expect(downButton.disabled).toBe(true);
    });
  });

  describe('TC-011: 最大領域数制限テスト', () => {
    it('should display correct region count', () => {
      const regions = [
        createMockRegion('r1', '領域1', 1),
        createMockRegion('r2', '領域2', 2),
        createMockRegion('r3', '領域3', 3),
      ];

      render(
        <RegionSelector
          imageData={mockImageData}
          regions={regions}
          onRegionsChange={mockOnRegionsChange}
          maxRegions={5}
        />
      );

      expect(screen.getByText(/3\/5 個の領域/)).toBeTruthy();
    });
  });

  describe('TC-020: 複数領域の一括管理テスト', () => {
    it('should display multiple regions in correct order', () => {
      const regions = [
        createMockRegion('r1', '氏名', 1),
        createMockRegion('r2', 'Q1', 2),
        createMockRegion('r3', 'Q2', 3),
        createMockRegion('r4', 'Q3', 4),
        createMockRegion('r5', 'Q4', 5),
      ];

      render(
        <RegionSelector
          imageData={mockImageData}
          regions={regions}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      const inputs = screen.getAllByPlaceholderText('領域名を入力');
      expect(inputs.length).toBe(5);
      expect((inputs[0] as HTMLInputElement).value).toBe('氏名');
      expect((inputs[1] as HTMLInputElement).value).toBe('Q1');
      expect((inputs[2] as HTMLInputElement).value).toBe('Q2');
      expect((inputs[3] as HTMLInputElement).value).toBe('Q3');
      expect((inputs[4] as HTMLInputElement).value).toBe('Q4');

      // Check order numbers
      expect(screen.getByText('1.')).toBeTruthy();
      expect(screen.getByText('2.')).toBeTruthy();
      expect(screen.getByText('3.')).toBeTruthy();
      expect(screen.getByText('4.')).toBeTruthy();
      expect(screen.getByText('5.')).toBeTruthy();
    });
  });
});
