"use client";

import { useTransition } from "react";
import { deleteProject } from "./actions";
import { Button } from "@/components/ui/button";

interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
}

export function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${projectName}"? This will also delete all associated journal entries, time entries, and photos.`)) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("id", projectId);
        await deleteProject(formData);
      });
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      loading={isPending}
      loadingText="Deleting..."
      disabled={isPending}
    >
      Delete
    </Button>
  );
}
