"use client";

import { useState, useTransition } from "react";
import { deleteExpense } from "./actions";
import { Dialog, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteExpenseButtonProps {
  expenseId: string;
  description: string;
  amount: number;
}

export function DeleteExpenseButton({ expenseId, description, amount }: DeleteExpenseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const formData = new FormData();
    formData.set("id", expenseId);

    startTransition(async () => {
      await deleteExpense(formData);
      setIsOpen(false);
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 rounded-md transition-colors"
        aria-label="Delete expense"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogHeader>
          <DialogTitle>Delete Expense</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this expense?
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 space-y-1">
              <p className="font-medium">{description}</p>
              <p className="text-sm text-muted-foreground">€{amount.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                loading={isPending}
                loadingText="Deleting..."
                className="flex-1 rounded-md bg-red-600 hover:bg-red-700 text-white px-4 py-2"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}

