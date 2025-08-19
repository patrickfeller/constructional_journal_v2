"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { geocodeAddress } from "@/lib/geocoding";

const projectSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(1, "Address is required"),
});

export async function createProject(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return;
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
  });
  if (!parsed.success) return;
  const { name, address } = parsed.data;
  
  // Automatically geocode the address
  let latitude: number | null = null;
  let longitude: number | null = null;
  
  try {
    const geocodeResult = await geocodeAddress(address);
    if (geocodeResult) {
      latitude = parseFloat(geocodeResult.lat);
      longitude = parseFloat(geocodeResult.lon);
    }
  } catch (error) {
    console.error('Geocoding failed:', error);
    // Continue without coordinates if geocoding fails
  }
  
  await db.project.create({ 
    data: { 
      name, 
      address, 
      latitude,
      longitude,
      userId 
    } 
  });
  revalidatePath("/projects");
}

export async function deleteProject(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const id = String(formData.get("id"));
  if (!id || !userId) return;
  await db.project.delete({ where: { id, userId } as any });
  revalidatePath("/projects");
}

export async function updateProject(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const id = String(formData.get("id"));
  if (!id || !userId) return;
  
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
  });
  if (!parsed.success) return;
  
  const { name, address } = parsed.data;
  
  // Get the current project to check if address changed
  const currentProject = await db.project.findUnique({
    where: { id, userId } as any,
    select: { address: true }
  });
  
  let latitude: number | null = null;
  let longitude: number | null = null;
  
  // Only geocode if the address has changed
  if (currentProject && currentProject.address !== address) {
    try {
      const geocodeResult = await geocodeAddress(address);
      if (geocodeResult) {
        latitude = parseFloat(geocodeResult.lat);
        longitude = parseFloat(geocodeResult.lon);
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      // Continue without coordinates if geocoding fails
    }
  }
  
  const updateData: any = { name, address };
  
  // Only update coordinates if they were geocoded (i.e., address changed)
  if (latitude !== null && longitude !== null) {
    updateData.latitude = latitude;
    updateData.longitude = longitude;
  }
  
  await db.project.update({ 
    where: { id, userId } as any, 
    data: updateData
  });
  revalidatePath("/projects");
}



