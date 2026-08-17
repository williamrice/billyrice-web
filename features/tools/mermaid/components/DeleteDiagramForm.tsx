"use client";

import { Trash2 } from "lucide-react";
import { AdminActionForm } from "@/components/admin/AdminActionForm";

export function DeleteDiagramForm({
  id,
  title,
  action,
}: {
  id: string;
  title: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <AdminActionForm
      action={action}
      successMessage="Diagram deleted."
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${title}” and its complete revision history?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-red-700 hover:text-red-900">
        <Trash2 className="size-3.5" /> Delete
      </button>
    </AdminActionForm>
  );
}
