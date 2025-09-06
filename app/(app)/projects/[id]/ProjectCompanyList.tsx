"use client";

import { useState } from "react";
import { addProjectCompany, updateProjectCompany, removeProjectCompany } from "./actions";

interface ProjectCompany {
  id: string;
  name: string;
  hourlyRateDefault: number | null;
  addedAt: Date;
  addedByUser?: {
    id: string;
    name: string | null;
  } | null;
  sourcePersonalCompany?: {
    id: string;
    name: string;
  } | null;
}

interface ProjectCompanyListProps {
  companies: ProjectCompany[];
  canEdit: boolean;
  projectId: string;
}

export function ProjectCompanyList({ 
  companies, 
  canEdit, 
  projectId 
}: ProjectCompanyListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ProjectCompany | null>(null);
  const [removingCompanyId, setRemovingCompanyId] = useState<string | null>(null);

  const handleAddCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Store form reference before async operation
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      formData.append("projectId", projectId);

      const result = await addProjectCompany(formData);
      
      if (result.success) {
        // Reset form and close modal
        form.reset();
        setIsAddModalOpen(false);
        // Page will refresh automatically due to revalidatePath
      } else {
        alert(result.error || "Failed to add company");
      }
    } catch (error) {
      console.error("Failed to add company:", error);
      alert("Failed to add company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCompany) return;
    
    const form = e.currentTarget;
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      formData.append("id", editingCompany.id);
      formData.append("projectId", projectId);

      const result = await updateProjectCompany(formData);
      
      if (result.success) {
        form.reset();
        setEditingCompany(null);
        // Page will refresh automatically due to revalidatePath
      } else {
        alert(result.error || "Failed to update company");
      }
    } catch (error) {
      console.error("Failed to update company:", error);
      alert("Failed to update company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to remove "${companyName}" from this project?`)) {
      return;
    }

    setRemovingCompanyId(companyId);

    try {
      const formData = new FormData();
      formData.append("companyId", companyId);
      formData.append("projectId", projectId);

      const result = await removeProjectCompany(formData);
      
      if (!result.success) {
        alert(result.error || "Failed to remove company");
      }
      // Page will refresh automatically due to revalidatePath on success
    } catch (error) {
      console.error("Failed to remove company:", error);
      alert("Failed to remove company");
    } finally {
      setRemovingCompanyId(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
      {companies.map((company) => (
        <div key={company.id} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-medium">{company.name}</div>
              <div className="text-sm text-muted-foreground">
                {company.hourlyRateDefault 
                  ? `Default rate: $${company.hourlyRateDefault}/hr`
                  : "No default rate"
                }
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingCompany(company)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleRemoveCompany(company.id, company.name)}
                  disabled={removingCompanyId === company.id}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {removingCompanyId === company.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Added {company.addedAt.toLocaleDateString()}
            {company.addedByUser && ` by ${company.addedByUser.name}`}
            {company.sourcePersonalCompany && ` (from personal list)`}
          </div>
        </div>
      ))}

      {companies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No companies in this project yet
        </div>
      )}

      {/* Add Company Button */}
      {canEdit && (
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full p-3 border-2 border-dashed border-muted-foreground/20 rounded-lg text-muted-foreground hover:border-muted-foreground/40 hover:bg-accent/5 transition-colors"
        >
          + Add Company
        </button>
      )}
      </div>

      {/* Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Company to Project</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label htmlFor="hourlyRateDefault" className="block text-sm font-medium mb-1">
                  Default Hourly Rate
                </label>
                <input
                  type="number"
                  id="hourlyRateDefault"
                  name="hourlyRateDefault"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
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
                  {isSubmitting ? "Adding..." : "Add Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Company</h3>
              <button
                onClick={() => setEditingCompany(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditCompany} className="space-y-4">
              <div>
                <label htmlFor="edit-company-name" className="block text-sm font-medium mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="edit-company-name"
                  name="name"
                  required
                  defaultValue={editingCompany.name}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label htmlFor="edit-hourlyRateDefault" className="block text-sm font-medium mb-1">
                  Default Hourly Rate
                </label>
                <input
                  type="number"
                  id="edit-hourlyRateDefault"
                  name="hourlyRateDefault"
                  step="0.01"
                  min="0"
                  defaultValue={editingCompany.hourlyRateDefault || ''}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Updating..." : "Update Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
