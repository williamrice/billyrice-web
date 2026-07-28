"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProject } from "@/actions/projects";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GalleryImage, Project } from "@/prisma/generated/prisma/client";

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
      "Only .jpg, .png, and .webp formats are supported",
    )
    .optional(),
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
          "Only .jpg, .png, and .webp formats are supported",
        ),
    )
    .max(6, "Maximum 6 gallery images allowed")
    .optional(),
  featured: z.boolean(),
  s3Key: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

interface GalleryUrl {
  imagePath: string;
  s3Key: string | null;
}

interface EditProjectFormProps {
  project: Project & { galleryImages: GalleryImage[] };
}

export default function EditProjectForm({ project }: EditProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState(project.featuredImageSrc);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    project.galleryImages.map((img: GalleryImage) => img.imagePath),
  );

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      ...project,
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      technologies: project.technologies.join(", "),
      featuredImageSrc: undefined,
      galleryImages: undefined,
      s3Key: project.s3Key || "",
    },
  });

  const handleFeaturedImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      form.setValue("featuredImageSrc", file);
    }
  };

  const handleGalleryImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    form.setValue("galleryImages", files);
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    let success = false;
    try {
      // Handle image uploads if new images are provided
      let featuredImageUrl = project.featuredImageSrc;
      let s3Key = project.s3Key;
      if (data.featuredImageSrc) {
        const formData = new FormData();
        formData.append("file", data.featuredImageSrc);
        formData.append(
          "directory",
          `projects/${data.title.toLowerCase().replace(/\s+/g, "-")}`,
        );

        const featuredImageResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const featuredImageUpload = await featuredImageResponse.json();

        if (featuredImageUpload.success) {
          featuredImageUrl = featuredImageUpload.publicUrl;
          s3Key = featuredImageUpload.s3Key;
        }
      }
      // Handle gallery image uploads
      let galleryUrls = project.galleryImages.map((img: GalleryImage) => ({
        imagePath: img.imagePath,
        s3Key: img.s3Key,
      }));
      if (data.galleryImages && data.galleryImages.length > 0) {
        const newGalleryUploads = await Promise.all(
          data.galleryImages.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append(
              "directory",
              `projects/${data.title
                .toLowerCase()
                .replace(/\s+/g, "-")}/gallery`,
            );

            const galleryImageResponse = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            const upload = await galleryImageResponse.json();
            return upload.success ? upload : null;
          }),
        );

        galleryUrls = newGalleryUploads.map((upload) => ({
          imagePath: upload.publicUrl,
          s3Key: upload.s3Key,
        }));
      }

      // Prepare project data for update
      const projectData = {
        ...data,
        id: project.id,
        featuredImageSrc: featuredImageUrl,
        technologies: data.technologies,
        galleryImages: galleryUrls.map((url: GalleryUrl) => ({
          imagePath: url.imagePath,
          s3Key: url.s3Key || "",
        })),
        s3Key: s3Key || "",
      };

      // Update the project
      const result = await updateProject(projectData);

      if (result.success) {
        success = true;
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsLoading(false);
      router.push("/admin/project-manager?success=" + success);
    }
  };

  useEffect(() => {
    // Cleanup function to revoke object URLs
    return () => {
      URL.revokeObjectURL(previewImage);
      galleryPreviews.forEach(URL.revokeObjectURL);
    };
  }, [previewImage, galleryPreviews]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          {...form.register("title")}
          id="title"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          {...form.register("description")}
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {form.formState.errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="problem"
          className="block text-sm font-medium text-gray-700"
        >
          Problem
        </label>
        <textarea
          {...form.register("problem")}
          id="problem"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {form.formState.errors.problem && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.problem.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="solution"
          className="block text-sm font-medium text-gray-700"
        >
          Solution
        </label>
        <textarea
          {...form.register("solution")}
          id="solution"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {form.formState.errors.solution && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.solution.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="story"
          className="block text-sm font-medium text-gray-700"
        >
          Story
        </label>
        <textarea
          {...form.register("story")}
          id="story"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {form.formState.errors.story && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.story.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="technologies"
          className="block text-sm font-medium text-gray-700"
        >
          Technologies
        </label>
        <input
          {...form.register("technologies")}
          id="technologies"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {form.formState.errors.technologies && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.technologies.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="githubUrl"
          className="block text-sm font-medium text-gray-700"
        >
          GitHub URL
        </label>
        <input
          {...form.register("githubUrl")}
          id="githubUrl"
          type="url"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {form.formState.errors.githubUrl && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.githubUrl.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="liveUrl"
          className="block text-sm font-medium text-gray-700"
        >
          Live URL
        </label>
        <input
          {...form.register("liveUrl")}
          id="liveUrl"
          type="url"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {form.formState.errors.liveUrl && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.liveUrl.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="featuredImageSrc"
          className="block text-sm font-medium text-gray-700"
        >
          Replace featured image
        </label>
        <p id="featuredImageSrc-description" className="mt-1 text-xs text-gray-500">
          Optional. Upload one JPEG, PNG, or WebP image up to 5 MB. Leave empty to keep the current image.
        </p>
        <input
          type="file"
          id="featuredImageSrc"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby="featuredImageSrc-description"
          onChange={handleFeaturedImageChange}
          className="mt-1 block w-full"
        />
        {previewImage && (
          <Image
            src={previewImage}
            alt="Featured image preview"
            width={200}
            height={200}
            objectFit="cover"
          />
        )}
        {form.formState.errors.featuredImageSrc && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.featuredImageSrc.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="featuredImageAlt"
          className="block text-sm font-medium text-gray-700"
        >
          Featured Image Alt Text
        </label>
        <input
          {...form.register("featuredImageAlt")}
          id="featuredImageAlt"
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {form.formState.errors.featuredImageAlt && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.featuredImageAlt.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="galleryImages"
          className="block text-sm font-medium text-gray-700"
        >
          Replace gallery images
        </label>
        <p id="galleryImages-description" className="mt-1 text-xs text-gray-500">
          Optional. Upload up to six JPEG, PNG, or WebP images, each no larger than 5 MB. Selecting files replaces the current gallery.
        </p>
        <input
          type="file"
          id="galleryImages"
          accept="image/jpeg,image/png,image/webp"
          multiple
          aria-describedby="galleryImages-description"
          onChange={handleGalleryImagesChange}
          className="mt-1 block w-full"
        />
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {galleryPreviews.map((src, index) => (
            <Image
              key={index}
              src={src}
              alt={`Gallery image ${index + 1}`}
              width={100}
              height={100}
              objectFit="cover"
              style={{ margin: "5px" }}
            />
          ))}
        </div>
        {form.formState.errors.galleryImages && (
          <p className="mt-1 text-sm text-red-600">
            {form.formState.errors.galleryImages.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="featured" className="flex items-center">
          <input
            {...form.register("featured")}
            id="featured"
            type="checkbox"
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          <span className="ml-2 text-sm text-gray-600">Featured Project</span>
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="admin-button w-full"
        >
          {isLoading ? "Updating..." : "Update Project"}
        </button>
      </div>
    </form>
  );
}
