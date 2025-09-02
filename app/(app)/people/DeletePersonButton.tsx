"use client";

import { useTransition } from "react";
import { deletePerson } from "./actions";
import { Button } from "@/components/ui/button";

interface DeletePersonButtonProps {
  personId: string;
  personName: string;
}

export function DeletePersonButton({ personId, personName }: DeletePersonButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${personName}"? Any associated time entries will be unlinked from this person.`)) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("id", personId);
        await deletePerson(formData);
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
