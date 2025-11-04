/**
 * Button Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/TemplateManagement/TemplateList.tsx
 *   ├─ src/pages/HomePage.tsx
 *   └─ src/pages/DataInputPage.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   └─ lucide-react
 *
 * Related Documentation:
 *   ├─ Spec: ./Button.spec.md
 *   ├─ Tests: ./Button.test.tsx
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_02_common-components-development.md
 *   └─ Prompt: docs/00_prompts/20241102_02_phase2-common-components.md
 */

import type React from "react";

interface ButtonProps {
  children?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

/**
 * Button Component - Minimal Design
 *
 * A reusable button component with minimal design aesthetic.
 * Inspired by Apple's clean and simple button style.
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
 * @param icon - Optional icon element
 * @param iconPosition - Icon position (default: 'left')
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  label,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  ariaLabel,
  className = "",
  icon,
  iconPosition = "left",
}) => {
  // Base styles - minimal and clean
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Variant styles - subtle and refined
  const variantStyles = {
    primary:
      "bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-400 disabled:hover:bg-neutral-900",
    secondary:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-300 focus:ring-neutral-400 disabled:hover:bg-neutral-100",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:hover:bg-red-600",
    ghost:
      "bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-400",
  };

  // Size styles
  const sizeStyles = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  const combinedClassName =
    `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  const content = children || label;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={combinedClassName}
    >
      {icon && iconPosition === "left" && icon}
      {content}
      {icon && iconPosition === "right" && icon}
    </button>
  );
};
