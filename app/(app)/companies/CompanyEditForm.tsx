"use client";

import { useState } from "react";
import { updateCompany } from "./actions";

interface Company {
  id: string;
  name: string;
  hourlyRateDefault: number | null;
}

interface CompanyEditFormProps {
  company: Company;
}

export function CompanyEditForm({ company }: CompanyEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name,
    hourlyRateDefault: company.hourlyRateDefault?.toString() || ""
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: company.name,
      hourlyRateDefault: company.hourlyRateDefault?.toString() || ""
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: company.name,
      hourlyRateDefault: company.hourlyRateDefault?.toString() || ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append("id", company.id);
    formDataObj.append("name", formData.name);
    formDataObj.append("hourlyRateDefault", formData.hourlyRateDefault);
    
    await updateCompany(formDataObj);
    setIsEditing(false);
    // Refresh the page to show updated data
    window.location.reload();
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            placeholder="Company name"
            required
            aria-label="Company name"
          />
          <input
            type="number"
            name="hourlyRateDefault"
            value={formData.hourlyRateDefault}
            onChange={(e) => setFormData({ ...formData, hourlyRateDefault: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            placeholder="Hourly rate (optional)"
            step="0.01"
            min="0"
            aria-label="Default hourly rate"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="text-green-600 hover:underline focus:outline-none focus:ring-2 focus:ring-green-400 rounded text-sm"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-600 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-400 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={handleEdit}
      className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
    >
      Change
    </button>
  );
}
