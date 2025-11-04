/**
 * Card Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/pages/HomePage.tsx
 *   ├─ src/pages/TemplateManagementPage.tsx
 *   └─ src/pages/DataInputPage.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   └─ src/config/designTokens.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./Card.spec.md
 *   └─ Plan: docs/03_plans/ui-minimal-design/20241104_01_implementation-plan.md
 */

import type React from "react";

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  className?: string;
}

/**
 * Card Component
 *
 * Minimal design card container with optional header and footer.
 * Inspired by Apple's design language.
 *
 * @param children - Card content
 * @param header - Optional header section
 * @param footer - Optional footer section
 * @param onClick - Optional click handler (makes card interactive)
 * @param hoverable - Enable hover effect (default: false)
 * @param className - Additional CSS classes
 */
export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  onClick,
  hoverable = false,
  className = "",
}) => {
  const isInteractive = Boolean(onClick);

  const baseStyles =
    "bg-white border border-neutral-200 rounded-lg transition-all duration-200";

  const interactiveStyles = isInteractive
    ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
    : "";

  const hoverStyles =
    hoverable || isInteractive
      ? "hover:shadow-md hover:-translate-y-0.5 hover:border-neutral-300"
      : "";

  const combinedClassName =
    `${baseStyles} ${interactiveStyles} ${hoverStyles} ${className}`.trim();

  const CardWrapper = onClick ? "button" : "div";

  return (
    <CardWrapper
      className={combinedClassName}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {header && (
        <div className="px-6 py-4 border-b border-neutral-100">{header}</div>
      )}
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
          {footer}
        </div>
      )}
    </CardWrapper>
  );
};
