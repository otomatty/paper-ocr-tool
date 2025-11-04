/**
 * TemplateList Component - Minimal Design
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/pages/TemplateManagementPage.tsx
 *   └─ src/components/TemplateManagement/TemplateEditor.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ lucide-react
 *   ├─ ../../hooks/useTemplate.ts
 *   ├─ ../../types/template.ts
 *   ├─ ../common/Button/Button.tsx
 *   ├─ ../common/Card/Card.tsx
 *   └─ ../common/Badge/Badge.tsx
 *
 * Related Documentation:
 *   ├─ Spec: ./TemplateList.spec.md
 *   ├─ Tests: ./TemplateList.test.tsx
 *   └─ Plan: docs/03_plans/template-management/20241102_02_template-list-implementation.md
 */

import { AlertCircle, Edit2, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTemplate } from "../../hooks/useTemplate";
import type { Template } from "../../types/template";
import { Badge } from "../common/Badge/Badge";
import { Button } from "../common/Button/Button";
import { Card } from "../common/Card/Card";
import { Spinner } from "../common/Spinner/Spinner";

interface TemplateListProps {
  /**
   * テンプレート選択時のコールバック
   * showSelection が true の場合に使用される
   */
  onSelectTemplate?: (templateId: string) => void;

  /**
   * 選択ボタンを表示するかどうか
   * @default false
   */
  showSelection?: boolean;

  /**
   * 新規作成ボタンクリック時のコールバック
   */
  onCreateNew?: () => void;

  /**
   * 編集ボタンクリック時のコールバック
   */
  onEdit?: (templateId: string) => void;
}

interface DeleteConfirmState {
  open: boolean;
  targetId: string | null;
  targetName: string | null;
}

/**
 * TemplateList Component
 *
 * テンプレート一覧を表示し、削除・選択・編集機能を提供するコンポーネント
 *
 * @param onSelectTemplate - テンプレート選択時のコールバック
 * @param showSelection - 選択ボタンを表示するかどうか
 * @param onCreateNew - 新規作成ボタンクリック時のコールバック
 * @param onEdit - 編集ボタンクリック時のコールバック
 */
export const TemplateList: React.FC<TemplateListProps> = ({
  onSelectTemplate,
  showSelection = false,
  onCreateNew,
  onEdit,
}) => {
  const { templates, loading, error, deleteTemplate } = useTemplate();
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    targetId: null,
    targetName: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handle delete button click
  const handleDeleteClick = (template: Template) => {
    setDeleteConfirm({
      open: true,
      targetId: template.id,
      targetName: template.name,
    });
    setDeleteError(null);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.targetId) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteTemplate(deleteConfirm.targetId);
      setDeleteConfirm({ open: false, targetId: null, targetName: null });
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "テンプレートの削除に失敗しました"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, targetId: null, targetName: null });
    setDeleteError(null);
  };

  // Handle template selection
  const handleSelect = (templateId: string) => {
    if (onSelectTemplate) {
      onSelectTemplate(templateId);
    }
  };

  // Handle navigation to create new template
  const handleGoToCreate = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      // Fallback for backward compatibility
      console.log("Navigate to create template");
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    // Force re-render by reloading the page or re-fetching data
    window.location.reload();
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="large" label="読み込み中..." />
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full">
        <Card className="max-w-md mx-auto">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="p-3 bg-red-50 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                エラーが発生しました
              </h3>
              <p className="text-neutral-600">{error}</p>
            </div>
            <Button
              onClick={handleRetry}
              variant="primary"
              icon={<AlertCircle className="w-4 h-4" />}
            >
              再試行
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render empty state
  if (templates.length === 0) {
    return (
      <div className="w-full">
        <Card className="max-w-md mx-auto">
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="p-4 bg-neutral-100 rounded-full">
              <FileText className="w-12 h-12 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                テンプレートがありません
              </h3>
              <p className="text-neutral-600">
                まずはテンプレートを作成しましょう
              </p>
            </div>
            <Button
              onClick={handleGoToCreate}
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
            >
              新規作成
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render template list
  return (
    <div className="w-full">
      {/* Header with create button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            保存済みテンプレート
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="neutral" size="small">
              {templates.length}件
            </Badge>
            <p className="text-sm text-neutral-600">のテンプレート</p>
          </div>
        </div>
        {onCreateNew && (
          <Button
            onClick={handleGoToCreate}
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
          >
            新規作成
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} hoverable className="flex flex-col">
            {/* Thumbnail */}
            <div className="w-full h-[180px] -mx-6 -mt-5 mb-4 overflow-hidden bg-neutral-100 rounded-t-lg">
              {template.baseImageData ? (
                <img
                  src={template.baseImageData}
                  alt={`${template.name}のサムネイル`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col justify-center items-center w-full h-full text-neutral-400">
                  <FileText className="w-12 h-12 mb-2" />
                  <span className="text-sm">画像なし</span>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="flex-1 mb-4">
              <h3
                className="text-lg font-semibold text-neutral-900 mb-2 overflow-hidden text-ellipsis whitespace-nowrap"
                title={template.name}
              >
                {template.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Badge variant="neutral" size="small">
                  {template.regions?.length || 0} 領域
                </Badge>
                <span>•</span>
                <time dateTime={new Date(template.createdAt).toISOString()}>
                  {formatDate(template.createdAt)}
                </time>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-neutral-100">
              {showSelection && (
                <Button
                  onClick={() => handleSelect(template.id)}
                  variant="primary"
                  size="small"
                  ariaLabel={`${template.name}を選択`}
                  className="flex-1"
                >
                  選択
                </Button>
              )}
              {onEdit && (
                <Button
                  onClick={() => onEdit(template.id)}
                  variant="secondary"
                  size="small"
                  ariaLabel={`${template.name}を編集`}
                  icon={<Edit2 className="w-4 h-4" />}
                  className="flex-1"
                >
                  編集
                </Button>
              )}
              <Button
                onClick={() => handleDeleteClick(template)}
                variant="ghost"
                size="small"
                ariaLabel={`${template.name}を削除`}
                icon={<Trash2 className="w-4 h-4" />}
                className="text-red-600 hover:bg-red-50"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog - Minimal Design */}
      {deleteConfirm.open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1000] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <Card className="max-w-md w-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2
                  id="delete-dialog-title"
                  className="text-lg font-semibold text-neutral-900 mb-2"
                >
                  テンプレートの削除
                </h2>
                <p className="text-neutral-600 leading-relaxed">
                  「
                  <span className="font-medium text-neutral-900">
                    {deleteConfirm.targetName}
                  </span>
                  」を削除してもよろしいですか？ この操作は取り消せません。
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                onClick={handleDeleteCancel}
                variant="secondary"
                disabled={deleting}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                variant="danger"
                disabled={deleting}
                icon={deleting ? undefined : <Trash2 className="w-4 h-4" />}
              >
                {deleting ? "削除中..." : "削除"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
