import { clearOpenAIApiKey } from "./apiKeyStorage";
import { clearLocalTripData } from "./tripStorage";

export async function clearAllLocalData(storage = globalThis.localStorage) {
  clearLocalTripData(storage);
  await clearOpenAIApiKey(storage);
}
