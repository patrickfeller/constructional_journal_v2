"use client";

import { useTransition } from "react";
import { deleteJournalEntry } from "./actions";
import { Button } from "@/components/ui/button";

interface DeleteEntryButtonProps {
  entryId: string;
  entryTitle: string;
}

export function DeleteEntryButton({ entryId, entryTitle }: DeleteEntryButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the journal entry "${entryTitle}"? This will also delete all associated photos.`)) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("id", entryId);
        await deleteJournalEntry(formData);
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
