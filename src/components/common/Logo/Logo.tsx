/**
 * Logo Component - PaperScan
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/common/Layout/Layout.tsx
 *   └─ src/components/common/Logo/index.ts
 *
 * Dependencies (External files that this file imports):
 *   └─ react
 *
 * Related Documentation:
 *   ├─ Spec: ./Logo.spec.md
 *   └─ Tests: ./Logo.test.tsx
 */

import type React from "react";

interface LogoProps {
  /** Size of the logo in pixels (width) */
  size?: number;
  /** Whether to show the text label */
  showText?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Logo Component
 *
 * Displays the PaperScan application logo.
 * Features a minimalist paper sheet icon with scanning lines.
 *
 * @param size - Width of the logo (default: 120)
 * @param showText - Whether to display "PaperScan" text (default: true)
 * @param className - Additional CSS classes
 */
export const Logo: React.FC<LogoProps> = ({
  size = 120,
  showText = true,
  className = "",
}) => {
  const iconSize = size * 0.3; // Icon is 30% of total width
  const textHeight = size * 0.25;

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ width: size }}
    >
      {/* Icon: Paper with scan lines */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        role="img"
        aria-label="PaperScan logo"
      >
        <title>PaperScan</title>
        {/* Paper outline with folded corner */}
        <path
          d="M6 4C6 2.89543 6.89543 2 8 2H20L26 8V28C26 29.1046 25.1046 30 24 30H8C6.89543 30 6 29.1046 6 28V4Z"
          fill="currentColor"
          className="text-neutral-100"
        />
        <path
          d="M20 2L26 8H22C20.8954 8 20 7.10457 20 6V2Z"
          fill="currentColor"
          className="text-neutral-200"
        />
        <path
          d="M6 4C6 2.89543 6.89543 2 8 2H20L26 8V28C26 29.1046 25.1046 30 24 30H8C6.89543 30 6 29.1046 6 28V4Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-700"
        />

        {/* Scanning lines with gradient effect */}
        <g className="text-blue-500">
          <line
            x1="10"
            y1="14"
            x2="22"
            y2="14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.3"
          />
          <line
            x1="10"
            y1="18"
            x2="22"
            y2="18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <line
            x1="10"
            y1="22"
            x2="22"
            y2="22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.3"
          />
        </g>

        {/* Scan beam effect (optional animation line) */}
        <line
          x1="8"
          y1="18"
          x2="24"
          y2="18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-blue-400"
          opacity="0.8"
        />
      </svg>

      {/* Text label */}
      {showText && (
        <span
          className="font-semibold text-neutral-900 tracking-tight"
          style={{ fontSize: textHeight }}
        >
          PaperScan
        </span>
      )}
    </div>
  );
};
