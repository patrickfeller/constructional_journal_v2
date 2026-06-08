"use client";

import { useTransition } from "react";
import { createProject } from "./actions";
import { Button } from "@/components/ui/button";

export function ProjectForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createProject(formData);
    });
  };

  return (
    <form action={handleSubmit} className="grid gap-3">
      <div className="grid sm:grid-cols-2 gap-2">
        <input
          name="name"
          placeholder="Project name"
          className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          required
          disabled={isPending}
        />
        <div className="space-y-1">
          <input
            name="address"
            placeholder="Full address"
            className="border border-[var(--line)] rounded-md px-3 py-2 w-full bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            required
            disabled={isPending}
          />
          <p className="text-xs text-[var(--ink-2)]">
            Include street, city, country (e.g., &quot;123 Main St, Vienna, Austria&quot;)
          </p>
        </div>
      </div>
      <Button
        type="submit"
        loading={isPending}
        loadingText="Adding project..."
        className="rounded-md px-4 py-2 w-fit"
      >
        Add Project
      </Button>
    </form>
  );
}
