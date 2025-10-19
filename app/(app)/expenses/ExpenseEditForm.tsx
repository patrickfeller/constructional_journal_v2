"use client";

import { useState, useTransition, useRef } from "react";
import { upload } from '@vercel/blob/client';
import { updateExpense } from "./actions";
import { Dialog, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Upload } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  projectId: string;
  amount: any;
  description: string;
  company: string;
  companyId?: string | null;
  invoiceUrl?: string | null;
  date: Date;
}

interface ExpenseEditFormProps {
  expense: Expense;
  projects: Project[];
  companies: Company[];
}

export function ExpenseEditForm({ expense, projects, companies }: ExpenseEditFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [companyInput, setCompanyInput] = useState(expense.company);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(expense.companyId || "");
  const [uploadedFile, setUploadedFile] = useState(expense.invoiceUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(companyInput.toLowerCase())
  );

  const handleCompanySelect = (company: Company) => {
    setCompanyInput(company.name);
    setSelectedCompanyId(company.id);
    setShowSuggestions(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const { url } = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      setUploadedFile(url);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (formData: FormData) => {
    formData.set("id", expense.id);
    formData.set("company", companyInput);
    formData.set("companyId", selectedCompanyId);
    formData.set("invoiceUrl", uploadedFile);

    startTransition(async () => {
      await updateExpense(formData);
      setIsOpen(false);
    });
  };

  const dateStr = new Date(expense.date).toISOString().slice(0, 10);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        aria-label="Edit expense"
      >
        <Pencil className="w-4 h-4" />
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project *</label>
                <select
                  name="projectId"
                  defaultValue={expense.projectId}
                  aria-label="Project"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
                  required
                  disabled={isPending}
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount (€) *</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0"
                  defaultValue={Number(expense.amount)}
                  aria-label="Amount in euros"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={expense.description}
                aria-label="Expense description"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
                required
                disabled={isPending}
              />
            </div>

              <div className="relative">
              <label className="block text-sm font-medium mb-1">Company *</label>
              <input
                type="text"
                value={companyInput}
                onChange={(e) => {
                  setCompanyInput(e.target.value);
                  setSelectedCompanyId("");
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                aria-label="Company name"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
                required
                disabled={isPending}
              />
              {showSuggestions && companyInput && filteredCompanies.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredCompanies.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => handleCompanySelect(company)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={dateStr}
                  aria-label="Expense date"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
                  required
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Invoice (optional)</label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="invoice-upload-edit"
                    aria-label="Upload invoice"
                    disabled={isPending || isUploading}
                  />
                  <label
                    htmlFor="invoice-upload-edit"
                    className={`flex-1 border rounded-md px-3 py-2 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 ${
                      isUploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? "Uploading..." : uploadedFile ? "Change File" : "Upload"}
                  </label>
                </div>
                {uploadedFile && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {uploadedFile === expense.invoiceUrl ? "Current file" : "New file uploaded"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isPending}
                loadingText="Saving..."
                className="flex-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogBody>
      </Dialog>
    </>
  );
}

