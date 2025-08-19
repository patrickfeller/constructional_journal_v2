"use client";

import { useState } from "react";
import { updateProject } from "./actions";

interface Project {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface ProjectEditFormProps {
  project: Project;
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    address: project.address || ""
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: project.name,
      address: project.address || ""
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: project.name,
      address: project.address || ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append("id", project.id);
    formDataObj.append("name", formData.name);
    formDataObj.append("address", formData.address);
    
    await updateProject(formDataObj);
    setIsEditing(false);
    // Refresh the page to show updated data
    window.location.reload();
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
          required
          aria-label="Project name"
        />
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Full address"
          className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
          aria-label="Project address"
          required
        />
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
