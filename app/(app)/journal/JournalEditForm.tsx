"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { updateJournalEntry } from "./actions";
import { WeatherData } from "@/lib/weather";
import { upload } from '@vercel/blob/client';

interface Project {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

interface Photo {
  id: string;
  url: string;
}

interface JournalEntry {
  id: string;
  title: string;
  notes: string | null;
  date: Date;
  projectId: string;
  project: Project;
  photos: Photo[];
  weather: any;
}

interface JournalEditFormProps {
  entry: JournalEntry;
  projects: Project[];
}

export function JournalEditForm({ entry, projects }: JournalEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: entry.title,
    notes: entry.notes || "",
    date: new Date(entry.date).toISOString().slice(0, 10),
    projectId: entry.projectId
  });
  const [photos, setPhotos] = useState<Photo[]>(entry.photos);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(entry.weather);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      title: entry.title,
      notes: entry.notes || "",
      date: new Date(entry.date).toISOString().slice(0, 10),
      projectId: entry.projectId
    });
    setPhotos(entry.photos);
    setNewPhotos([]);
  };

  const handleCancel = () => {
    // Clean up object URLs to prevent memory leaks
    newPhotos.forEach(photo => {
      URL.revokeObjectURL(URL.createObjectURL(photo));
    });
    
    setIsEditing(false);
    setFormData({
      title: entry.title,
      notes: entry.notes || "",
      date: new Date(entry.date).toISOString().slice(0, 10),
      projectId: entry.projectId
    });
    setPhotos(entry.photos);
    setNewPhotos([]);
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };

  const handleRemoveNewPhoto = (index: number) => {
    const photoToRemove = newPhotos[index];
    // Clean up object URL to prevent memory leak
    URL.revokeObjectURL(URL.createObjectURL(photoToRemove));
    setNewPhotos(newPhotos.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewPhotos(prev => [...prev, ...files]);
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    if (formData.projectId && formData.date) {
      fetchWeather(formData.projectId, formData.date);
    }
  }, [formData.projectId, formData.date, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Upload new photos first to get their URLs
      const newPhotoUrls: string[] = [];
      for (const file of newPhotos) {
        const { url } = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        newPhotoUrls.push(url);
      }
      
      // Create FormData for the update
      const formDataObj = new FormData();
      formDataObj.append("id", entry.id);
      formDataObj.append("title", formData.title);
      formDataObj.append("notes", formData.notes);
      formDataObj.append("date", formData.date);
      formDataObj.append("projectId", formData.projectId);
      
      // Add existing photos that weren't removed
      photos.forEach(photo => {
        formDataObj.append("photoUrls", photo.url);
      });
      
      // Add uploaded new photo URLs
      newPhotoUrls.forEach(url => {
        formDataObj.append("photoUrls", url);
      });
      
      // Add weather data if available
      if (weatherData) {
        formDataObj.append("weather", JSON.stringify(weatherData));
      }
      
      await updateJournalEntry(formDataObj);
      
      // Clean up object URLs after successful submission
      newPhotos.forEach(photo => {
        URL.revokeObjectURL(URL.createObjectURL(photo));
      });
      
      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to update journal entry:', error);
      alert('Failed to update journal entry. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800 w-full"
            placeholder="Entry title"
            required
            aria-label="Entry title"
          />
          <select
            name="projectId"
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800 w-full"
            required
            aria-label="Project"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800 w-full"
            required
            aria-label="Date"
          />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes (optional)"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800 resize-none w-full"
            rows={3}
            aria-label="Notes"
          />
        </div>
        
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
          </div>
        )}
        
        {/* Photo Management Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Photos</h4>
          
          {/* Existing Photos */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Existing photos:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt="Journal photo"
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New Photos */}
          {newPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">New photos to add:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {newPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt="New photo"
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewPhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add New Photos */}
          <div className="min-w-0">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 overflow-hidden"
              aria-label="Add new photos"
              title="Select photos to add"
            />
            <p className="text-xs text-gray-500 mt-1 break-words">Select one or more images to add</p>
          </div>
        </div>

        {/* Upload status */}
        {uploading && (
          <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            Uploading photos and saving changes...
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={uploading}
            className={`text-sm focus:outline-none focus:ring-2 focus:ring-green-400 rounded ${
              uploading 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-green-600 hover:underline'
            }`}
          >
            {uploading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={uploading}
            className={`text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 rounded ${
              uploading 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:underline'
            }`}
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
