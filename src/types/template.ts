/**
 * Template Type Definitions
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/TemplateManagement/TemplateList.tsx
 *   ├─ src/components/TemplateManagement/RegionSelector.tsx
 *   └─ src/hooks/useTemplate.ts
 *
 * Dependencies (External files that this file imports):
 *   (none - type definition file)
 *
 * Related Documentation:
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_01_paper-ocr-web-app-main-requirements.md
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

/**
 * Region represents an OCR extraction area on the template
 */
export interface Region {
  id: string;
  name: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  order: number;
}

/**
 * Template represents a questionnaire template with defined OCR regions
 */
export interface Template {
  id: string;
  name: string;
  baseImageData?: string; // Base64 encoded image
  regions: Region[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request type for creating a new template
 */
export interface CreateTemplateRequest {
  name: string;
  baseImageData: string;
  regions: Omit<Region, 'id'>[];
}

/**
 * Request type for updating an existing template
 */
export interface UpdateTemplateRequest {
  name?: string;
  baseImageData?: string;
  regions?: Region[];
}
