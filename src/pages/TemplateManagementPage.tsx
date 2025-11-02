/**
 * Template Management Page
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   └─ src/App.tsx
 *
 * Dependencies (External files that this file imports):
 *   ├─ src/components/common/Layout/Layout.tsx
 *   ├─ src/components/TemplateManagement/TemplateList.tsx
 *   └─ src/components/TemplateManagement/TemplateEditor.tsx
 *
 * Related Documentation:
 *   ├─ Spec: ./TemplateManagementPage.spec.md
 *   ├─ Issue: docs/01_issues/open/2024_11/20241102_03_template-management.md
 *   └─ Plan: docs/03_plans/template-management/20241103_01_next-implementation-plan.md
 */

import { useState } from 'react';
import { Layout } from '../components/common/Layout/Layout';
import { TemplateEditor } from '../components/TemplateManagement/TemplateEditor';
import { TemplateList } from '../components/TemplateManagement/TemplateList';

type DisplayMode = 'list' | 'create' | 'edit';

export const TemplateManagementPage = () => {
  const [mode, setMode] = useState<DisplayMode>('list');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const handleCreateNew = () => {
    setMode('create');
    setEditingTemplateId(null);
  };

  const handleEdit = (templateId: string) => {
    setMode('edit');
    setEditingTemplateId(templateId);
  };

  const handleBackToList = () => {
    setMode('list');
    setEditingTemplateId(null);
  };

  const handleSaveComplete = () => {
    handleBackToList();
  };

  const handleCancel = () => {
    handleBackToList();
  };

  return (
    <Layout title="テンプレート管理">
      {mode === 'list' && <TemplateList onCreateNew={handleCreateNew} onEdit={handleEdit} />}

      {(mode === 'create' || mode === 'edit') && (
        <TemplateEditor
          templateId={editingTemplateId ?? undefined}
          onSave={handleSaveComplete}
          onCancel={handleCancel}
        />
      )}
    </Layout>
  );
};
