"use client";

import { useState } from "react";
import { createPersonalCompany } from "./actions";

export function PersonalCompanyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Store form reference before async operation
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      
      const result = await createPersonalCompany(formData);
      
      if (result.success) {
        // Reset form
        form.reset();
      } else {
        alert(result.error || "Failed to create company");
      }
    } catch (error) {
      console.error("Failed to create personal company:", error);
      alert("Failed to create company");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Company Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter company name"
        />
      </div>

      <div>
        <label htmlFor="hourlyRateDefault" className="block text-sm font-medium mb-1">
          Default Hourly Rate
        </label>
        <input
          type="number"
          id="hourlyRateDefault"
          name="hourlyRateDefault"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="0.00"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Company address"
        />
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
          placeholder="Optional notes about this company"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Adding..." : "Add Company"}
      </button>
    </form>
  );
}
