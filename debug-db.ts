import { connectToDatabase } from "./src/lib/db";
import { PlatformSettingsModel } from "./src/models/Schemas";

async function debug() {
  await connectToDatabase();
  const settings = await PlatformSettingsModel.findOne().lean();
  console.log("Current Platform Settings in DB:", JSON.stringify(settings, null, 2));
  process.exit(0);
}

debug();
