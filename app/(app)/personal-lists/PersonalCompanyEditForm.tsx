"use client";

interface PersonalCompany {
  id: string;
  name: string;
  hourlyRateDefault: number | null;
  address?: string | null;
  notes?: string | null;
}

interface PersonalCompanyEditFormProps {
  company: PersonalCompany;
}

export function PersonalCompanyEditForm({ company }: PersonalCompanyEditFormProps) {
  // TODO: Implement edit functionality
  return (
    <button className="text-sm text-[var(--accent-deep)] hover:underline">
      Edit
    </button>
  );
}
