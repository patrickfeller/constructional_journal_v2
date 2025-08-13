"use client";

import { useState } from "react";
import { updateJournalEntry } from "./actions";

interface Project {
  id: string;
  name: string;
}

interface Photo {
  id: string;
  url: string;
}

interface JournalEntry {
  id: string;
  title: string;
  notes: string | null;
  date: Date;
  projectId: string;
  project: Project;
  photos: Photo[];
}

interface JournalEditFormProps {
  entry: JournalEntry;
  projects: Project[];
}

export function JournalEditForm({ entry, projects }: JournalEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: entry.title,
    notes: entry.notes || "",
    date: new Date(entry.date).toISOString().slice(0, 10),
    projectId: entry.projectId
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      title: entry.title,
      notes: entry.notes || "",
      date: new Date(entry.date).toISOString().slice(0, 10),
      projectId: entry.projectId
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      title: entry.title,
      notes: entry.notes || "",
      date: new Date(entry.date).toISOString().slice(0, 10),
      projectId: entry.projectId
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append("id", entry.id);
    formDataObj.append("title", formData.title);
    formDataObj.append("notes", formData.notes);
    formDataObj.append("date", formData.date);
    formDataObj.append("projectId", formData.projectId);
    
    await updateJournalEntry(formDataObj);
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
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            placeholder="Entry title"
            required
            aria-label="Entry title"
          />
          <select
            name="projectId"
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            required
            aria-label="Project"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            required
            aria-label="Date"
          />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800 resize-none"
            rows={3}
            aria-label="Notes"
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
