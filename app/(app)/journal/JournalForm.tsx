"use client";

import { useState, useEffect } from "react";
import { upload } from '@vercel/blob/client';
import { WeatherData } from "@/lib/weather";

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

  const fetchWeather = async (projectId: string, date: string) => {
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
  };

  useEffect(() => {
    if (selectedProjectId && selectedDate) {
      fetchWeather(selectedProjectId, selectedDate);
    }
  }, [selectedProjectId, selectedDate, projects]);

  return (
    <form action="/api/journal" method="POST" className="grid gap-3">
      <div className="grid sm:grid-cols-3 gap-2">
        <select 
          name="projectId" 
          aria-label="Project" 
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" 
          required
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
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" 
          required 
        />
        <input name="title" placeholder="Title" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" required />
      </div>
      <textarea name="notes" aria-label="Notes" placeholder="Notes (Markdown supported)" className="border rounded-md px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800" />
      
      {/* Weather Information */}
      {weatherLoading && (
        <div className="text-sm text-gray-600">Loading weather data...</div>
      )}
      {weatherData && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-2xl">{weatherData.icon}</span>
            <div>
              <div className="font-medium">{weatherData.description}</div>
              <div className="text-gray-600 dark:text-gray-400">
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
