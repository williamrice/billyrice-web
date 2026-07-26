"use server";

import prisma from "@/lib/prisma";
import { requireAllowedAdminSession } from "@/lib/auth-guards";
import { redirect } from "next/navigation";
import { revalidateResumeContent } from "@/lib/utils/cache-invalidation";
import { getFormString, requireFormString } from "@/lib/utils/form-data";
import { parseOptionalDateInput } from "@/lib/utils/dates";
import {
  accomplishmentSchema,
  credentialSchema,
  duplicateProfileSchema,
  educationSchema,
  positionSchema,
  profileSchema,
  resumeProjectSchema,
  skillSchema,
} from "../schemas/resume";

export async function saveProfile(formData: FormData) {
  await requireAllowedAdminSession();
  const id = requireFormString(formData, "profileId", "Resume version is required");
  const data = profileSchema.parse({
    label: getFormString(formData, "label"),
    slug: getFormString(formData, "slug"),
    name: getFormString(formData, "name"),
    headline: getFormString(formData, "headline"),
    introduction: getFormString(formData, "introduction"),
    location: getFormString(formData, "location"),
    email: getFormString(formData, "email"),
    availability: getFormString(formData, "availability"),
    published: formData.get("published") === "on",
  });
  await prisma.professionalProfile.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  });
  revalidateResumeContent();
}

export async function duplicateProfile(formData: FormData) {
  await requireAllowedAdminSession();
  const data = duplicateProfileSchema.parse({
    sourceProfileId: getFormString(formData, "sourceProfileId"),
    label: getFormString(formData, "label"),
    slug: getFormString(formData, "slug"),
  });
  const source = await prisma.professionalProfile.findUnique({
    where: { id: data.sourceProfileId },
    include: {
      positions: { include: { accomplishments: true } },
      skills: true,
      education: true,
      credentials: true,
      projects: true,
    },
  });
  if (!source) throw new Error("Source resume version not found");

  const created = await prisma.$transaction(async (transaction) => {
    const profile = await transaction.professionalProfile.create({
      data: {
        label: data.label,
        slug: data.slug,
        name: source.name,
        headline: source.headline,
        introduction: source.introduction,
        location: source.location,
        email: source.email,
        availability: source.availability,
        published: false,
      },
    });
    for (const position of source.positions) {
      await transaction.careerPosition.create({
        data: {
          profileId: profile.id,
          organizationId: position.organizationId,
          title: position.title,
          kind: position.kind,
          startDate: position.startDate,
          endDate: position.endDate,
          summary: position.summary,
          sortOrder: position.sortOrder,
          featured: position.featured,
          accomplishments: {
            create: position.accomplishments.map(({ statement, sortOrder }) => ({
              statement,
              sortOrder,
            })),
          },
        },
      });
    }
    if (source.skills.length) {
      await transaction.professionalSkill.createMany({
        data: source.skills.map(({ name, category, summary, sortOrder }) => ({
          profileId: profile.id, name, category, summary, sortOrder,
        })),
      });
    }
    if (source.education.length) {
      await transaction.educationRecord.createMany({
        data: source.education.map(({ institution, credential, field, completedAt, sortOrder }) => ({
          profileId: profile.id, institution, credential, field, completedAt, sortOrder,
        })),
      });
    }
    if (source.credentials.length) {
      await transaction.credential.createMany({
        data: source.credentials.map(({ name, issuer, issuedAt, url, sortOrder }) => ({
          profileId: profile.id, name, issuer, issuedAt, url, sortOrder,
        })),
      });
    }
    if (source.projects.length) {
      await transaction.resumeProjectSelection.createMany({
        data: source.projects.map(({ projectId, sortOrder, note }) => ({
          profileId: profile.id, projectId, sortOrder, note,
        })),
      });
    }
    return profile;
  });
  revalidateResumeContent();
  redirect(`/admin/resume?profile=${created.id}&saved=true`);
}

export async function addPosition(formData: FormData) {
  await requireAllowedAdminSession();
  const targetProfileId = requireFormString(formData, "profileId", "Resume version is required");
  const data = positionSchema.parse({
    organizationName: getFormString(formData, "organizationName"),
    organizationLocation: getFormString(formData, "organizationLocation"),
    organizationUrl: getFormString(formData, "organizationUrl"),
    title: getFormString(formData, "title"),
    kind: getFormString(formData, "kind"),
    startDate: new Date(`${getFormString(formData, "startDate")}T12:00:00Z`),
    endDate: parseOptionalDateInput(getFormString(formData, "endDate")),
    summary: getFormString(formData, "summary"),
    sortOrder: getFormString(formData, "sortOrder"),
  });
  await prisma.$transaction(async (transaction) => {
    const organization = await transaction.organization.upsert({
      where: { name: data.organizationName },
      create: { name: data.organizationName, location: data.organizationLocation, url: data.organizationUrl },
      update: { location: data.organizationLocation, url: data.organizationUrl },
    });
    await transaction.careerPosition.create({
      data: {
        profileId: targetProfileId,
        organizationId: organization.id,
        title: data.title,
        kind: data.kind,
        startDate: data.startDate,
        endDate: data.endDate,
        summary: data.summary,
        sortOrder: data.sortOrder,
      },
    });
  });
  revalidateResumeContent();
}

export async function addAccomplishment(formData: FormData) {
  await requireAllowedAdminSession();
  const data = accomplishmentSchema.parse({
    positionId: getFormString(formData, "positionId"),
    statement: getFormString(formData, "statement"),
    sortOrder: getFormString(formData, "sortOrder"),
  });
  await prisma.careerAccomplishment.create({ data });
  revalidateResumeContent();
}

export async function updatePosition(formData: FormData) {
  await requireAllowedAdminSession();
  const id = getFormString(formData, "id");
  const data = positionSchema.parse({
    organizationName: getFormString(formData, "organizationName"),
    organizationLocation: getFormString(formData, "organizationLocation"),
    organizationUrl: getFormString(formData, "organizationUrl"),
    title: getFormString(formData, "title"),
    kind: getFormString(formData, "kind"),
    startDate: new Date(`${getFormString(formData, "startDate")}T12:00:00Z`),
    endDate: parseOptionalDateInput(getFormString(formData, "endDate")),
    summary: getFormString(formData, "summary"),
    sortOrder: getFormString(formData, "sortOrder"),
  });
  await prisma.$transaction(async (transaction) => {
    const organization = await transaction.organization.upsert({
      where: { name: data.organizationName },
      create: { name: data.organizationName, location: data.organizationLocation, url: data.organizationUrl },
      update: { location: data.organizationLocation, url: data.organizationUrl },
    });
    await transaction.careerPosition.update({
      where: { id },
      data: {
        organizationId: organization.id,
        title: data.title,
        kind: data.kind,
        startDate: data.startDate,
        endDate: data.endDate,
        summary: data.summary,
        sortOrder: data.sortOrder,
      },
    });
  });
  revalidateResumeContent();
}

export async function updateAccomplishment(formData: FormData) {
  await requireAllowedAdminSession();
  const id = getFormString(formData, "id");
  const data = accomplishmentSchema.omit({ positionId: true }).parse({
    statement: getFormString(formData, "statement"),
    sortOrder: getFormString(formData, "sortOrder"),
  });
  await prisma.careerAccomplishment.update({ where: { id }, data });
  revalidateResumeContent();
}

export async function addSkill(formData: FormData) {
  await requireAllowedAdminSession();
  const targetProfileId = requireFormString(formData, "profileId", "Resume version is required");
  const data = skillSchema.parse({
    name: getFormString(formData, "name"),
    category: getFormString(formData, "category"),
    summary: getFormString(formData, "summary"),
    sortOrder: getFormString(formData, "sortOrder"),
  });
  await prisma.professionalSkill.upsert({
    where: { profileId_name: { profileId: targetProfileId, name: data.name } },
    create: { profileId: targetProfileId, ...data },
    update: data,
  });
  revalidateResumeContent();
}

export async function updateSkill(formData: FormData) {
  await requireAllowedAdminSession();
  const id = getFormString(formData, "id");
  const data = skillSchema.parse({
    name: getFormString(formData, "name"),
    category: getFormString(formData, "category"),
    summary: getFormString(formData, "summary"),
    sortOrder: getFormString(formData, "sortOrder"),
  });
  await prisma.professionalSkill.update({ where: { id }, data });
  revalidateResumeContent();
}

export async function addEducation(formData: FormData) {
  await requireAllowedAdminSession();
  const targetProfileId = requireFormString(formData, "profileId", "Resume version is required");
  const data = educationSchema.parse({
    institution: getFormString(formData, "institution"),
    credential: getFormString(formData, "credential"),
    field: getFormString(formData, "field"),
    completedAt: parseOptionalDateInput(getFormString(formData, "completedAt")),
    sortOrder: getFormString(formData, "sortOrder"),
  });
  await prisma.educationRecord.create({ data: { profileId: targetProfileId, ...data } });
  revalidateResumeContent();
}

export async function updateEducation(formData: FormData) {
  await requireAllowedAdminSession();
  const id = getFormString(formData, "id");
  const data = educationSchema.parse({
    institution: getFormString(formData, "institution"),
    credential: getFormString(formData, "credential"),
    field: getFormString(formData, "field"),
    completedAt: parseOptionalDateInput(getFormString(formData, "completedAt")),
    sortOrder: getFormString(formData, "sortOrder"),
  });
  await prisma.educationRecord.update({ where: { id }, data });
  revalidateResumeContent();
}

export async function addCredential(formData: FormData) {
  await requireAllowedAdminSession();
  const targetProfileId = requireFormString(formData, "profileId", "Resume version is required");
  const data = credentialSchema.parse({
    name: getFormString(formData, "name"),
    issuer: getFormString(formData, "issuer"),
    issuedAt: parseOptionalDateInput(getFormString(formData, "issuedAt")),
    url: getFormString(formData, "url"),
    sortOrder: getFormString(formData, "sortOrder"),
  });
  await prisma.credential.create({ data: { profileId: targetProfileId, ...data } });
  revalidateResumeContent();
}

export async function updateCredential(formData: FormData) {
  await requireAllowedAdminSession();
  const id = getFormString(formData, "id");
  const data = credentialSchema.parse({
    name: getFormString(formData, "name"),
    issuer: getFormString(formData, "issuer"),
    issuedAt: parseOptionalDateInput(getFormString(formData, "issuedAt")),
    url: getFormString(formData, "url"),
    sortOrder: getFormString(formData, "sortOrder"),
  });
  await prisma.credential.update({ where: { id }, data });
  revalidateResumeContent();
}

export async function addResumeProject(formData: FormData) {
  await requireAllowedAdminSession();
  const targetProfileId = requireFormString(formData, "profileId", "Resume version is required");
  const { projectId, sortOrder, note } = resumeProjectSchema.parse({
    projectId: getFormString(formData, "projectId"),
    sortOrder: getFormString(formData, "sortOrder"),
    note: getFormString(formData, "note"),
  });
  await prisma.resumeProjectSelection.upsert({
    where: { profileId_projectId: { profileId: targetProfileId, projectId } },
    create: { profileId: targetProfileId, projectId, sortOrder, note },
    update: { sortOrder, note },
  });
  revalidateResumeContent();
}

export async function updateResumeProject(formData: FormData) {
  await requireAllowedAdminSession();
  const id = getFormString(formData, "id");
  const data = resumeProjectSchema.omit({ projectId: true }).parse({
    sortOrder: getFormString(formData, "sortOrder"),
    note: getFormString(formData, "note"),
  });
  await prisma.resumeProjectSelection.update({ where: { id }, data });
  revalidateResumeContent();
}

const deletableModels = {
  position: "careerPosition",
  accomplishment: "careerAccomplishment",
  skill: "professionalSkill",
  education: "educationRecord",
  credential: "credential",
  project: "resumeProjectSelection",
} as const;

export async function deleteResumeItem(formData: FormData) {
  await requireAllowedAdminSession();
  const kind = getFormString(formData, "kind") as keyof typeof deletableModels;
  const id = getFormString(formData, "id");
  if (!deletableModels[kind] || !id) throw new Error("Invalid delete request");

  if (kind === "position") await prisma.careerPosition.delete({ where: { id } });
  if (kind === "accomplishment") await prisma.careerAccomplishment.delete({ where: { id } });
  if (kind === "skill") await prisma.professionalSkill.delete({ where: { id } });
  if (kind === "education") await prisma.educationRecord.delete({ where: { id } });
  if (kind === "credential") await prisma.credential.delete({ where: { id } });
  if (kind === "project") await prisma.resumeProjectSelection.delete({ where: { id } });
  revalidateResumeContent();
}
