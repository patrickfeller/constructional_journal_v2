"use client";

interface PersonalPerson {
  id: string;
  name: string;
  hourlyRate: number | null;
  defaultCompany?: {
    id: string;
    name: string;
  } | null;
  notes?: string | null;
}

interface PersonalCompany {
  id: string;
  name: string;
  hourlyRateDefault: number | null;
}

interface PersonalPersonEditFormProps {
  person: PersonalPerson;
  companies: PersonalCompany[];
}

export function PersonalPersonEditForm({ person, companies }: PersonalPersonEditFormProps) {
  // TODO: Implement edit functionality
  return (
    <button className="text-sm text-blue-600 hover:underline">
      Edit
    </button>
  );
}
