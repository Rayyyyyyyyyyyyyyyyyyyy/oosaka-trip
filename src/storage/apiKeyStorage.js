export const OPENAI_API_KEY_STORAGE_KEY = "trip-runtime-openai-api-key";
export const SECRET_DATABASE_NAME = "trip-runtime-secrets";

const DATABASE_VERSION = 1;
const KEY_STORE_NAME = "crypto-keys";
const WRAPPING_KEY_ID = "openai-api-key-wrap-v1";
const ENVELOPE_VERSION = 1;

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function openSecretDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SECRET_DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(KEY_STORE_NAME)) {
        request.result.createObjectStore(KEY_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readWrappingKey() {
  const database = await openSecretDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database
        .transaction(KEY_STORE_NAME, "readonly")
        .objectStore(KEY_STORE_NAME)
        .get(WRAPPING_KEY_ID);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

async function writeWrappingKey(key) {
  const database = await openSecretDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(KEY_STORE_NAME, "readwrite");
      transaction.objectStore(KEY_STORE_NAME).put(key, WRAPPING_KEY_ID);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

async function getOrCreateWrappingKey() {
  const existing = await readWrappingKey();
  if (existing) return existing;

  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  await writeWrappingKey(key);
  return key;
}

async function deleteWrappingKey() {
  const database = await openSecretDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(KEY_STORE_NAME, "readwrite");
      transaction.objectStore(KEY_STORE_NAME).delete(WRAPPING_KEY_ID);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export function hasStoredOpenAIApiKey(storage = globalThis.localStorage) {
  try {
    return Boolean(storage?.getItem(OPENAI_API_KEY_STORAGE_KEY));
  } catch {
    return false;
  }
}

export async function loadOpenAIApiKey(storage = globalThis.localStorage) {
  try {
    const serialized = storage?.getItem(OPENAI_API_KEY_STORAGE_KEY);
    if (!serialized) return "";

    const envelope = JSON.parse(serialized);
    if (
      envelope.version !== ENVELOPE_VERSION ||
      !envelope.iv ||
      !envelope.ciphertext
    ) {
      return "";
    }

    const key = await readWrappingKey();
    if (!key) return "";

    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(envelope.iv) },
      key,
      base64ToBytes(envelope.ciphertext),
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    return "";
  }
}

export async function saveOpenAIApiKey(
  apiKey,
  storage = globalThis.localStorage,
) {
  const normalized = apiKey.trim();
  if (!normalized) {
    throw new Error("請輸入 OpenAI API key。");
  }

  const key = await getOrCreateWrappingKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(normalized),
  );
  storage.setItem(
    OPENAI_API_KEY_STORAGE_KEY,
    JSON.stringify({
      version: ENVELOPE_VERSION,
      algorithm: "AES-GCM",
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    }),
  );
  return normalized;
}

export async function clearOpenAIApiKey(storage = globalThis.localStorage) {
  storage?.removeItem(OPENAI_API_KEY_STORAGE_KEY);
  await deleteWrappingKey();
}
