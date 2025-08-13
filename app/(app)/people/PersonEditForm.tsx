"use client";

import { useState } from "react";
import { updatePerson } from "./actions";

interface Company {
  id: string;
  name: string;
}

interface Person {
  id: string;
  name: string;
  companyId: string | null;
  company: Company | null;
}

interface PersonEditFormProps {
  person: Person;
  companies: Company[];
}

export function PersonEditForm({ person, companies }: PersonEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: person.name,
    companyId: person.companyId || ""
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: person.name,
      companyId: person.companyId || ""
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: person.name,
      companyId: person.companyId || ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append("id", person.id);
    formDataObj.append("name", formData.name);
    formDataObj.append("companyId", formData.companyId);
    
    await updatePerson(formDataObj);
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
            placeholder="Name"
            required
            aria-label="Name"
          />
          <select
            name="companyId"
            value={formData.companyId}
            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            aria-label="Company"
          >
            <option value="">No company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
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
