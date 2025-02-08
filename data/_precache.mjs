import fs from "fs/promises";
import path from "path";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const SERVER_URL = "http://localhost:3001";
const CHECK_ENDPOINT = "shouldPrecache";
const ENDPOINTS = ["skins", "champions", "persistentVars", "added", "skinlines", "universes"];
const CACHE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), ".cache");

async function shouldPrecache() {
  try {
    const response = await axios.get(`${SERVER_URL}/${CHECK_ENDPOINT}`);
    return response.data === true;
  } catch (error) {
    console.error("[Precache] Error checking precache condition:", error.message);
    return false;
  }
}

async function downloadKey(key, root) {
  try {
    const response = await axios.get(`${SERVER_URL}/${key}`);
    await fs.writeFile(path.resolve(root, `${key}.json`), JSON.stringify(response.data, null, 2));
    console.log(`[Precache] Cached ${key}!`);
  } catch (error) {
    console.error(`[Precache] Error caching ${key}:`, error.message);
  }
}

async function main() {
  const canPrecache = await shouldPrecache();
  if (!canPrecache) {
    console.log("[Precache] Skipping caching process (shouldPrecache returned false).");
    return;
  }

  console.log("[Precache] Starting caching process...");
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await Promise.all(ENDPOINTS.map((key) => downloadKey(key, CACHE_DIR)));
  console.log("[Precache] All data cached successfully!");
}

main();
