"use client";

import { useState, useEffect } from "react";
import { Clock, BookText, User, Building2, FolderKanban, X, ReceiptEuro } from "lucide-react";
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
  { type: "time"    as const, label: "Time",    icon: Clock,        desc: "Clock hours"    },
  { type: "journal" as const, label: "Journal", icon: BookText,     desc: "Log site notes" },
  { type: "expense" as const, label: "Expense", icon: ReceiptEuro,  desc: "Add a cost"     },
  { type: "person"  as const, label: "Person",  icon: User,         desc: "Add a worker"   },
  { type: "company" as const, label: "Company", icon: Building2,    desc: "Add a company"  },
  { type: "project" as const, label: "Project", icon: FolderKanban, desc: "New site"       },
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

  if (!selectedType) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-50" onClick={onClose}>
            <div
              className="absolute bottom-24 left-3 right-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="rounded-[24px] border p-4"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--line)",
                  boxShadow: "var(--shadow)",
                }}
              >
                {/* Grab handle */}
                <div
                  className="w-10 h-1.5 rounded-full mx-auto mb-3"
                  style={{ background: "var(--line-2)" }}
                />
                <h3
                  className="text-[18px] font-bold tracking-[-0.01em] mb-0.5 px-1"
                  style={{ color: "var(--ink)" }}
                >
                  New entry
                </h3>
                <p className="text-[13px] mb-4 px-1" style={{ color: "var(--ink-2)" }}>
                  What are you logging?
                </p>

                {loading ? (
                  <div className="text-center py-6 text-sm" style={{ color: "var(--ink-3)" }}>
                    Loading…
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {menuItems.map((item) => (
                      <button
                        key={item.type}
                        onClick={() => handleSelectType(item.type)}
                        className="flex flex-col gap-2.5 p-4 rounded-[16px] text-left transition-transform active:scale-95 min-h-[92px]"
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--line)",
                          color: "var(--ink)",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
                        >
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[15px] font-bold">{item.label}</div>
                          <div className="text-[12px] mt-0.5" style={{ color: "var(--ink-3)" }}>
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
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
            <div
              className="p-2 rounded-lg"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }}
            >
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

