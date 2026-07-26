-- Rename the post-specific enum so it can be shared by future publishing models.
ALTER TYPE "PostStatus" RENAME TO "PublicationStatus";
