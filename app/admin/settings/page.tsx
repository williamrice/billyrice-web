import {
  setDeviconSetting,
  setProjectsSetting,
  setPublicResumeProfile,
} from "@/features/settings/commands/settings";
import {
  getDeviconSetting,
  getProjectsSetting,
  getPublicResumeProfileId,
} from "@/features/settings/queries/settings";
import { availableDevicons } from "@/features/settings/types/devicons";
import { getResumeProfiles } from "@/features/resume/queries/resume";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const SettingsPage = async () => {
  const [profiles, selectedProfileId, deviconSetting, projectsSetting] = await Promise.all([
    getResumeProfiles(),
    getPublicResumeProfileId(),
    getDeviconSetting(),
    getProjectsSetting(),
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
          <form
            key={selectedProfileId ?? "unset"}
            action={setPublicResumeProfile}
            className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end"
          >
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

      <section className="admin-card">
        <h2 className="admin-card-title">Public projects</h2>
        <p className="admin-card-description">
          Disable the public project feature while case studies are being prepared. Admin project management remains available.
        </p>
        <form action={setProjectsSetting} className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={projectsSetting.enabled}
              className="size-4 accent-teal-700"
            />
            Show projects publicly
          </label>
          <button className="admin-button">Save project visibility</button>
        </form>
      </section>

      <section className="admin-card">
        <h2 className="admin-card-title">Devicon background</h2>
        <p className="admin-card-description">
          Configure the decorative technology marks used behind the public headers and homepage jumbotron.
        </p>
        <form action={setDeviconSetting} className="mt-6 space-y-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <label>
              <span className="admin-label">Devicon version</span>
              <input
                className="admin-field font-mono"
                name="version"
                defaultValue={deviconSetting.version}
                pattern="v\d+\.\d+\.\d+"
                placeholder="v2.17.0"
                required
              />
            </label>
            <label>
              <span className="admin-label">Opacity (%)</span>
              <input
                className="admin-field"
                name="opacity"
                type="number"
                min="1"
                max="20"
                step="0.5"
                defaultValue={deviconSetting.opacity * 100}
                required
              />
            </label>
            <label>
              <span className="admin-label">Icon size (px)</span>
              <input
                className="admin-field"
                name="size"
                type="number"
                min="40"
                max="120"
                defaultValue={deviconSetting.size}
                required
              />
            </label>
          </div>

          <div>
            <span className="admin-label">Available icon pool</span>
            <p className="mb-3 text-xs text-gray-500">Select at least one technology to include in the randomized background.</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {availableDevicons.map((icon) => (
                <label className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2.5 text-sm" key={icon.id}>
                  <input
                    type="checkbox"
                    name="icons"
                    value={icon.id}
                    defaultChecked={deviconSetting.icons.includes(icon.id)}
                    className="size-4 accent-teal-700"
                  />
                  {icon.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" name="enabled" defaultChecked={deviconSetting.enabled} className="size-4 accent-teal-700" />
              Show Devicons
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" name="motionEnabled" defaultChecked={deviconSetting.motionEnabled} className="size-4 accent-teal-700" />
              Animate icons
            </label>
          </div>

          <div className="flex justify-end">
            <button className="admin-button">Save Devicon settings</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default SettingsPage;
