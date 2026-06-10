"use client";

import { useTransition } from "react";
import { createPerson } from "./actions";
import { Button } from "@/components/ui/button";

interface Company {
  id: string;
  name: string;
}

interface PersonFormProps {
  companies: Company[];
}

export function PersonForm({ companies }: PersonFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createPerson(formData);
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
      
      <select 
        name="companyId" 
        aria-label="Company" 
        className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        disabled={isPending}
      >
        <option value="">No company</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      
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
