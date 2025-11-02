/**
 * TemplateEditor Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   (none - new component, will be imported by TemplateManagementPage)
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ src/components/Camera/Camera.tsx
 *   ├─ src/components/TemplateManagement/RegionSelector.tsx
 *   ├─ src/hooks/useTemplate.ts
 *   ├─ src/types/template.ts
 *   └─ src/utils/validation.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./TemplateEditor.spec.md
 *   ├─ Tests: ./TemplateEditor.test.tsx
 *   └─ Plan: docs/03_plans/template-management/20241103_01_next-implementation-plan.md
 */

import { useCallback, useEffect, useState } from 'react';
import { useTemplate } from '../../hooks/useTemplate';
import type { Region, Template } from '../../types/template';
import { validateTemplateName } from '../../utils/validation';
import { Camera } from '../Camera/Camera';
import { RegionSelector } from './RegionSelector';

interface TemplateEditorProps {
  /**
   * Template ID for edit mode (undefined for create mode)
   */
  templateId?: string;

  /**
   * Callback fired when template is successfully saved
   */
  onSave?: (template: Template) => void;

  /**
   * Callback fired when user cancels editing
   */
  onCancel?: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

type EditorStep = 1 | 2 | 3;

interface StepConfig {
  step: EditorStep;
  title: string;
  description: string;
}

const STEP_CONFIG: Record<EditorStep, StepConfig> = {
  1: {
    step: 1,
    title: 'ベース画像撮影',
    description: '空のアンケート用紙を撮影してください',
  },
  2: {
    step: 2,
    title: 'OCR領域選択',
    description: '抽出したい領域をドラッグで選択してください',
  },
  3: {
    step: 3,
    title: '確認・保存',
    description: '内容を確認して保存してください',
  },
};

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ templateId, onSave, onCancel }) => {
  const { templates, createTemplate, updateTemplate } = useTemplate();

  // Editor state
  const [currentStep, setCurrentStep] = useState<EditorStep>(1);
  const [templateName, setTemplateName] = useState('');
  const [baseImageData, setBaseImageData] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Load existing template for edit mode
  useEffect(() => {
    if (!templateId) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const template = templates.find((t) => t.id === templateId);
      if (!template) {
        setLoadError('テンプレートが見つかりません');
        return;
      }

      setTemplateName(template.name);
      setBaseImageData(template.baseImageData || null);
      setRegions(template.regions);
    } catch (error) {
      setLoadError('テンプレートの読み込みに失敗しました');
      console.error('Template load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [templateId, templates]);

  // Validate current state
  const validateCurrentState = useCallback((): boolean => {
    const errors: ValidationError[] = [];

    // Template name validation
    const nameValidation = validateTemplateName(templateName);
    if (!nameValidation.isValid) {
      errors.push({
        field: 'templateName',
        message: nameValidation.error || 'テンプレート名が無効です',
      });
    }

    // Step-specific validation
    if (currentStep >= 2 && !baseImageData) {
      errors.push({
        field: 'image',
        message: '画像を撮影してください',
      });
    }

    if (currentStep >= 3 && regions.length === 0) {
      errors.push({
        field: 'regions',
        message: '領域を1つ以上選択してください',
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentStep, templateName, baseImageData, regions]);

  // Check if can go to next step
  const canGoNext = useCallback((): boolean => {
    if (currentStep === 1) {
      return baseImageData !== null;
    }
    if (currentStep === 2) {
      return regions.length > 0;
    }
    return false;
  }, [currentStep, baseImageData, regions]);

  // Check if can go to previous step
  const canGoBack = useCallback((): boolean => {
    return currentStep > 1;
  }, [currentStep]);

  // Check if can save
  const canSave = useCallback((): boolean => {
    return (
      currentStep === 3 &&
      templateName.trim() !== '' &&
      baseImageData !== null &&
      regions.length > 0 &&
      !isSaving
    );
  }, [currentStep, templateName, baseImageData, regions, isSaving]);

  // Handle next step
  const handleNext = useCallback(() => {
    if (!canGoNext()) {
      validateCurrentState();
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as EditorStep);
      setValidationErrors([]);
    }
  }, [currentStep, canGoNext, validateCurrentState]);

  // Handle previous step
  const handleBack = useCallback(() => {
    if (canGoBack()) {
      setCurrentStep((prev) => (prev - 1) as EditorStep);
      setValidationErrors([]);
    }
  }, [canGoBack]);

  // Handle image capture
  const handleImageCapture = useCallback((imageData: string) => {
    setBaseImageData(imageData);
    setValidationErrors((prev) => prev.filter((err) => err.field !== 'image'));
  }, []);

  // Handle regions change
  const handleRegionsChange = useCallback((newRegions: Region[]) => {
    setRegions(newRegions);
    setValidationErrors((prev) => prev.filter((err) => err.field !== 'regions'));
  }, []);

  // Handle template name change
  const handleTemplateNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setTemplateName(newName);

    // Real-time validation
    const nameValidation = validateTemplateName(newName);
    if (!nameValidation.isValid) {
      setValidationErrors((prev) => [
        ...prev.filter((err) => err.field !== 'templateName'),
        {
          field: 'templateName',
          message: nameValidation.error || 'テンプレート名が無効です',
        },
      ]);
    } else {
      setValidationErrors((prev) => prev.filter((err) => err.field !== 'templateName'));
    }
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!canSave()) return;

    // Final validation
    if (!validateCurrentState()) return;

    // Check duplicate name (only for create mode)
    if (!templateId) {
      const duplicateName = templates.some(
        (t) => t.name.toLowerCase() === templateName.trim().toLowerCase()
      );
      if (duplicateName) {
        const confirmed = window.confirm(
          `「${templateName}」という名前のテンプレートは既に存在します。上書きしますか？`
        );
        if (!confirmed) return;
      }
    }

    setIsSaving(true);

    try {
      if (templateId) {
        // Update existing template
        await updateTemplate(templateId, {
          name: templateName.trim(),
          baseImageData: baseImageData || '',
          regions,
        });

        // Find updated template
        const updatedTemplate = templates.find((t) => t.id === templateId);
        if (updatedTemplate && onSave) {
          onSave(updatedTemplate);
        }
      } else {
        // Create new template
        const savedTemplate = await createTemplate({
          name: templateName.trim(),
          baseImageData: baseImageData || '',
          regions,
        });

        // Success
        if (onSave) {
          onSave(savedTemplate);
        }
      }
    } catch (error) {
      console.error('Template save error:', error);
      alert('テンプレートの保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  }, [
    canSave,
    validateCurrentState,
    templateId,
    templateName,
    baseImageData,
    regions,
    templates,
    createTemplate,
    updateTemplate,
    onSave,
  ]);

  // Handle cancel
  const handleCancelClick = useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setShowCancelDialog(false);
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const handleCancelDismiss = useCallback(() => {
    setShowCancelDialog(false);
  }, []);

  // Get error message for field
  const getFieldError = useCallback(
    (field: string): string | null => {
      const error = validationErrors.find((err) => err.field === field);
      return error ? error.message : null;
    },
    [validationErrors]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">テンプレートを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // Load error state
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button
            type="button"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onCancel}
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const currentConfig = STEP_CONFIG[currentStep];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {templateId ? 'テンプレート編集' : '新規テンプレート作成'}
        </h1>

        {/* Template name input */}
        <div className="mb-4">
          <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
            テンプレート名
          </label>
          <input
            id="templateName"
            type="text"
            value={templateName}
            onChange={handleTemplateNameChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('templateName') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="テンプレート名を入力（例: 顧客満足度アンケート）"
            maxLength={50}
          />
          {getFieldError('templateName') && (
            <p className="text-red-600 text-sm mt-1">{getFieldError('templateName')}</p>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : step === currentStep
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-24 h-1 ${step < currentStep ? 'bg-green-500' : 'bg-gray-300'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current step title */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">{currentConfig.title}</h2>
          <p className="text-gray-600">{currentConfig.description}</p>
        </div>
      </div>

      {/* Step content */}
      <div className="mb-6">
        {currentStep === 1 && (
          <div>
            <Camera onCapture={handleImageCapture} />
            {getFieldError('image') && (
              <p className="text-red-600 text-sm mt-2">{getFieldError('image')}</p>
            )}
            {baseImageData && (
              <div className="mt-4 text-center">
                <p className="text-green-600 font-medium">✓ 画像が撮影されました</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && baseImageData && (
          <div>
            <RegionSelector
              imageData={baseImageData}
              regions={regions}
              onRegionsChange={handleRegionsChange}
            />
            {getFieldError('regions') && (
              <p className="text-red-600 text-sm mt-2">{getFieldError('regions')}</p>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">確認</h3>

            <div className="space-y-4">
              {/* Template name */}
              <div>
                <p className="text-sm text-gray-600">テンプレート名</p>
                <p className="font-medium">{templateName}</p>
              </div>

              {/* Base image thumbnail */}
              <div>
                <p className="text-sm text-gray-600 mb-2">ベース画像</p>
                <img
                  src={baseImageData || ''}
                  alt="ベース画像"
                  className="max-w-md border-2 border-gray-300 rounded"
                />
              </div>

              {/* Regions list */}
              <div>
                <p className="text-sm text-gray-600 mb-2">OCR領域 ({regions.length}個)</p>
                <ul className="space-y-2">
                  {regions.map((region) => (
                    <li key={region.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="font-semibold text-sm w-6">{region.order}.</span>
                      <span className="flex-1">{region.name}</span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(region.coordinates.x * 100)}%,{' '}
                        {Math.round(region.coordinates.y * 100)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCancelClick}
        >
          キャンセル
        </button>

        <div className="flex gap-4">
          <button
            type="button"
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleBack}
            disabled={!canGoBack()}
          >
            戻る
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNext}
              disabled={!canGoNext()}
            >
              次へ
            </button>
          ) : (
            <button
              type="button"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleSave}
              disabled={!canSave()}
            >
              {isSaving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isSaving ? '保存中...' : '保存'}
            </button>
          )}
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">編集を中止しますか？</h3>
            <p className="text-gray-600 mb-6">入力した内容は保存されません。よろしいですか？</p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={handleCancelDismiss}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleCancelConfirm}
              >
                中止する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
