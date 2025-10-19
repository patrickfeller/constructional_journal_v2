"use client";

import { useState, useEffect } from "react";
import { Clock, BookText, User, Building2, FolderKanban, X, Receipt } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogBody } from "./ui/dialog";
import { TimeForm } from "../(app)/time/TimeForm";
import { JournalForm } from "../(app)/journal/JournalForm";
import { PersonForm } from "../(app)/people/PersonForm";
import { CompanyForm } from "../(app)/companies/CompanyForm";
import { ProjectForm } from "../(app)/projects/ProjectForm";
import { ExpenseForm } from "../(app)/expenses/ExpenseForm";

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EntityType = "time" | "journal" | "person" | "company" | "project" | "expense" | null;

const menuItems = [
  { type: "time" as const, label: "Time", icon: Clock, color: "bg-blue-500" },
  { type: "journal" as const, label: "Journal", icon: BookText, color: "bg-green-500" },
  { type: "expense" as const, label: "Expense", icon: Receipt, color: "bg-yellow-500" },
  { type: "person" as const, label: "Person", icon: User, color: "bg-purple-500" },
  { type: "company" as const, label: "Company", icon: Building2, color: "bg-orange-500" },
  { type: "project" as const, label: "Project", icon: FolderKanban, color: "bg-pink-500" },
];

export function AddEntityModal({ isOpen, onClose }: AddEntityModalProps) {
  const [selectedType, setSelectedType] = useState<EntityType>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedType(null);
      setData(null);
    }
  }, [isOpen]);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && !data) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, peopleRes, companiesRes] = await Promise.all([
        fetch("/api/projects").catch(() => null),
        fetch("/api/people").catch(() => null),
        fetch("/api/companies").catch(() => null),
      ]);

      const projects = projectsRes?.ok ? await projectsRes.json() : [];
      const people = peopleRes?.ok ? await peopleRes.json() : [];
      const companies = companiesRes?.ok ? await companiesRes.json() : [];

      setData({ projects, people, companies });
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set empty arrays as fallback
      setData({ projects: [], people: [], companies: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = (type: EntityType) => {
    setSelectedType(type);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleFormSuccess = () => {
    // Close modal and refresh
    onClose();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Show floating menu when no type is selected
  if (!selectedType) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 z-50"
            onClick={onClose}
          >
            <div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-3 space-y-2 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
                {loading ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  menuItems.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleSelectType(item.type)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className={`p-2 rounded-lg ${item.color} text-white`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Show form dialog when type is selected
  const today = new Date().toISOString().slice(0, 10);
  const selectedItem = menuItems.find((item) => item.type === selectedType);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedItem && (
            <div className={`p-2 rounded-lg ${selectedItem.color} text-white`}>
              <selectedItem.icon className="w-5 h-5" />
            </div>
          )}
          <DialogTitle>Add {selectedItem?.label}</DialogTitle>
        </div>
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Back to menu"
        >
          <X className="w-5 h-5" />
        </button>
      </DialogHeader>
      <DialogBody>
        {selectedType === "time" && data && (
          <TimeFormWrapper
            projects={data.projects}
            people={data.people}
            today={today}
            onSuccess={handleFormSuccess}
          />
        )}
        {selectedType === "journal" && data && (
          <JournalFormWrapper
            projects={data.projects}
            today={today}
            onSuccess={handleFormSuccess}
          />
        )}
        {selectedType === "person" && data && (
          <PersonFormWrapper
            companies={data.companies}
            onSuccess={handleFormSuccess}
          />
        )}
        {selectedType === "company" && (
          <CompanyFormWrapper onSuccess={handleFormSuccess} />
        )}
        {selectedType === "project" && (
          <ProjectFormWrapper onSuccess={handleFormSuccess} />
        )}
        {selectedType === "expense" && data && (
          <ExpenseFormWrapper
            projects={data.projects}
            companies={data.companies}
            today={today}
            onSuccess={handleFormSuccess}
          />
        )}
      </DialogBody>
    </Dialog>
  );
}

// Wrapper components to handle success callbacks
function TimeFormWrapper({ projects, people, today, onSuccess }: any) {
  return (
    <div className="space-y-4">
      <TimeForm projects={projects} people={people} today={today} lastUsedEntry={null} />
    </div>
  );
}

function JournalFormWrapper({ projects, today, onSuccess }: any) {
  return (
    <div className="space-y-4">
      <JournalForm projects={projects} today={today} />
    </div>
  );
}

function PersonFormWrapper({ companies, onSuccess }: any) {
  return (
    <div className="space-y-4">
      <PersonForm companies={companies} />
    </div>
  );
}

function CompanyFormWrapper({ onSuccess }: any) {
  return (
    <div className="space-y-4">
      <CompanyForm />
    </div>
  );
}

function ProjectFormWrapper({ onSuccess }: any) {
  return (
    <div className="space-y-4">
      <ProjectForm />
    </div>
  );
}

function ExpenseFormWrapper({ projects, companies, today, onSuccess }: any) {
  return (
    <div className="space-y-4">
      <ExpenseForm projects={projects} companies={companies} today={today} />
    </div>
  );
}

