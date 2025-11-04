/**
 * TemplateEditor Component - Minimal Design
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/pages/TemplateManagementPage.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ lucide-react
 *   ├─ src/components/Camera/Camera.tsx
 *   ├─ src/components/TemplateManagement/RegionSelector.tsx
 *   ├─ src/components/common/Button/Button.tsx
 *   ├─ src/components/common/Card/Card.tsx
 *   ├─ src/components/common/Badge/Badge.tsx
 *   ├─ src/hooks/useTemplate.ts
 *   ├─ src/types/template.ts
 *   └─ src/utils/validation.ts
 *
 * Related Documentation:
 *   ├─ Spec: ./TemplateEditor.spec.md
 *   ├─ Tests: ./TemplateEditor.test.tsx
 *   └─ Plan: docs/03_plans/template-management/20241103_01_next-implementation-plan.md
 */

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera as CameraIcon,
  Check,
  Save,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTemplate } from "../../hooks/useTemplate";
import type { Region, Template } from "../../types/template";
import { validateTemplateName } from "../../utils/validation";
import { Badge } from "../common/Badge/Badge";
import { Button } from "../common/Button/Button";
import { Card } from "../common/Card/Card";
import { Spinner } from "../common/Spinner/Spinner";
import { Camera } from "../Camera/Camera";
import { RegionSelector } from "./RegionSelector";

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
    title: "ベース画像撮影",
    description: "空のアンケート用紙を撮影してください",
  },
  2: {
    step: 2,
    title: "OCR領域選択",
    description: "抽出したい領域をドラッグで選択してください",
  },
  3: {
    step: 3,
    title: "確認・保存",
    description: "内容を確認して保存してください",
  },
};

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  templateId,
  onSave,
  onCancel,
}) => {
  const { templates, createTemplate, updateTemplate } = useTemplate();

  // Editor state
  const [currentStep, setCurrentStep] = useState<EditorStep>(1);
  const [templateName, setTemplateName] = useState("");
  const [baseImageData, setBaseImageData] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
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
        setLoadError("テンプレートが見つかりません");
        return;
      }

      setTemplateName(template.name);
      setBaseImageData(template.baseImageData || null);
      setRegions(template.regions);
    } catch (error) {
      setLoadError("テンプレートの読み込みに失敗しました");
      console.error("Template load error:", error);
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
        field: "templateName",
        message: nameValidation.error || "テンプレート名が無効です",
      });
    }

    // Step-specific validation
    if (currentStep >= 2 && !baseImageData) {
      errors.push({
        field: "image",
        message: "画像を撮影してください",
      });
    }

    if (currentStep >= 3 && regions.length === 0) {
      errors.push({
        field: "regions",
        message: "領域を1つ以上選択してください",
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
      templateName.trim() !== "" &&
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
    setValidationErrors((prev) => prev.filter((err) => err.field !== "image"));
  }, []);

  // Handle regions change
  const handleRegionsChange = useCallback((newRegions: Region[]) => {
    setRegions(newRegions);
    setValidationErrors((prev) =>
      prev.filter((err) => err.field !== "regions")
    );
  }, []);

  // Handle template name change
  const handleTemplateNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setTemplateName(newName);

      // Real-time validation
      const nameValidation = validateTemplateName(newName);
      if (!nameValidation.isValid) {
        setValidationErrors((prev) => [
          ...prev.filter((err) => err.field !== "templateName"),
          {
            field: "templateName",
            message: nameValidation.error || "テンプレート名が無効です",
          },
        ]);
      } else {
        setValidationErrors((prev) =>
          prev.filter((err) => err.field !== "templateName")
        );
      }
    },
    []
  );

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
          baseImageData: baseImageData || "",
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
          baseImageData: baseImageData || "",
          regions,
        });

        // Success
        if (onSave) {
          onSave(savedTemplate);
        }
      }
    } catch (error) {
      console.error("Template save error:", error);
      alert("テンプレートの保存に失敗しました。もう一度お試しください。");
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" label="テンプレートを読み込んでいます..." />
      </div>
    );
  }

  // Load error state
  if (loadError) {
    return (
      <Card className="max-w-md mx-auto">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="p-3 bg-red-50 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              読み込みエラー
            </h3>
            <p className="text-neutral-600">{loadError}</p>
          </div>
          <Button onClick={onCancel} variant="primary">
            戻る
          </Button>
        </div>
      </Card>
    );
  }

  const currentConfig = STEP_CONFIG[currentStep];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              {templateId ? "テンプレート編集" : "新規テンプレート作成"}
            </h1>
            <p className="text-neutral-600 mt-1">
              {templateId
                ? "テンプレートを編集します"
                : "アンケート用紙のテンプレートを作成します"}
            </p>
          </div>
          <Badge variant="info">ステップ {currentStep}/3</Badge>
        </div>

        {/* Template name input */}
        <div className="mb-6">
          <label
            htmlFor="templateName"
            className="block text-sm font-medium text-neutral-900 mb-2"
          >
            テンプレート名
          </label>
          <input
            id="templateName"
            type="text"
            value={templateName}
            onChange={handleTemplateNameChange}
            className={`w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 ${
              getFieldError("templateName")
                ? "border-red-300 focus:ring-red-400"
                : "border-neutral-300 hover:border-neutral-400"
            }`}
            placeholder="テンプレート名を入力（例: 顧客満足度アンケート）"
            maxLength={50}
          />
          {getFieldError("templateName") && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{getFieldError("templateName")}</span>
            </div>
          )}
        </div>

        {/* Step indicator - Minimal design */}
        <div className="flex items-center justify-between gap-2 mb-6">
          {[1, 2, 3].map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm transition-all ${
                    step < currentStep
                      ? "bg-neutral-900 text-white"
                      : step === currentStep
                      ? "bg-neutral-900 text-white ring-4 ring-neutral-200"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className="flex-1 h-0.5 bg-neutral-200 relative overflow-hidden">
                    <div
                      className={`absolute inset-0 transition-all duration-300 ${
                        step < currentStep
                          ? "bg-neutral-900 w-full"
                          : "bg-transparent w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Current step title */}
        <div className="text-center py-4 bg-neutral-50 rounded-lg">
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">
            {currentConfig.title}
          </h2>
          <p className="text-sm text-neutral-600">
            {currentConfig.description}
          </p>
        </div>
      </Card>

      {/* Step content */}
      <Card className="mb-6">
        {currentStep === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-200">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <CameraIcon className="w-5 h-5 text-neutral-700" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">
                  ベース画像撮影
                </h3>
                <p className="text-sm text-neutral-600">
                  空のアンケート用紙を撮影してください
                </p>
              </div>
            </div>

            <Camera onCapture={handleImageCapture} />

            {getFieldError("image") && (
              <div className="flex items-center gap-2 mt-4 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{getFieldError("image")}</span>
              </div>
            )}

            {baseImageData && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-800 font-medium">
                  画像が撮影されました
                </span>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && baseImageData && (
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-200">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <CameraIcon className="w-5 h-5 text-neutral-700" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">OCR領域選択</h3>
                <p className="text-sm text-neutral-600">
                  抽出したい領域をドラッグで選択してください
                </p>
              </div>
            </div>

            <RegionSelector
              imageData={baseImageData}
              regions={regions}
              onRegionsChange={handleRegionsChange}
            />

            {getFieldError("regions") && (
              <div className="flex items-center gap-2 mt-4 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{getFieldError("regions")}</span>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-200">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <Check className="w-5 h-5 text-neutral-700" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">確認・保存</h3>
                <p className="text-sm text-neutral-600">
                  内容を確認して保存してください
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Template name */}
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-2">
                  テンプレート名
                </p>
                <p className="text-lg font-semibold text-neutral-900">
                  {templateName}
                </p>
              </div>

              {/* Base image thumbnail */}
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-3">
                  ベース画像
                </p>
                <img
                  src={baseImageData || ""}
                  alt="ベース画像"
                  className="max-w-md w-full border border-neutral-200 rounded-lg shadow-sm"
                />
              </div>

              {/* Regions list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-neutral-600">
                    OCR領域
                  </p>
                  <Badge variant="neutral">{regions.length}個</Badge>
                </div>
                <div className="space-y-2">
                  {regions.map((region) => (
                    <div
                      key={region.id}
                      className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
                    >
                      <Badge size="small" variant="neutral">
                        {region.order}
                      </Badge>
                      <span className="flex-1 font-medium text-neutral-900">
                        {region.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        ({Math.round(region.coordinates.x * 100)}%,{" "}
                        {Math.round(region.coordinates.y * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleCancelClick}
          icon={<X className="w-5 h-5" />}
        >
          キャンセル
        </Button>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={!canGoBack()}
            icon={<ArrowLeft className="w-5 h-5" />}
          >
            戻る
          </Button>

          {currentStep < 3 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canGoNext()}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              次へ
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!canSave()}
              icon={isSaving ? undefined : <Save className="w-5 h-5" />}
            >
              {isSaving ? "保存中..." : "保存"}
            </Button>
          )}
        </div>
      </div>

      {/* Cancel confirmation dialog - Minimal Design */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-amber-50 rounded-lg flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  編集を中止しますか？
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  入力した内容は保存されません。よろしいですか？
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={handleCancelDismiss}>
                戻る
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelConfirm}
                icon={<X className="w-4 h-4" />}
              >
                中止する
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
