"use client";

import { deletePersonalCompany } from "./actions";

interface DeletePersonalCompanyButtonProps {
  companyId: string;
  companyName: string;
  peopleCount: number;
}

export function DeletePersonalCompanyButton({ companyId, companyName, peopleCount }: DeletePersonalCompanyButtonProps) {
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${companyName}" from your personal list?`)) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("companyId", companyId);
      
      const result = await deletePersonalCompany(formData);
      
      if (!result.success) {
        alert(result.error || "Failed to delete company");
      }
    } catch (error) {
      console.error("Failed to delete personal company:", error);
      alert("Failed to delete company");
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="text-sm text-red-600 hover:underline"
    >
      Delete
    </button>
  );
}
