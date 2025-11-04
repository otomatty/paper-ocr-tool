/**
 * Spinner Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/DataInput/OCRProcessor.tsx
 *   └─ src/pages/DataInputPage.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   └─ lucide-react
 *
 * Related Documentation:
 *   ├─ Spec: ./Spinner.spec.md
 *   └─ Plan: docs/03_plans/ui-minimal-design/20241104_01_implementation-plan.md
 */

import { Loader2 } from "lucide-react";
import type React from "react";

interface SpinnerProps {
  size?: "small" | "medium" | "large";
  label?: string;
  className?: string;
}

/**
 * Spinner Component
 *
 * Minimal loading spinner with smooth animation.
 *
 * @param size - Spinner size (default: 'medium')
 * @param label - Optional loading text label
 * @param className - Additional CSS classes
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = "medium",
  label,
  className = "",
}) => {
  const sizeStyles = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <Loader2
        className={`${sizeStyles[size]} animate-spin text-neutral-600`}
        aria-label={label || "Loading"}
      />
      {label && <p className="text-sm text-neutral-600">{label}</p>}
    </div>
  );
};
