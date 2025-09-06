"use client";

import { useState } from "react";
import { createPersonalPerson } from "./actions";

interface PersonalCompany {
  id: string;
  name: string;
  hourlyRateDefault: number | null;
}

interface PersonalPersonFormProps {
  companies: PersonalCompany[];
}

export function PersonalPersonForm({ companies }: PersonalPersonFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Store form reference before async operation
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      
      const result = await createPersonalPerson(formData);
      
      if (result.success) {
        // Reset form
        form.reset();
      } else {
        alert(result.error || "Failed to create person");
      }
    } catch (error) {
      console.error("Failed to create personal person:", error);
      alert("Failed to create person");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter person's name"
        />
      </div>

      <div>
        <label htmlFor="hourlyRate" className="block text-sm font-medium mb-1">
          Hourly Rate
        </label>
        <input
          type="number"
          id="hourlyRate"
          name="hourlyRate"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="0.00"
        />
      </div>

      <div>
        <label htmlFor="defaultCompanyId" className="block text-sm font-medium mb-1">
          Default Company
        </label>
        <select
          id="defaultCompanyId"
          name="defaultCompanyId"
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">No company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Optional notes about this person"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Adding..." : "Add Person"}
      </button>
    </form>
  );
}
