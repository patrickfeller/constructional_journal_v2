"use client";

import { useTransition } from "react";
import { createCompany } from "./actions";
import { Button } from "@/components/ui/button";

export function CompanyForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createCompany(formData);
    });
  };

  return (
    <form action={handleSubmit} className="grid sm:grid-cols-3 gap-2 items-end">
      <input 
        name="name" 
        aria-label="Name" 
        placeholder="Name" 
        className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        required 
        disabled={isPending}
      />
      
      <input 
        name="hourlyRateDefault" 
        aria-label="Default hourly rate" 
        placeholder="Hourly rate (optional)" 
        type="number"
        step="0.01"
        min="0"
        className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        disabled={isPending}
      />

      <Button
        type="submit"
        loading={isPending}
        loadingText="Saving..."
        className="rounded-md px-4 py-2"
      >
        Save
      </Button>
    </form>
  );
}
