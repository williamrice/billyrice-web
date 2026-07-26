"use server";

import prisma from "@/lib/prisma";
import { getAllowedAdminSession } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

async function requireOwner() {
  const session = await getAllowedAdminSession();
  if (!session) throw new Error("Unauthorized");
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function profileId(formData: FormData) {
  const id = value(formData, "profileId");
  if (!id) throw new Error("Resume version is required");
  return id;
}

function nullableDate(formData: FormData, key: string) {
  const date = value(formData, key);
  return date ? new Date(`${date}T12:00:00Z`) : null;
}

function refreshResume() {
  revalidatePath("/resume");
  revalidatePath("/admin");
  revalidatePath("/admin/resume");
  revalidatePath("/admin/settings");
}

export async function saveProfile(formData: FormData) {
  await requireOwner();
  const id = profileId(formData);
  const data = profileSchema.parse({
    label: value(formData, "label"),
    slug: value(formData, "slug"),
    name: value(formData, "name"),
    headline: value(formData, "headline"),
    introduction: value(formData, "introduction"),
    location: value(formData, "location"),
    email: value(formData, "email"),
    availability: value(formData, "availability"),
    published: formData.get("published") === "on",
  });
  await prisma.professionalProfile.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  });
  refreshResume();
}

export async function duplicateProfile(formData: FormData) {
  await requireOwner();
  const data = duplicateProfileSchema.parse({
    sourceProfileId: value(formData, "sourceProfileId"),
    label: value(formData, "label"),
    slug: value(formData, "slug"),
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
  refreshResume();
  redirect(`/admin/resume?profile=${created.id}&saved=true`);
}

export async function addPosition(formData: FormData) {
  await requireOwner();
  const targetProfileId = profileId(formData);
  const data = positionSchema.parse({
    organizationName: value(formData, "organizationName"),
    organizationLocation: value(formData, "organizationLocation"),
    organizationUrl: value(formData, "organizationUrl"),
    title: value(formData, "title"),
    kind: value(formData, "kind"),
    startDate: new Date(`${value(formData, "startDate")}T12:00:00Z`),
    endDate: nullableDate(formData, "endDate"),
    summary: value(formData, "summary"),
    sortOrder: value(formData, "sortOrder"),
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
  refreshResume();
}

export async function addAccomplishment(formData: FormData) {
  await requireOwner();
  const data = accomplishmentSchema.parse({
    positionId: value(formData, "positionId"),
    statement: value(formData, "statement"),
    sortOrder: value(formData, "sortOrder"),
  });
  await prisma.careerAccomplishment.create({ data });
  refreshResume();
}

export async function updatePosition(formData: FormData) {
  await requireOwner();
  const id = value(formData, "id");
  const data = positionSchema.parse({
    organizationName: value(formData, "organizationName"),
    organizationLocation: value(formData, "organizationLocation"),
    organizationUrl: value(formData, "organizationUrl"),
    title: value(formData, "title"),
    kind: value(formData, "kind"),
    startDate: new Date(`${value(formData, "startDate")}T12:00:00Z`),
    endDate: nullableDate(formData, "endDate"),
    summary: value(formData, "summary"),
    sortOrder: value(formData, "sortOrder"),
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
  refreshResume();
}

export async function updateAccomplishment(formData: FormData) {
  await requireOwner();
  const id = value(formData, "id");
  const data = accomplishmentSchema.omit({ positionId: true }).parse({
    statement: value(formData, "statement"),
    sortOrder: value(formData, "sortOrder"),
  });
  await prisma.careerAccomplishment.update({ where: { id }, data });
  refreshResume();
}

export async function addSkill(formData: FormData) {
  await requireOwner();
  const targetProfileId = profileId(formData);
  const data = skillSchema.parse({
    name: value(formData, "name"),
    category: value(formData, "category"),
    summary: value(formData, "summary"),
    sortOrder: value(formData, "sortOrder"),
  });
  await prisma.professionalSkill.upsert({
    where: { profileId_name: { profileId: targetProfileId, name: data.name } },
    create: { profileId: targetProfileId, ...data },
    update: data,
  });
  refreshResume();
}

export async function updateSkill(formData: FormData) {
  await requireOwner();
  const id = value(formData, "id");
  const data = skillSchema.parse({
    name: value(formData, "name"),
    category: value(formData, "category"),
    summary: value(formData, "summary"),
    sortOrder: value(formData, "sortOrder"),
  });
  await prisma.professionalSkill.update({ where: { id }, data });
  refreshResume();
}

export async function addEducation(formData: FormData) {
  await requireOwner();
  const targetProfileId = profileId(formData);
  const data = educationSchema.parse({
    institution: value(formData, "institution"),
    credential: value(formData, "credential"),
    field: value(formData, "field"),
    completedAt: nullableDate(formData, "completedAt"),
    sortOrder: value(formData, "sortOrder"),
  });
  await prisma.educationRecord.create({ data: { profileId: targetProfileId, ...data } });
  refreshResume();
}

export async function updateEducation(formData: FormData) {
  await requireOwner();
  const id = value(formData, "id");
  const data = educationSchema.parse({
    institution: value(formData, "institution"),
    credential: value(formData, "credential"),
    field: value(formData, "field"),
    completedAt: nullableDate(formData, "completedAt"),
    sortOrder: value(formData, "sortOrder"),
  });
  await prisma.educationRecord.update({ where: { id }, data });
  refreshResume();
}

export async function addCredential(formData: FormData) {
  await requireOwner();
  const targetProfileId = profileId(formData);
  const data = credentialSchema.parse({
    name: value(formData, "name"),
    issuer: value(formData, "issuer"),
    issuedAt: nullableDate(formData, "issuedAt"),
    url: value(formData, "url"),
    sortOrder: value(formData, "sortOrder"),
  });
  await prisma.credential.create({ data: { profileId: targetProfileId, ...data } });
  refreshResume();
}

export async function updateCredential(formData: FormData) {
  await requireOwner();
  const id = value(formData, "id");
  const data = credentialSchema.parse({
    name: value(formData, "name"),
    issuer: value(formData, "issuer"),
    issuedAt: nullableDate(formData, "issuedAt"),
    url: value(formData, "url"),
    sortOrder: value(formData, "sortOrder"),
  });
  await prisma.credential.update({ where: { id }, data });
  refreshResume();
}

export async function addResumeProject(formData: FormData) {
  await requireOwner();
  const targetProfileId = profileId(formData);
  const { projectId, sortOrder, note } = resumeProjectSchema.parse({
    projectId: value(formData, "projectId"),
    sortOrder: value(formData, "sortOrder"),
    note: value(formData, "note"),
  });
  await prisma.resumeProjectSelection.upsert({
    where: { profileId_projectId: { profileId: targetProfileId, projectId } },
    create: { profileId: targetProfileId, projectId, sortOrder, note },
    update: { sortOrder, note },
  });
  refreshResume();
}

export async function updateResumeProject(formData: FormData) {
  await requireOwner();
  const id = value(formData, "id");
  const data = resumeProjectSchema.omit({ projectId: true }).parse({
    sortOrder: value(formData, "sortOrder"),
    note: value(formData, "note"),
  });
  await prisma.resumeProjectSelection.update({ where: { id }, data });
  refreshResume();
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
  await requireOwner();
  const kind = value(formData, "kind") as keyof typeof deletableModels;
  const id = value(formData, "id");
  if (!deletableModels[kind] || !id) throw new Error("Invalid delete request");

  if (kind === "position") await prisma.careerPosition.delete({ where: { id } });
  if (kind === "accomplishment") await prisma.careerAccomplishment.delete({ where: { id } });
  if (kind === "skill") await prisma.professionalSkill.delete({ where: { id } });
  if (kind === "education") await prisma.educationRecord.delete({ where: { id } });
  if (kind === "credential") await prisma.credential.delete({ where: { id } });
  if (kind === "project") await prisma.resumeProjectSelection.delete({ where: { id } });
  refreshResume();
}
