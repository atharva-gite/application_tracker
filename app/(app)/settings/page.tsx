import { ProfileForm } from "@/components/settings/profile-form";
import { requireUser } from "@/server/authorization/require-user";
import { getCurrentUser } from "@/server/services/auth-service";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sessionUser = await requireUser();
  const user = await getCurrentUser(sessionUser.id);
  const raw = await searchParams;
  const saved = (Array.isArray(raw.saved) ? raw.saved[0] : raw.saved) === "1";
  const zones = Intl.supportedValuesOf("timeZone");
  const timezones = zones.includes(user.timezone) ? zones : [user.timezone, ...zones];

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-stone-600">
          Your name and the timezone used for dates in this job search.
        </p>
      </div>
      {saved ? (
        <p className="rounded-md bg-[var(--accent-soft)] px-3 py-2 text-sm text-accent">
          Saved.
        </p>
      ) : null}
      <ProfileForm
        key={`${user.name ?? ""}:${user.timezone}`}
        name={user.name ?? ""}
        timezone={user.timezone}
        timezones={timezones}
      />
    </div>
  );
}
