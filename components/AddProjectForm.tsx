"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createProject } from "@/actions/projects";
import { useRouter } from "next/navigation";

interface GalleryUpload {
  url: string;
  s3Key: string;
}

// Define the schema for form validation
const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  problem: z
    .string()
    .min(10, "Problem statement must be at least 10 characters"),
  solution: z.string().min(10, "Solution must be at least 10 characters"),
  story: z.string().min(10, "Story must be at least 10 characters"),
  technologies: z.string().min(1, "At least one technology is required"),
  githubUrl: z.string().url("Must be a valid URL"),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  featuredImageSrc: z
    .instanceof(File)
    .refine((file) => file.size <= 5000000, "Max file size is 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Only .jpg, .png, and .webp formats are supported"
    ),
  featuredImageAlt: z
    .string()
    .min(1, "Alt text for featured image is required"),
  galleryImages: z
    .array(
      z
        .instanceof(File)
        .refine((file) => file.size <= 5000000, "Max file size is 5MB")
        .refine(
          (file) =>
            ["image/jpeg", "image/png", "image/webp"].includes(file.type),
          "Only .jpg, .png, and .webp formats are supported"
        )
    )
    .max(6, "Maximum 6 gallery images allowed")
    .optional(),
  featured: z.boolean(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export default function AddProjectForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });
  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    let success = false;
    try {
      // Upload featured image
      const featuredImageFormData = new FormData();
      featuredImageFormData.append("file", data.featuredImageSrc);
      featuredImageFormData.append(
        "directory",
        `projects/${data.title.toLowerCase().replace(/\s+/g, "-")}`
      );

      const featuredImageResponse = await fetch("/api/upload", {
        method: "POST",
        body: featuredImageFormData,
      });
      const featuredImageUpload = await featuredImageResponse.json();

      if (!featuredImageUpload.success) {
        throw new Error("Failed to upload featured image");
      }

      // Upload gallery images if any
      let galleryUploads: GalleryUpload[] = [];
      if (data.galleryImages && data.galleryImages.length > 0) {
        galleryUploads = await Promise.all(
          data.galleryImages
            .filter((file): file is File => file instanceof File)
            .map(async (file) => {
              const galleryImageFormData = new FormData();
              galleryImageFormData.append("file", file);
              galleryImageFormData.append(
                "directory",
                `projects/${data.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}/gallery`
              );

              const galleryImageResponse = await fetch("/api/upload", {
                method: "POST",
                body: galleryImageFormData,
              });
              const upload = await galleryImageResponse.json();
              if (!upload.success) {
                throw new Error(`Failed to upload gallery image: ${file.name}`);
              }
              return {
                url: upload.publicUrl as string,
                s3Key: upload.key as string,
              };
            })
        );
      }

      // Prepare project data
      const projectData = {
        title: data.title,
        description: data.description,
        problem: data.problem,
        solution: data.solution,
        story: data.story,
        s3Key: featuredImageUpload.key as string,
        technologies: data.technologies,
        githubUrl: data.githubUrl,
        liveUrl: data.liveUrl,
        featuredImageSrc: featuredImageUpload.publicUrl as string,
        featuredImageAlt: data.featuredImageAlt,
        featured: data.featured,
        galleryImages: {
          create: galleryUploads.map((upload) => ({
            imagePath: upload.url,
            s3Key: upload.s3Key,
          })),
        },
      };

      const result = await createProject({
        ...projectData,
        galleryImages: projectData.galleryImages.create,
      });

      if (result && result.success) {
        // Handle success (e.g., show a success message, reset form, etc.)
        success = true;
      } else {
        // Handle error
        console.error("Failed to create project:", result?.error);
        success = false;
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      success = false;
    } finally {
      setIsLoading(false);
      router.push("/admin/project-manager?success=" + success);
    }
  };

  return (
    <div className="admin-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-5">
            <div>
              <label htmlFor="title" className="sr-only">
                Title
              </label>
              <input
                {...register("title")}
                id="title"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Title"
              />
            </div>
            <div>
              <label htmlFor="description" className="sr-only">
                Description
              </label>
              <textarea
                {...register("description")}
                id="description"
                required
                rows={3}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Description"
              />
            </div>
            <div>
              <label htmlFor="problem" className="sr-only">
                Problem
              </label>
              <textarea
                {...register("problem")}
                id="problem"
                required
                rows={3}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Problem"
              />
            </div>
            <div>
              <label htmlFor="solution" className="sr-only">
                Solution
              </label>
              <textarea
                {...register("solution")}
                id="solution"
                required
                rows={3}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Solution"
              />
            </div>
            <div>
              <label htmlFor="story" className="sr-only">
                Story
              </label>
              <textarea
                {...register("story")}
                id="story"
                required
                rows={3}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Story"
              />
            </div>
            <div>
              <label htmlFor="technologies" className="sr-only">
                Technologies
              </label>
              <input
                {...register("technologies")}
                id="technologies"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Technologies (comma-separated)"
              />
            </div>
            <div>
              <label htmlFor="githubUrl" className="sr-only">
                GitHub URL
              </label>
              <input
                {...register("githubUrl")}
                id="githubUrl"
                type="url"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="GitHub URL"
              />
            </div>
            <div>
              <label htmlFor="liveUrl" className="sr-only">
                Live URL
              </label>
              <input
                {...register("liveUrl")}
                id="liveUrl"
                type="url"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Live URL (optional)"
              />
            </div>
            <div>
              <label htmlFor="featuredImageSrc" className="sr-only">
                Featured Image
              </label>
              <Controller
                name="featuredImageSrc"
                control={control}
                render={({ field: { onChange, onBlur } }) => (
                  <input
                    id="featuredImageSrc"
                    type="file"
                    onChange={(e) => onChange(e.target.files?.[0])}
                    onBlur={onBlur}
                    accept="image/jpeg,image/png,image/webp"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  />
                )}
              />
            </div>
            <div>
              <label htmlFor="featuredImageAlt" className="sr-only">
                Featured Image Alt Text
              </label>
              <input
                {...register("featuredImageAlt")}
                id="featuredImageAlt"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Featured Image Alt Text"
              />
            </div>
            <div>
              <label htmlFor="galleryImages" className="sr-only">
                Gallery Images
              </label>
              <Controller
                name="galleryImages"
                control={control}
                render={({ field: { onChange, onBlur } }) => (
                  <input
                    id="galleryImages"
                    type="file"
                    onChange={(e) => onChange(Array.from(e.target.files || []))}
                    onBlur={onBlur}
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              {...register("featured")}
              id="featured"
              type="checkbox"
              className="size-4 rounded border-gray-300 accent-teal-700"
            />
            <label
              htmlFor="featured"
              className="ml-2 block text-sm text-gray-900"
            >
              Featured Project
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="admin-button w-full"
            >
              {isLoading ? "Submitting..." : "Submit Project"}
            </button>
          </div>
        </form>
    </div>
  );
}
