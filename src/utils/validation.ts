/**
 * Validation Utilities
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/TemplateManagement/TemplateEditor.tsx
 *   ├─ src/utils/templateStorage.ts
 *   └─ src/components/DataInput/ResultEditor.tsx
 *
 * Dependencies (External files that this file imports):
 *   (none - utility functions)
 *
 * Related Documentation:
 *   ├─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 *   └─ Rules: docs/rules/code-quality-standards.md
 */

/**
 * Validate template name
 */
export function validateTemplateName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: 'テンプレート名を入力してください',
    };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      error: 'テンプレート名は50文字以内で入力してください',
    };
  }

  return { isValid: true };
}

/**
 * Validate region name
 */
export function validateRegionName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: '領域名を入力してください',
    };
  }

  if (name.length > 30) {
    return {
      isValid: false,
      error: '領域名は30文字以内で入力してください',
    };
  }

  return { isValid: true };
}

/**
 * Validate region coordinates
 */
export function validateRegionCoordinates(coordinates: {
  x: number;
  y: number;
  width: number;
  height: number;
}): {
  isValid: boolean;
  error?: string;
} {
  const { x, y, width, height } = coordinates;

  if (x < 0 || y < 0) {
    return {
      isValid: false,
      error: '座標は0以上である必要があります',
    };
  }

  if (width <= 0 || height <= 0) {
    return {
      isValid: false,
      error: '幅と高さは0より大きい必要があります',
    };
  }

  return { isValid: true };
}
