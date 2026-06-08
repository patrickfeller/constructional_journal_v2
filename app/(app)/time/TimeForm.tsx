"use client";

import { useTransition } from "react";
import { createManualTime } from "./actions";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  name: string;
}

interface Person {
  id: string;
  name: string;
}

interface TimeFormProps {
  projects: Project[];
  people: Person[];
  today: string;
  lastUsedEntry?: {
    projectId: string;
    personId: string | null;
  } | null;
}

export function TimeForm({ projects, people, today, lastUsedEntry }: TimeFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createManualTime(formData);
    });
  };

  return (
    <form action={handleSubmit} className="grid sm:grid-cols-3 gap-2 items-end">
      <select 
        name="projectId" 
        aria-label="Project" 
        defaultValue={lastUsedEntry?.projectId || ""} 
        className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        required
        disabled={isPending}
      >
        <option value="">Select project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      
      <select 
        name="personId" 
        aria-label="Person" 
        defaultValue={lastUsedEntry?.personId || ""} 
        className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        disabled={isPending}
      >
        <option value="">No person</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      
      <input 
        type="date" 
        name="date" 
        aria-label="Date" 
        defaultValue={today} 
        className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" 
        required 
        disabled={isPending}
      />
      
      <div className="grid grid-cols-3 gap-2">
        <input 
          type="time" 
          name="start" 
          aria-label="Start time" 
          className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" 
          required 
          disabled={isPending}
        />
        <input 
          type="time" 
          name="end" 
          aria-label="End time" 
          className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" 
          required 
          disabled={isPending}
        />
        <input 
          type="number" 
          name="breakMinutes" 
          min={0} 
          aria-label="Break minutes" 
          className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" 
          placeholder="Break (mins)" 
          disabled={isPending}
        />
      </div>
      
      <input 
        name="notes" 
        placeholder="Notes (optional)" 
        className="border border-[var(--line)] rounded-md px-3 py-2 sm:col-span-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" 
        disabled={isPending}
      />
      
      <Button 
        type="submit"
        loading={isPending}
        loadingText="Saving..."
        className="px-4 py-2"
      >
        Save
      </Button>
    </form>
  );
}
