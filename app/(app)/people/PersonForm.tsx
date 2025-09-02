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
        className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" 
        required 
        disabled={isPending}
      />
      
      <select 
        name="companyId" 
        aria-label="Company" 
        className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
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
        className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
      >
        Save
      </Button>
    </form>
  );
}
