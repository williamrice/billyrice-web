export interface GalleryUpload {
  url: string;
  s3Key: string;
}

export interface SecretMessage {
  title: string;
  message: string;
}

export interface Skill {
  name: string;
  icon: LucideIcon;
}

export interface RecaptchaVerificationResponse {
  success: boolean;
  message?: string;
  score?: number;
  action?: string;
}
import type { LucideIcon } from 'lucide-react';
