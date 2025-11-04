/**
 * Badge Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/TemplateManagement/TemplateList.tsx
 *   └─ src/pages/DataInputPage.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   └─ src/config/designTokens.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./Badge.spec.md
 *   └─ Plan: docs/03_plans/ui-minimal-design/20241104_01_implementation-plan.md
 */

import type React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  size?: "small" | "medium";
  className?: string;
}

/**
 * Badge Component
 *
 * Minimal status badge for displaying status, tags, or labels.
 *
 * @param children - Badge content
 * @param variant - Visual variant (default: 'neutral')
 * @param size - Badge size (default: 'medium')
 * @param className - Additional CSS classes
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "medium",
  className = "",
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full";

  const sizeStyles = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-3 py-1 text-sm",
  };

  const variantStyles = {
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    error: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    neutral: "bg-neutral-100 text-neutral-700 border border-neutral-200",
  };

  const combinedClassName =
    `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();

  return <span className={combinedClassName}>{children}</span>;
};
