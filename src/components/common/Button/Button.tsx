/**
 * Button Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/components/TemplateManagement/TemplateList.tsx
 *
 * Dependencies (External files that this file imports):
 *   └─ react
 *
 * Related Documentation:
 *   ├─ Spec: ./Button.spec.md
 *   ├─ Tests: ./Button.test.tsx
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_02_common-components-development.md
 *   └─ Prompt: docs/00_prompts/20241102_02_phase2-common-components.md
 */

import type React from 'react';

interface ButtonProps {
  children?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  className?: string;
}

/**
 * Button Component
 *
 * A reusable button component with multiple variants and sizes.
 *
 * @param children - Button content (takes precedence over label)
 * @param label - Button label text
 * @param onClick - Click handler
 * @param variant - Button style variant (default: 'primary')
 * @param size - Button size (default: 'medium')
 * @param disabled - Whether button is disabled
 * @param type - Button type attribute (default: 'button')
 * @param ariaLabel - Accessible label for screen readers
 * @param className - Additional CSS classes
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  label,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  ariaLabel,
  className = '',
}) => {
  // Base styles
  const baseStyles =
    'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles
  const variantStyles = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:hover:bg-blue-600',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:hover:bg-red-600',
  };

  // Size styles
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const combinedClassName =
    `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={combinedClassName}
    >
      {children || label}
    </button>
  );
};
