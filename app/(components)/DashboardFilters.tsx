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
  selected: { projectId?: string; personId?: string; companyId?: string; timeline?: string };
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

  function exportCSV() {
    const params = new URLSearchParams();
    if (selected.projectId) params.set('projectId', selected.projectId);
    if (selected.personId) params.set('personId', selected.personId);
    if (selected.companyId) params.set('companyId', selected.companyId);
    if (selected.timeline) params.set('timeline', selected.timeline);
    
    const url = `/api/export/time-entries?${params.toString()}`;
    window.open(url, '_blank');
  }

  const selectClass = "border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  return (
    <div className="mb-4 space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        <select aria-label="Filter by project" className={selectClass}
          value={selected.projectId ?? ""} onChange={(e) => updateParam("projectId", e.target.value)}>
          <option value="">All projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select aria-label="Filter by person" className={selectClass}
          value={selected.personId ?? ""} onChange={(e) => updateParam("personId", e.target.value)}>
          <option value="">All people</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select aria-label="Filter by company" className={selectClass}
          value={selected.companyId ?? ""} onChange={(e) => updateParam("companyId", e.target.value)}>
          <option value="">All companies</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="button" onClick={clearAll}
          className="rounded-md border border-[var(--line)] bg-[var(--surface-2)] hover:bg-[var(--line)] text-[var(--ink-2)] px-4 py-2 transition-colors">
          Clear filters
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <select aria-label="Select timeline" className={selectClass}
          value={selected.timeline ?? "30"} onChange={(e) => updateParam("timeline", e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 1 year</option>
          <option value="all">All time</option>
        </select>
        <button type="button" onClick={exportCSV}
          className="rounded-md bg-[var(--accent)] hover:opacity-90 text-[var(--on-accent)] font-semibold px-4 py-2 transition-opacity">
          Export CSV
        </button>
      </div>
    </div>
  );
}


