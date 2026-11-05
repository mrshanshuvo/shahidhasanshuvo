import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import SettingsFormClient from "./SettingsFormClient";

async function getSettings() {
  await connectDB();
  let settings = await Setting.findOne().lean();
  if (!settings) {
    settings = await Setting.create({});
  }
  return JSON.parse(JSON.stringify(settings));
}

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      {/* Title is already shown in the AdminTopbar breadcrumb */}

      <SettingsFormClient initialSettings={settings} />
    </div>
  );
}
