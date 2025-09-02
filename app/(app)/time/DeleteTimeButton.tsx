"use client";

import { useTransition } from "react";
import { deleteTimeEntry } from "./actions";
import { Button } from "@/components/ui/button";

interface DeleteTimeButtonProps {
  entryId: string;
  projectName: string;
  duration: number;
}

export function DeleteTimeButton({ entryId, projectName, duration }: DeleteTimeButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the time entry for "${projectName}" (${duration} mins)?`)) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("id", entryId);
        await deleteTimeEntry(formData);
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
