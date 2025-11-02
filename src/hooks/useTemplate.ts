/**
 * useTemplate Hook
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/TemplateManagement/TemplateList.tsx
 *   └─ src/components/TemplateManagement/TemplateEditor.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ ../types/template.ts
 *   └─ ../utils/localStorage.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./useTemplate.spec.md
 *   ├─ Tests: ./useTemplate.test.ts
 *   └─ Plan: docs/03_plans/overall/20241102_01_project-overall-plan.md
 */

import { useEffect, useState } from 'react';
import type { Template } from '../types/template';

const STORAGE_KEY = 'paper-ocr-templates';

export interface UseTemplateReturn {
  templates: Template[];
  loading: boolean;
  error: string | null;

  createTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Template>;
  updateTemplate: (
    id: string,
    updates: Partial<Omit<Template, 'id' | 'createdAt'>>
  ) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplate: (id: string) => Template | undefined;
}

/**
 * Custom hook for managing templates with localStorage persistence
 *
 * Provides CRUD operations for templates and automatic persistence
 * to localStorage.
 *
 * @returns {UseTemplateReturn} Template state and CRUD operations
 */
export function useTemplate(): UseTemplateReturn {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const templatesWithDates = parsed.map((t: Template) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
        setTemplates(templatesWithDates);
      }
      setError(null);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('テンプレートデータが破損しています');
      } else {
        setError('テンプレートの読み込みに失敗しました');
      }
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save templates to localStorage
  const saveToStorage = (templatesToSave: Template[]): void => {
    try {
      const serialized = JSON.stringify(templatesToSave);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      throw new Error('テンプレートの保存に失敗しました');
    }
  };

  // Generate unique ID
  const generateId = (): string => {
    // Use crypto.randomUUID() if available, otherwise fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  // Create new template
  const createTemplate = async (
    template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Template> => {
    const now = new Date();
    const newTemplate: Template = {
      ...template,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedTemplates = [...templates, newTemplate];

    try {
      saveToStorage(updatedTemplates);
      setTemplates(updatedTemplates);
      setError(null);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'テンプレートの保存に失敗しました');
      throw err;
    }
  };

  // Update existing template
  const updateTemplate = async (
    id: string,
    updates: Partial<Omit<Template, 'id' | 'createdAt'>>
  ): Promise<void> => {
    const templateIndex = templates.findIndex((t) => t.id === id);

    // Silently ignore if template not found
    if (templateIndex === -1) {
      return;
    }

    const updatedTemplate: Template = {
      ...templates[templateIndex],
      ...updates,
      updatedAt: new Date(),
    };

    const updatedTemplates = [...templates];
    updatedTemplates[templateIndex] = updatedTemplate;

    try {
      saveToStorage(updatedTemplates);
      setTemplates(updatedTemplates);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'テンプレートの保存に失敗しました');
      throw err;
    }
  };

  // Delete template
  const deleteTemplate = async (id: string): Promise<void> => {
    const updatedTemplates = templates.filter((t) => t.id !== id);

    // Silently ignore if template not found (no change in array)
    if (updatedTemplates.length === templates.length) {
      return;
    }

    try {
      saveToStorage(updatedTemplates);
      setTemplates(updatedTemplates);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'テンプレートの保存に失敗しました');
      throw err;
    }
  };

  // Get single template by ID
  const getTemplate = (id: string): Template | undefined => {
    return templates.find((t) => t.id === id);
  };

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
  };
}
