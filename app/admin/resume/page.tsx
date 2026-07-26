import Link from "next/link";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { getResumeAdmin, getResumeProfiles, getResumeProjectOptions } from "@/features/resume/queries/resume";
import {
  addAccomplishment,
  addCredential,
  addEducation,
  addPosition,
  addSkill,
  addResumeProject,
  deleteResumeItem,
  duplicateProfile,
  saveProfile,
  updateAccomplishment,
  updateCredential,
  updateEducation,
  updatePosition,
  updateResumeProject,
  updateSkill,
} from "@/features/resume/commands/resume";

const inputClass = "admin-field";
const textareaClass = `${inputClass} min-h-24 py-2`;
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600";
const cardClass = "admin-card";
const buttonClass = "admin-button";
const editClass = "mt-5 border-t border-gray-100 pt-4 [&_summary]:cursor-pointer [&_summary]:text-sm [&_summary]:font-medium [&_summary]:text-teal-800";

function dateValue(date: Date | null) {
  return date?.toISOString().slice(0, 10) ?? "";
}

function Field({ label, name, type = "text", defaultValue, required = false }: { label: string; name: string; type?: string; defaultValue?: string | number | null; required?: boolean }) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      <input className={inputClass} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} />
    </label>
  );
}

function DeleteButton({ kind, id }: { kind: string; id: string }) {
  return (
    <form action={deleteResumeItem}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <button className="grid size-9 place-items-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-700" aria-label={`Delete ${kind}`}>
        <Trash2 className="size-4" />
      </button>
    </form>
  );
}

export default async function ResumeAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ profile?: string }>;
}) {
  const { profile: requestedProfileId } = await searchParams;
  const profiles = await getResumeProfiles();
  const selectedProfileId = requestedProfileId ?? profiles[0]?.id ?? "primary";
  const [resume, projectOptions] = await Promise.all([
    getResumeAdmin(selectedProfileId),
    getResumeProjectOptions(),
  ]);

  return (
    <div className="admin-page max-w-6xl">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Professional narrative</p>
          <h1>Resume studio</h1>
          <p className="mt-3 max-w-2xl text-gray-600">Manage canonical career records. Changes appear on the public resume immediately when published.</p>
        </div>
        <Link href="/resume" target="_blank" className="inline-flex items-center gap-2 text-sm font-medium text-teal-800">
          View public resume <ExternalLink className="size-4" />
        </Link>
      </div>

      {profiles.length > 0 && (
        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Resume versions</h2>
              <p className="mt-1 text-sm text-gray-500">Edit a version here, then choose the public version in Settings.</p>
            </div>
            <Link className="text-sm font-medium text-teal-800" href="/admin/settings">Public version setting</Link>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2" aria-label="Resume versions">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/admin/resume?profile=${profile.id}`}
                className={`rounded-md border px-3 py-2 text-sm ${profile.id === selectedProfileId ? "border-teal-700 bg-teal-50 text-teal-900" : "border-gray-200 hover:border-teal-400"}`}
              >
                {profile.label}{profile.published ? "" : " · Draft"}
              </Link>
            ))}
          </nav>
          {resume && (
            <details className={editClass}>
              <summary>Duplicate this version</summary>
              <form action={duplicateProfile} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                <input type="hidden" name="sourceProfileId" value={resume.id} />
                <Field label="Version label" name="label" required />
                <Field label="Version slug" name="slug" required />
                <button className={`${buttonClass} self-end`}><Plus className="size-4" /> Duplicate</button>
              </form>
            </details>
          )}
        </section>
      )}

      <section className={cardClass}>
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-gray-500">The positioning and introduction at the top of the public page.</p>
        <form action={saveProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
          <input type="hidden" name="profileId" value={selectedProfileId} />
          <Field label="Version label" name="label" defaultValue={resume?.label ?? "Primary"} required />
          <Field label="Version slug" name="slug" defaultValue={resume?.slug ?? "primary"} required />
          <Field label="Name" name="name" defaultValue={resume?.name ?? "Billy Rice"} required />
          <Field label="Location" name="location" defaultValue={resume?.location ?? "Lexington, Kentucky"} required />
          <label className="sm:col-span-2"><span className={labelClass}>Headline</span><input className={inputClass} name="headline" defaultValue={resume?.headline ?? "Software engineer, applied AI implementer, and technical leader"} required /></label>
          <label className="sm:col-span-2"><span className={labelClass}>Introduction</span><textarea className={textareaClass} name="introduction" defaultValue={resume?.introduction ?? "I build production software, integrate AI where it creates real leverage, and lead teams through consequential technical decisions."} required /></label>
          <Field label="Public email" name="email" type="email" defaultValue={resume?.email} />
          <Field label="Availability note" name="availability" defaultValue={resume?.availability} />
          <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" name="published" defaultChecked={resume?.published ?? true} className="size-4 accent-teal-700" /> Published</label>
          <div className="sm:text-right"><button className={buttonClass}>Save profile</button></div>
        </form>
      </section>

      {!resume ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">Save the profile first to initialize the resume, then add career records.</div>
      ) : (
        <>
          <section>
            <div className="mb-5"><h2 className="text-2xl font-semibold">Experience</h2><p className="text-sm text-gray-500">Work, civic leadership, and public service belong in one chronological narrative.</p></div>
            <div className="space-y-4">
              {resume.positions.map((position) => (
                <article key={position.id} className={cardClass}>
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{position.kind}</p><h3 className="mt-1 text-lg font-semibold">{position.title}</h3><p className="text-sm text-gray-500">{position.organization.name}</p></div>
                    <DeleteButton kind="position" id={position.id} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">{position.summary}</p>
                  <details className={editClass}>
                    <summary>Edit experience</summary>
                    <form action={updatePosition} className="mt-4 grid gap-4 sm:grid-cols-2">
                      <input type="hidden" name="id" value={position.id} />
                      <Field label="Organization" name="organizationName" defaultValue={position.organization.name} required />
                      <Field label="Organization location" name="organizationLocation" defaultValue={position.organization.location} />
                      <Field label="Organization URL" name="organizationUrl" type="url" defaultValue={position.organization.url} />
                      <Field label="Title" name="title" defaultValue={position.title} required />
                      <label><span className={labelClass}>Type</span><select className={inputClass} name="kind" defaultValue={position.kind}><option value="work">Work</option><option value="leadership">Leadership</option><option value="service">Service</option></select></label>
                      <Field label="Start date" name="startDate" type="date" defaultValue={dateValue(position.startDate)} required />
                      <Field label="End date" name="endDate" type="date" defaultValue={dateValue(position.endDate)} />
                      <Field label="Display order" name="sortOrder" type="number" defaultValue={position.sortOrder} />
                      <label className="sm:col-span-2"><span className={labelClass}>Summary</span><textarea className={textareaClass} name="summary" defaultValue={position.summary} required /></label>
                      <div className="sm:col-span-2"><button className={buttonClass}>Save experience</button></div>
                    </form>
                  </details>
                  <div className="mt-5 space-y-2">
                    {position.accomplishments.map((item) => (
                      <details key={item.id} className="rounded-md bg-gray-50 p-3 text-sm">
                        <summary className="cursor-pointer">{item.statement}</summary>
                        <form action={updateAccomplishment} className="mt-3 grid gap-3 sm:grid-cols-[1fr_6rem_auto]">
                          <input type="hidden" name="id" value={item.id} />
                          <input className={inputClass} name="statement" defaultValue={item.statement} required />
                          <input className={inputClass} name="sortOrder" type="number" defaultValue={item.sortOrder} aria-label="Order" />
                          <button className={buttonClass}>Save</button>
                        </form>
                        <div className="mt-2"><DeleteButton kind="accomplishment" id={item.id} /></div>
                      </details>
                    ))}
                  </div>
                  <form action={addAccomplishment} className="mt-4 grid gap-3 sm:grid-cols-[1fr_6rem_auto]">
                    <input type="hidden" name="positionId" value={position.id} />
                    <input className={inputClass} name="statement" placeholder="Add a measurable outcome or leadership contribution" required />
                    <input className={inputClass} name="sortOrder" type="number" defaultValue={position.accomplishments.length} aria-label="Order" />
                    <button className={buttonClass}><Plus className="size-4" /> Add</button>
                  </form>
                </article>
              ))}
            </div>
            <form action={addPosition} className={`${cardClass} mt-5 grid gap-4 sm:grid-cols-2`}>
              <input type="hidden" name="profileId" value={resume.id} />
              <h3 className="text-lg font-semibold sm:col-span-2">Add experience</h3>
              <Field label="Organization" name="organizationName" required />
              <Field label="Location" name="organizationLocation" />
              <Field label="Organization URL" name="organizationUrl" type="url" />
              <Field label="Title" name="title" required />
              <label><span className={labelClass}>Type</span><select className={inputClass} name="kind"><option value="work">Work</option><option value="leadership">Leadership</option><option value="service">Service</option></select></label>
              <Field label="Display order" name="sortOrder" type="number" defaultValue={resume.positions.length} />
              <Field label="Start date" name="startDate" type="date" required />
              <Field label="End date" name="endDate" type="date" />
              <label className="sm:col-span-2"><span className={labelClass}>Summary</span><textarea className={textareaClass} name="summary" required /></label>
              <div className="sm:col-span-2"><button className={buttonClass}><Plus className="size-4" /> Add experience</button></div>
            </form>
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-5 text-2xl font-semibold">Capabilities</h2>
              <div className={`${cardClass} space-y-2`}>
                {resume.skills.map((skill) => <details key={skill.id} className="border-b border-gray-100 py-3 last:border-0"><summary className="flex cursor-pointer list-none items-center justify-between"><span><span className="font-medium">{skill.name}</span><span className="ml-2 text-xs text-gray-500">{skill.category}</span></span></summary><form action={updateSkill} className="mt-4 grid gap-3"><input type="hidden" name="id" value={skill.id} /><Field label="Capability" name="name" defaultValue={skill.name} required /><label><span className={labelClass}>Category</span><select className={inputClass} name="category" defaultValue={skill.category}>{["Implementation", "Architecture", "Applied AI", "Leadership", "Platform"].map((item) => <option key={item}>{item}</option>)}</select></label><Field label="Context" name="summary" defaultValue={skill.summary} /><Field label="Order" name="sortOrder" type="number" defaultValue={skill.sortOrder} /><button className={buttonClass}>Save</button></form><div className="mt-3"><DeleteButton kind="skill" id={skill.id} /></div></details>)}
              </div>
              <form action={addSkill} className={`${cardClass} mt-4 grid gap-4`}>
                <input type="hidden" name="profileId" value={resume.id} />
                <Field label="Capability" name="name" required />
                <label><span className={labelClass}>Category</span><select className={inputClass} name="category">{["Implementation", "Architecture", "Applied AI", "Leadership", "Platform"].map((item) => <option key={item}>{item}</option>)}</select></label>
                <Field label="Short context" name="summary" />
                <Field label="Display order" name="sortOrder" type="number" defaultValue={resume.skills.length} />
                <button className={buttonClass}><Plus className="size-4" /> Add capability</button>
              </form>
            </div>

            <div>
              <h2 className="mb-5 text-2xl font-semibold">Education</h2>
              <div className={`${cardClass} space-y-3`}>
                {resume.education.map((item) => <details key={item.id} className="border-b border-gray-100 py-3 last:border-0"><summary className="cursor-pointer font-medium">{item.credential}, {item.field}<span className="ml-2 text-sm font-normal text-gray-500">{item.institution}</span></summary><form action={updateEducation} className="mt-4 grid gap-3"><input type="hidden" name="id" value={item.id} /><Field label="Institution" name="institution" defaultValue={item.institution} required /><Field label="Credential" name="credential" defaultValue={item.credential} required /><Field label="Field" name="field" defaultValue={item.field} required /><Field label="Completed" name="completedAt" type="date" defaultValue={dateValue(item.completedAt)} /><Field label="Order" name="sortOrder" type="number" defaultValue={item.sortOrder} /><button className={buttonClass}>Save</button></form><div className="mt-3"><DeleteButton kind="education" id={item.id} /></div></details>)}
              </div>
              <form action={addEducation} className={`${cardClass} mt-4 grid gap-4`}>
                <input type="hidden" name="profileId" value={resume.id} />
                <Field label="Institution" name="institution" required />
                <Field label="Credential" name="credential" required />
                <Field label="Field" name="field" required />
                <Field label="Completed" name="completedAt" type="date" />
                <Field label="Display order" name="sortOrder" type="number" defaultValue={resume.education.length} />
                <button className={buttonClass}><Plus className="size-4" /> Add education</button>
              </form>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-2xl font-semibold">Credentials</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {resume.credentials.map((item) => <details key={item.id} className={cardClass}><summary className="cursor-pointer font-medium">{item.name}<span className="ml-2 text-sm font-normal text-gray-500">{item.issuer}</span></summary><form action={updateCredential} className="mt-4 grid gap-3"><input type="hidden" name="id" value={item.id} /><Field label="Credential" name="name" defaultValue={item.name} required /><Field label="Issuer" name="issuer" defaultValue={item.issuer} required /><Field label="Issued" name="issuedAt" type="date" defaultValue={dateValue(item.issuedAt)} /><Field label="URL" name="url" type="url" defaultValue={item.url} /><Field label="Order" name="sortOrder" type="number" defaultValue={item.sortOrder} /><button className={buttonClass}>Save</button></form><div className="mt-3"><DeleteButton kind="credential" id={item.id} /></div></details>)}
            </div>
            <form action={addCredential} className={`${cardClass} mt-4 grid gap-4 sm:grid-cols-2`}>
              <input type="hidden" name="profileId" value={resume.id} />
              <Field label="Credential" name="name" required />
              <Field label="Issuer" name="issuer" required />
              <Field label="Issued" name="issuedAt" type="date" />
              <Field label="Verification URL" name="url" type="url" />
              <Field label="Display order" name="sortOrder" type="number" defaultValue={resume.credentials.length} />
              <div className="self-end"><button className={buttonClass}><Plus className="size-4" /> Add credential</button></div>
            </form>
          </section>

          <section>
            <h2 className="mb-5 text-2xl font-semibold">Selected projects</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {resume.projects.map((selection) => <details key={selection.id} className={cardClass}><summary className="cursor-pointer font-medium">{selection.project.title}</summary><form action={updateResumeProject} className="mt-4 grid gap-3"><input type="hidden" name="id" value={selection.id} /><Field label="Display order" name="sortOrder" type="number" defaultValue={selection.sortOrder} /><label><span className={labelClass}>Resume context</span><textarea className={textareaClass} name="note" defaultValue={selection.note ?? ""} /></label><button className={buttonClass}>Save</button></form><div className="mt-3"><DeleteButton kind="project" id={selection.id} /></div></details>)}
            </div>
            <form action={addResumeProject} className={`${cardClass} mt-4 grid gap-4 sm:grid-cols-2`}>
              <input type="hidden" name="profileId" value={resume.id} />
              <label><span className={labelClass}>Canonical project</span><select className={inputClass} name="projectId" required><option value="">Choose a project</option>{projectOptions.map((project) => <option value={project.id} key={project.id}>{project.title}</option>)}</select></label>
              <Field label="Display order" name="sortOrder" type="number" defaultValue={resume.projects.length} />
              <label className="sm:col-span-2"><span className={labelClass}>Resume context</span><textarea className={textareaClass} name="note" placeholder="Why this project matters in the professional narrative" /></label>
              <div className="sm:col-span-2"><button className={buttonClass}><Plus className="size-4" /> Add project</button></div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
