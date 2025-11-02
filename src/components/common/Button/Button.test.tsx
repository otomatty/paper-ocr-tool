/**
 * Button Component Tests
 *
 * Related Documentation:
 *   ├─ Spec: ./Button.spec.md
 *   ├─ Implementation: ./Button.tsx
 */

import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react';
import { Button } from './Button';

// Clean up after each test
afterEach(() => {
  cleanup();
});

describe('Button Component', () => {
  describe('TC-BUTTON-001: 基本的なレンダリング', () => {
    it('should render button with label', () => {
      render(<Button label="クリック" />);

      const button = screen.getByRole('button', { name: 'クリック' });
      expect(button).toBeDefined();
      expect(button.textContent).toBe('クリック');
    });
  });

  describe('TC-BUTTON-002: variant プロパティ', () => {
    it('should apply primary variant styles', () => {
      render(<Button label="Primary" variant="primary" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-blue-600');
    });

    it('should apply secondary variant styles', () => {
      render(<Button label="Secondary" variant="secondary" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-200');
    });

    it('should apply danger variant styles', () => {
      render(<Button label="Danger" variant="danger" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-red-600');
    });
  });

  describe('TC-BUTTON-003: size プロパティ', () => {
    it('should apply small size styles', () => {
      render(<Button label="Small" size="small" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-3');
      expect(button.className).toContain('py-1.5');
    });

    it('should apply medium size styles by default', () => {
      render(<Button label="Medium" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-4');
      expect(button.className).toContain('py-2');
    });

    it('should apply large size styles', () => {
      render(<Button label="Large" size="large" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('px-6');
      expect(button.className).toContain('py-3');
    });
  });

  describe('TC-BUTTON-004: onClick ハンドラー', () => {
    it('should call onClick when clicked', () => {
      const handleClick = mock(() => {});
      render(<Button label="Click Me" onClick={handleClick} />);

      const button = screen.getByRole('button');
      button.click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('TC-BUTTON-005: disabled 状態', () => {
    it('should not call onClick when disabled', () => {
      const handleClick = mock(() => {});
      render(<Button label="Disabled" onClick={handleClick} disabled />);

      const button = screen.getByRole('button');
      expect(button.hasAttribute('disabled')).toBe(true);

      button.click();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have disabled styles', () => {
      render(<Button label="Disabled" disabled />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:opacity-50');
      expect(button.className).toContain('disabled:cursor-not-allowed');
    });
  });

  describe('TC-BUTTON-006: children vs label', () => {
    it('should prioritize children over label', () => {
      render(<Button label="Label">Children</Button>);

      const button = screen.getByRole('button');
      expect(button.textContent).toBe('Children');
    });

    it('should use label when children is not provided', () => {
      render(<Button label="Label Only" />);

      const button = screen.getByRole('button');
      expect(button.textContent).toBe('Label Only');
    });
  });

  describe('Edge Cases', () => {
    it('should render with neither children nor label', () => {
      render(<Button />);
      const button = screen.getByRole('button');
      expect(button).toBeDefined();
      expect(button.textContent).toBe('');
    });

    it('should apply custom className', () => {
      render(<Button label="Custom" className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });

    it('should set aria-label when provided', () => {
      render(<Button label="Button" ariaLabel="Accessible Label" />);
      const button = screen.getByRole('button', { name: 'Accessible Label' });
      expect(button).toBeDefined();
    });

    it('should support different button types', () => {
      render(<Button label="Submit" type="submit" />);
      const button = screen.getByRole('button');
      expect(button.getAttribute('type')).toBe('submit');
    });
  });
});
