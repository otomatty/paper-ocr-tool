/**
 * TemplateList Component
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/pages/TemplateManagementPage.tsx
 *   └─ src/components/TemplateManagement/TemplateEditor.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ react
 *   ├─ ../../hooks/useTemplate.ts
 *   ├─ ../../types/template.ts
 *   └─ ../common/Button/Button.tsx
 *
 * Related Documentation:
 *   ├─ Spec: ./TemplateList.spec.md
 *   ├─ Tests: ./TemplateList.test.tsx
 *   └─ Plan: docs/03_plans/template-management/20241102_02_template-list-implementation.md
 */

import { useState } from 'react';
import { useTemplate } from '../../hooks/useTemplate';
import type { Template } from '../../types/template';
import { Button } from '../common/Button/Button';

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
      setDeleteError(err instanceof Error ? err.message : 'テンプレートの削除に失敗しました');
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
      console.log('Navigate to create template');
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
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Render loading state
  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="flex justify-center items-center min-h-[200px] text-lg text-gray-600">
          読み込み中...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="w-full p-4">
        <div className="flex flex-col justify-center items-center gap-4 min-h-[200px] p-8 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={handleRetry} variant="primary">
            再試行
          </Button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (templates.length === 0) {
    return (
      <div className="w-full p-4">
        <div className="flex flex-col justify-center items-center gap-4 min-h-[200px] p-8 text-center">
          <p className="text-gray-600 text-lg">テンプレートがありません</p>
          <Button onClick={handleGoToCreate} variant="primary">
            新規作成
          </Button>
        </div>
      </div>
    );
  }

  // Render template list
  return (
    <div className="w-full p-4">
      {/* Header with create button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">保存済みテンプレート</h2>
          <p className="text-gray-600 mt-1">{templates.length}件のテンプレート</p>
        </div>
        {onCreateNew && (
          <Button onClick={handleGoToCreate} variant="primary">
            ＋ 新規作成
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex flex-col border border-gray-200 rounded-lg p-4 bg-white transition-shadow hover:shadow-lg"
          >
            {/* Thumbnail */}
            <div className="w-full h-[150px] mb-3 rounded overflow-hidden bg-gray-100">
              {template.baseImageData ? (
                <img
                  src={template.baseImageData}
                  alt={`${template.name}のサムネイル`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex justify-center items-center w-full h-full text-gray-400 text-sm">
                  画像なし
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="flex-1 mb-3">
              <h3
                className="text-base font-semibold text-gray-900 mb-2 overflow-hidden text-ellipsis whitespace-nowrap"
                title={template.name}
              >
                {template.name}
              </h3>
              <p className="text-sm text-gray-600">作成日: {formatDate(template.createdAt)}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              {showSelection && (
                <Button
                  onClick={() => handleSelect(template.id)}
                  variant="primary"
                  size="small"
                  ariaLabel={`${template.name}を選択`}
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
                >
                  編集
                </Button>
              )}
              <Button
                onClick={() => handleDeleteClick(template)}
                variant="danger"
                size="small"
                ariaLabel={`${template.name}を削除`}
              >
                削除
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-[90%] shadow-2xl">
            <h2 id="delete-dialog-title" className="text-xl font-semibold text-gray-900 mb-4">
              テンプレートの削除
            </h2>
            <p className="text-base text-gray-700 mb-6 leading-relaxed">
              「{deleteConfirm.targetName}」を削除してもよろしいですか？
            </p>
            {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}
            <div className="flex gap-3 justify-end">
              <Button onClick={handleDeleteCancel} variant="secondary" disabled={deleting}>
                キャンセル
              </Button>
              <Button onClick={handleDeleteConfirm} variant="danger" disabled={deleting}>
                {deleting ? '削除中...' : '削除'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
