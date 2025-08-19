"use client";

import { useState } from "react";
import { upload } from '@vercel/blob/client';

interface JournalFormProps {
  projects: any[];
  today: string;
  lastUsedProjectId?: string;
}

export function JournalForm({ projects, today, lastUsedProjectId }: JournalFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const handlePhotoUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setUploading(true);
    const urls: string[] = [];
    
    try {
      for (const file of files) {
        const { url } = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        urls.push(url);
      }
      setUploadedUrls(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action="/api/journal" method="POST" className="grid gap-3">
      <div className="grid sm:grid-cols-3 gap-2">
        <select name="projectId" aria-label="Project" defaultValue={lastUsedProjectId || ""} className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required>
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input type="date" name="date" aria-label="Date" defaultValue={today} className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required />
        <input name="title" placeholder="Title" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required />
      </div>
      <textarea name="notes" aria-label="Notes" placeholder="Notes (Markdown supported)" className="border rounded-md px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" />
      
      {/* Photo upload with client-side handling */}
      <div className="space-y-2">
        <input 
          type="file" 
          name="photos" 
          aria-label="Photos" 
          accept="image/*" 
          multiple 
          onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" 
        />
        {uploading && <div className="text-sm text-gray-600">Uploading photos...</div>}
        {uploadedUrls.length > 0 && (
          <div className="text-sm text-green-600">
            {uploadedUrls.length} photo(s) uploaded successfully
          </div>
        )}
      </div>

      {/* Hidden inputs for uploaded URLs */}
      {uploadedUrls.map((url, index) => (
        <input key={index} type="hidden" name="photoUrls" value={url} />
      ))}

      <button className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 w-fit">Add Entry</button>
    </form>
  );
}
