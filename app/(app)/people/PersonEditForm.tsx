"use client";

import { useState, useTransition } from "react";
import { updatePerson } from "./actions";
import { Button } from "@/components/ui/button";

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
  const [isPending, startTransition] = useTransition();
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
    startTransition(async () => {
      const formDataObj = new FormData();
      formDataObj.append("id", person.id);
      formDataObj.append("name", formData.name);
      formDataObj.append("companyId", formData.companyId);
      
      await updatePerson(formDataObj);
      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    });
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
            disabled={isPending}
          />
          <select
            name="companyId"
            value={formData.companyId}
            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            aria-label="Company"
            disabled={isPending}
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
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            loading={isPending}
            loadingText="Saving..."
            className="text-green-600 hover:text-green-700"
          >
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isPending}
            className="text-gray-600 hover:text-gray-700"
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleEdit}
      className="text-blue-600 hover:text-blue-700"
    >
      Change
    </Button>
  );
}
