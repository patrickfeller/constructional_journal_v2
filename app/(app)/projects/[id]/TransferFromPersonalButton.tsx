"use client";

import { useState } from "react";
import { transferPersonalItemsToProject } from "./actions";

interface PersonalPerson {
  id: string;
  name: string;
  hourlyRate: number | null;
  defaultCompany?: {
    id: string;
    name: string;
  } | null;
}

interface PersonalCompany {
  id: string;
  name: string;
  hourlyRateDefault: number | null;
}

interface ExistingPerson {
  id: string;
  name: string;
}

interface ExistingCompany {
  id: string;
  name: string;
}

interface TransferFromPersonalButtonProps {
  type: "people" | "companies";
  projectId: string;
  personalItems: PersonalPerson[] | PersonalCompany[];
  existingItems: ExistingPerson[] | ExistingCompany[];
}

export function TransferFromPersonalButton({ 
  type, 
  projectId, 
  personalItems, 
  existingItems 
}: TransferFromPersonalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);

  // Filter out items that already exist in the project
  const existingNames = new Set(existingItems.map(item => item.name.toLowerCase()));
  const availableItems = personalItems.filter(item => 
    !existingNames.has(item.name.toLowerCase())
  );

  const handleTransfer = async () => {
    if (selectedItems.length === 0) return;
    
    setIsTransferring(true);
    
    try {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("itemIds", JSON.stringify(selectedItems));
      formData.append("type", type);
      
      const result = await transferPersonalItemsToProject(formData);
      
      if (result.success) {
        // Reset state
        setSelectedItems([]);
        setIsOpen(false);
        // Page will refresh automatically due to revalidatePath
      } else {
        alert(result.error || `Failed to transfer ${type}`);
      }
    } catch (error) {
      console.error(`Failed to transfer ${type}:`, error);
      alert(`Failed to transfer ${type}`);
    } finally {
      setIsTransferring(false);
    }
  };

  if (availableItems.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
      >
        + From My Lists
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Transfer {type === "people" ? "People" : "Companies"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Select {type} from your personal list to add to this project:
            </p>

            <div className="space-y-2 mb-4">
              {availableItems.map((item) => (
                <label key={item.id} className="flex items-center gap-3 p-2 rounded border hover:bg-accent cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {type === "people" 
                        ? `${(item as PersonalPerson).defaultCompany?.name || "No company"}${(item as PersonalPerson).hourlyRate ? ` • $${(item as PersonalPerson).hourlyRate}/hr` : ""}`
                        : `${(item as PersonalCompany).hourlyRateDefault ? `Default: $${(item as PersonalCompany).hourlyRateDefault}/hr` : "No default rate"}`
                      }
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={selectedItems.length === 0 || isTransferring}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTransferring ? 'Transferring...' : `Transfer ${selectedItems.length > 0 ? `(${selectedItems.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
