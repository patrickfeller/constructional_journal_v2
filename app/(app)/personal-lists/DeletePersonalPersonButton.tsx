"use client";

import { deletePersonalPerson } from "./actions";

interface DeletePersonalPersonButtonProps {
  personId: string;
  personName: string;
}

export function DeletePersonalPersonButton({ personId, personName }: DeletePersonalPersonButtonProps) {
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${personName}" from your personal list?`)) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("personId", personId);
      
      const result = await deletePersonalPerson(formData);
      
      if (!result.success) {
        alert(result.error || "Failed to delete person");
      }
    } catch (error) {
      console.error("Failed to delete personal person:", error);
      alert("Failed to delete person");
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
