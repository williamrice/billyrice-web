import { setPublicResumeProfile } from "@/features/settings/commands/settings";
import { getPublicResumeProfileId } from "@/features/settings/queries/settings";
import { getResumeProfiles } from "@/features/resume/queries/resume";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const SettingsPage = async () => {
  const [profiles, selectedProfileId] = await Promise.all([
    getResumeProfiles(),
    getPublicResumeProfileId(),
  ]);

  return (
    <div className="admin-page max-w-4xl">
      <AdminPageHeader
        eyebrow="Application configuration"
        title="Settings"
        description="Control site-wide behavior through typed settings stored in PostgreSQL and cached through Redis."
      />

      <section className="admin-card">
        <h2 className="admin-card-title">Public resume version</h2>
        <p className="admin-card-description">Choose which published resume version visitors see at /resume.</p>
        {profiles.length ? (
          <form action={setPublicResumeProfile} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="admin-label">Version</span>
              <select className="admin-field" name="profileId" defaultValue={selectedProfileId ?? ""} required>
                <option value="" disabled>Select a published version</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id} disabled={!profile.published}>
                    {profile.label}{profile.published ? "" : " (draft)"}
                  </option>
                ))}
              </select>
            </label>
            <button className="admin-button">Save setting</button>
          </form>
        ) : (
          <p className="mt-5 rounded-md bg-amber-50 p-4 text-sm text-amber-900">Create a resume version before configuring the public resume.</p>
        )}
      </section>
    </div>
  );
};

export default SettingsPage;
