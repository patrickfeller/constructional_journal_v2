"use client";

import { useState } from "react";
import { addProjectPerson, updateProjectPerson, removeProjectPerson } from "./actions";

interface ProjectPerson {
  id: string;
  name: string;
  hourlyRate: number | null;
  addedAt: Date;
  addedByUser?: {
    id: string;
    name: string | null;
  } | null;
  sourcePersonalPerson?: {
    id: string;
    name: string;
  } | null;
  company?: {
    id: string;
    name: string;
    hourlyRateDefault: number | null;
  } | null;
}

interface ProjectCompany {
  id: string;
  name: string;
  hourlyRateDefault: number | null;
}

interface ProjectPersonListProps {
  people: ProjectPerson[];
  companies: ProjectCompany[];
  canEdit: boolean;
  projectId: string;
}

export function ProjectPersonList({ 
  people, 
  companies, 
  canEdit, 
  projectId 
}: ProjectPersonListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPerson, setEditingPerson] = useState<ProjectPerson | null>(null);
  const [removingPersonId, setRemovingPersonId] = useState<string | null>(null);

  const handleAddPerson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Store form reference before async operation
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      formData.append("projectId", projectId);

      const result = await addProjectPerson(formData);
      
      if (result.success) {
        // Reset form and close modal
        form.reset();
        setIsAddModalOpen(false);
        // Page will refresh automatically due to revalidatePath
      } else {
        alert(result.error || "Failed to add person");
      }
    } catch (error) {
      console.error("Failed to add person:", error);
      alert("Failed to add person");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPerson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPerson) return;
    
    const form = e.currentTarget;
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      formData.append("id", editingPerson.id);
      formData.append("projectId", projectId);

      const result = await updateProjectPerson(formData);
      
      if (result.success) {
        form.reset();
        setEditingPerson(null);
        // Page will refresh automatically due to revalidatePath
      } else {
        alert(result.error || "Failed to update person");
      }
    } catch (error) {
      console.error("Failed to update person:", error);
      alert("Failed to update person");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePerson = async (personId: string, personName: string) => {
    if (!confirm(`Are you sure you want to remove "${personName}" from this project?`)) {
      return;
    }

    setRemovingPersonId(personId);

    try {
      const formData = new FormData();
      formData.append("personId", personId);
      formData.append("projectId", projectId);

      const result = await removeProjectPerson(formData);
      
      if (!result.success) {
        alert(result.error || "Failed to remove person");
      }
      // Page will refresh automatically due to revalidatePath on success
    } catch (error) {
      console.error("Failed to remove person:", error);
      alert("Failed to remove person");
    } finally {
      setRemovingPersonId(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
      {people.map((person) => (
        <div key={person.id} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-medium">{person.name}</div>
              <div className="text-sm text-muted-foreground">
                {person.company?.name || "No company"}
                {person.hourlyRate && ` • $${person.hourlyRate}/hr`}
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingPerson(person)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleRemovePerson(person.id, person.name)}
                  disabled={removingPersonId === person.id}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {removingPersonId === person.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Added {person.addedAt.toLocaleDateString()}
            {person.addedByUser && ` by ${person.addedByUser.name}`}
            {person.sourcePersonalPerson && ` (from personal list)`}
          </div>
        </div>
      ))}

      {people.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No people in this project yet
        </div>
      )}

        {/* Add Person Button */}
        {canEdit && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full p-3 border-2 border-dashed border-muted-foreground/20 rounded-lg text-muted-foreground hover:border-muted-foreground/40 hover:bg-accent/5 transition-colors"
          >
            + Add Person
          </button>
        )}
      </div>

      {/* Add Person Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Person to Project</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPerson} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter person's name"
                />
              </div>

              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium mb-1">
                  Hourly Rate
                </label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="companyId" className="block text-sm font-medium mb-1">
                  Company
                </label>
                <select
                  id="companyId"
                  name="companyId"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Adding..." : "Add Person"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Person Modal */}
      {editingPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Person</h3>
              <button
                onClick={() => setEditingPerson(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditPerson} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  required
                  defaultValue={editingPerson.name}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter person's name"
                />
              </div>

              <div>
                <label htmlFor="edit-hourlyRate" className="block text-sm font-medium mb-1">
                  Hourly Rate
                </label>
                <input
                  type="number"
                  id="edit-hourlyRate"
                  name="hourlyRate"
                  step="0.01"
                  min="0"
                  defaultValue={editingPerson.hourlyRate || ''}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="edit-companyId" className="block text-sm font-medium mb-1">
                  Company
                </label>
                <select
                  id="edit-companyId"
                  name="companyId"
                  defaultValue={editingPerson.company?.id || ''}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
                  type="button"
                  onClick={() => setEditingPerson(null)}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Updating..." : "Update Person"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
