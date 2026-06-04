import { deleteDB } from "idb";
import { starterIdioms } from "../domain/starterContent";
import { normalizeStudyFields } from "../domain/reviewScheduler";
import type { Idiom, PracticeSession } from "../domain/types";
import { getDb, resetDbConnection } from "./db";

let seeded = false;

async function seedIdiomsIfNeeded() {
  if (seeded) {
    return;
  }

  const db = await getDb();
  const existing = await db.getAll("idioms");
  const existingIds = new Set(existing.map((idiom) => idiom.id));
  const missing = starterIdioms.filter((idiom) => !existingIds.has(idiom.id));

  if (missing.length > 0) {
    const tx = db.transaction("idioms", "readwrite");
    await Promise.all(missing.map((idiom) => tx.store.put(normalizeStudyFields(idiom))));
    await tx.done;
  }

  seeded = true;
}

export async function listIdioms() {
  await seedIdiomsIfNeeded();
  const db = await getDb();
  const idioms = await db.getAllFromIndex("idioms", "by-updated");
  return idioms.map(normalizeStudyFields).reverse();
}

export async function saveIdiom(idiom: Idiom) {
  const db = await getDb();
  await db.put("idioms", idiom);
}

export async function listSessions() {
  const db = await getDb();
  const sessions = await db.getAllFromIndex("sessions", "by-created");
  return sessions.reverse();
}

export async function saveSession(session: PracticeSession) {
  const db = await getDb();
  await db.put("sessions", session);
}

export async function clearDatabase() {
  const db = await getDb();
  db.close();
  await deleteDB("ielts-idioms-speaking");
  seeded = false;
  await resetDbConnection();
}
