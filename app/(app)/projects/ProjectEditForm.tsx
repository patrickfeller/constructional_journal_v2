"use client";

import { useState, useTransition } from "react";
import { updateProject } from "./actions";
import { Button } from "@/components/ui/button";

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
  const [isPending, startTransition] = useTransition();
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
    startTransition(async () => {
      const formDataObj = new FormData();
      formDataObj.append("id", project.id);
      formDataObj.append("name", formData.name);
      formDataObj.append("address", formData.address);
      
      await updateProject(formDataObj);
      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    });
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
          disabled={isPending}
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
          disabled={isPending}
        />
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
