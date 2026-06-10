"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { WeatherData } from "@/lib/weather";
import { Button } from "@/components/ui/button";
import { createJournalEntry } from "./actions";
import { compressImages } from "@/lib/client/imageCompression";

interface JournalFormProps {
  projects: any[];
  today: string;
  lastUsedProjectId?: string;
}

export function JournalForm({ projects, today, lastUsedProjectId }: JournalFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(lastUsedProjectId || "");
  const [selectedDate, setSelectedDate] = useState(today);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handlePhotoUpload = async (files: FileList) => {
    if (!files.length) return;
    
    setUploading(true);
    const urls: string[] = [];
    
    try {
      const filesToProcess = Array.from(files);
      const compressedFiles = await compressImages(filesToProcess);

      for (const file of compressedFiles) {
        const { url } = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        urls.push(url);
      }
      setUploadedUrls(prev => [...prev, ...urls]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const fetchWeather = useCallback(async (projectId: string, date: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.latitude || !project.longitude) {
      setWeatherData(null);
      return;
    }

    setWeatherLoading(true);
    try {
      const response = await fetch(
        `/api/weather?latitude=${project.latitude}&longitude=${project.longitude}&date=${date}`
      );
      if (response.ok) {
        const weather = await response.json();
        setWeatherData(weather);
      } else {
        setWeatherData(null);
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  }, [projects]);

  useEffect(() => {
    if (selectedProjectId && selectedDate) {
      fetchWeather(selectedProjectId, selectedDate);
    }
  }, [selectedProjectId, selectedDate, projects]);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await createJournalEntry(formData);
        // Reset form
        setUploadedUrls([]);
        setWeatherData(null);
        // Refresh the page to show the new entry
        window.location.reload();
      } catch (error) {
        console.error('Error creating journal entry:', error);
      }
    });
  };

  return (
    <form action={handleSubmit} className="grid gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select 
          name="projectId" 
          aria-label="Project" 
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-full"
          required
          disabled={isPending}
        >
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input 
          type="date" 
          name="date" 
          aria-label="Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-full" 
          required 
          disabled={isPending}
        />
        <input 
          name="title" 
          placeholder="Title"
          className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-full" 
          required 
          disabled={isPending}
        />
      </div>
      <textarea 
        name="notes" 
        aria-label="Notes" 
        placeholder="Notes (Markdown supported)"
        className="border border-[var(--line)] rounded-md px-3 py-2 min-h-[100px] bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-full" 
        disabled={isPending}
      />
      
      {/* Weather Information */}
      {weatherLoading && (
        <div className="text-sm text-[var(--ink-2)]">Loading weather data...</div>
      )}
      {weatherData && (
        <div className="p-3 bg-[var(--surface-2)] border border-[var(--line)] rounded-md">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-2xl">{weatherData.icon}</span>
            <div>
              <div className="font-medium">{weatherData.description}</div>
              <div className="text-[var(--ink-2)]">
                {weatherData.temperature}°C on {new Date(weatherData.date).toLocaleDateString()}
              </div>
            </div>
          </div>
          <input type="hidden" name="weather" value={JSON.stringify(weatherData)} />
        </div>
      )}
      
      {/* Photo upload with client-side handling */}
      <div className="space-y-2">
        <input 
          type="file" 
          name="photos" 
          aria-label="Photos" 
          accept="image/*" 
          multiple 
          onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
          className="border border-[var(--line)] rounded-md px-3 py-2 bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] w-full"
          disabled={isPending || uploading}
        />
        {uploading && <div className="text-sm text-[var(--ink-2)]">Uploading photos...</div>}
        {uploadedUrls.length > 0 && (
          <div className="text-sm text-[var(--ok)]">
            {uploadedUrls.length} photo(s) uploaded successfully
          </div>
        )}
      </div>

      {/* Hidden inputs for uploaded URLs */}
      {uploadedUrls.map((url, index) => (
        <input key={index} type="hidden" name="photoUrls" value={url} />
      ))}

      <Button 
        type="submit"
        loading={isPending}
        loadingText="Adding entry..."
        disabled={isPending || uploading}
        className="w-fit"
      >
        Add Entry
      </Button>
    </form>
  );
}
