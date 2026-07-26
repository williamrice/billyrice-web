"use server";

import { revalidatePath } from "next/cache";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";
import { getAllowedAdminSession } from "@/lib/auth-guards";

interface GalleryImage {
  imagePath: string;
  s3Key: string;
}

interface ProjectData {
  title: string;
  featured: boolean;
  githubUrl: string;
  liveUrl?: string;
  description: string;
  problem: string;
  solution: string;
  story: string;
  s3Key: string;
  technologies: string;
  featuredImageSrc: string;
  featuredImageAlt: string;
  galleryImages?: GalleryImage[];
}

export async function getAllProjects() {
  const projects = await prisma.project.findMany();
  return projects;
}

export async function createProject(data: ProjectData) {
  const session = await getAllowedAdminSession();

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { galleryImages, ...projectData } = data;

    // Convert technologies string to array
    const technologiesArray = projectData.technologies
      .split(",")
      .map((tech: string) => tech.trim());

    // Process gallery images
    const processedGalleryImages = galleryImages
      ? galleryImages.map((image: GalleryImage) => ({
          imagePath: image.imagePath,
          s3Key: image.s3Key,
        }))
      : [];

    // Prepare the data for project creation
    const projectDataToCreate = {
      ...projectData,
      technologies: technologiesArray,
      galleryImages: {
        create: processedGalleryImages,
      },
    };

    const project = await prisma.project.create({
      data: projectDataToCreate,
    });

    revalidatePath("/projects");
    revalidatePath("/admin");
    revalidatePath("/admin/project-manager");
    return { success: true, project };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function deleteProject(id: number) {
  const session = await getAllowedAdminSession();

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const galleryImages = await prisma.galleryImage.findMany({
      where: { projectId: id },
    });

    // delete the project keys from s3
    galleryImages.forEach(async (image) => {
      if (image.s3Key) {
        await deleteFileFromS3(image.s3Key);
      }
    });

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (project?.s3Key) {
      await deleteFileFromS3(project.s3Key);
    }

    // First, delete all associated GalleryImage records
    await prisma.galleryImage.deleteMany({
      where: { projectId: id },
    });

    // Then, delete the Project
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/projects");
    revalidatePath("/admin");
    revalidatePath("/admin/project-manager");
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error };
  }
}

export async function getProjectById(id: number) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { galleryImages: true },
    });
    return project;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function updateProject(data: ProjectData & { id: number }) {
  const session = await getAllowedAdminSession();

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { id, galleryImages, ...projectData } = data;

    // Convert technologies string to array
    const technologiesArray = projectData.technologies
      .split(",")
      .map((tech: string) => tech.trim());

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        technologies: technologiesArray,
        galleryImages: {
          deleteMany: {},
          create: galleryImages,
        },
      },
    });

    revalidatePath("/projects");
    revalidatePath("/admin");
    revalidatePath("/admin/project-manager");
    revalidatePath(`/admin/project-manager/edit/${id}`);
    return { success: true, project: updatedProject };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: "Failed to update project" };
  }
}
async function deleteFileFromS3(s3Key: string) {
  if (!s3Key) return;

  const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET!,
    Key: s3Key,
  });

  await s3Client.send(command);
}
