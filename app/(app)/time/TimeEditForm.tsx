"use client";

import { useState } from "react";
import { updateTimeEntry } from "./actions";

interface Project {
  id: string;
  name: string;
}

interface Person {
  id: string;
  name: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  personId: string | null;
  date: Date;
  startAt: Date;
  endAt: Date;
  breakMinutes: number;
  durationMinutes: number;
  notes: string | null;
  project: Project;
  person: Person | null;
}

interface TimeEditFormProps {
  entry: TimeEntry;
  projects: Project[];
  people: Person[];
}

export function TimeEditForm({ entry, projects, people }: TimeEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    projectId: entry.projectId,
    personId: entry.personId || "",
    date: new Date(entry.date).toISOString().slice(0, 10),
    start: new Date(entry.startAt).toTimeString().slice(0, 5),
    end: new Date(entry.endAt).toTimeString().slice(0, 5),
    breakMinutes: entry.breakMinutes,
    notes: entry.notes || ""
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      projectId: entry.projectId,
      personId: entry.personId || "",
      date: new Date(entry.date).toISOString().slice(0, 10),
      start: new Date(entry.startAt).toTimeString().slice(0, 5),
      end: new Date(entry.endAt).toTimeString().slice(0, 5),
      breakMinutes: entry.breakMinutes,
      notes: entry.notes || ""
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      projectId: entry.projectId,
      personId: entry.personId || "",
      date: new Date(entry.date).toISOString().slice(0, 10),
      start: new Date(entry.startAt).toTimeString().slice(0, 5),
      end: new Date(entry.endAt).toTimeString().slice(0, 5),
      breakMinutes: entry.breakMinutes,
      notes: entry.notes || ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append("id", entry.id);
    formDataObj.append("projectId", formData.projectId);
    formDataObj.append("personId", formData.personId);
    formDataObj.append("date", formData.date);
    formDataObj.append("start", formData.start);
    formDataObj.append("end", formData.end);
    formDataObj.append("breakMinutes", formData.breakMinutes.toString());
    formDataObj.append("notes", formData.notes);
    
    await updateTimeEntry(formDataObj);
    setIsEditing(false);
    // Refresh the page to show updated data
    window.location.reload();
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <select
            name="personId"
            value={formData.personId}
            onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            aria-label="Person"
          >
            <option value="">No person</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            required
            aria-label="Date"
          />
          <input
            type="time"
            name="start"
            value={formData.start}
            onChange={(e) => setFormData({ ...formData, start: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            required
            aria-label="Start time"
          />
          <input
            type="time"
            name="end"
            value={formData.end}
            onChange={(e) => setFormData({ ...formData, end: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            required
            aria-label="End time"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="number"
            name="breakMinutes"
            value={formData.breakMinutes}
            onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })}
            min={0}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
            placeholder="Break (mins)"
            aria-label="Break minutes"
          />
          <input
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
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
