"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Item = { id: string; name: string };

export function DashboardFilters({
  projects,
  people,
  companies,
  selected,
}: {
  projects: Item[];
  people: Item[];
  companies: Item[];
  selected: { projectId?: string; personId?: string; companyId?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function updateParam(name: string, value: string) {
    const newParams = new URLSearchParams(params?.toString());
    if (!value) newParams.delete(name);
    else newParams.set(name, value);
    router.replace(`${pathname}?${newParams.toString()}`);
  }

  function clearAll() {
    router.replace(pathname);
  }

  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-4">
      <select
        aria-label="Filter by project"
        className="border rounded-md px-3 py-2 bg-background text-foreground"
        value={selected.projectId ?? ""}
        onChange={(e) => updateParam("projectId", e.target.value)}
      >
        <option value="">All projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by person"
        className="border rounded-md px-3 py-2 bg-background text-foreground"
        value={selected.personId ?? ""}
        onChange={(e) => updateParam("personId", e.target.value)}
      >
        <option value="">All people</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by company"
        className="border rounded-md px-3 py-2 bg-background text-foreground"
        value={selected.companyId ?? ""}
        onChange={(e) => updateParam("companyId", e.target.value)}
      >
        <option value="">All companies</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
        onClick={clearAll}
      >
        Clear
      </button>
    </div>
  );
}


