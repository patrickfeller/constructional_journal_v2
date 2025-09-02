"use client";

import { useTransition } from "react";
import { deleteCompany } from "./actions";
import { Button } from "@/components/ui/button";

interface DeleteCompanyButtonProps {
  companyId: string;
  companyName: string;
  peopleCount: number;
}

export function DeleteCompanyButton({ companyId, companyName, peopleCount }: DeleteCompanyButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const message = peopleCount > 0 
      ? `Are you sure you want to delete "${companyName}"? ${peopleCount} people will be unlinked from this company.`
      : `Are you sure you want to delete "${companyName}"?`;
      
    if (confirm(message)) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("id", companyId);
        await deleteCompany(formData);
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
