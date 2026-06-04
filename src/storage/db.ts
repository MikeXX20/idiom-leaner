import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Idiom, PracticeSession } from "../domain/types";

interface IeltsCoachDb extends DBSchema {
  idioms: {
    key: string;
    value: Idiom;
    indexes: {
      "by-updated": string;
    };
  };
  sessions: {
    key: string;
    value: PracticeSession;
    indexes: {
      "by-created": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<IeltsCoachDb>> | undefined;

export function getDb() {
  dbPromise ??= openDB<IeltsCoachDb>("ielts-idioms-speaking", 1, {
    upgrade(db) {
      const idioms = db.createObjectStore("idioms", { keyPath: "id" });
      idioms.createIndex("by-updated", "updatedAt");

      const sessions = db.createObjectStore("sessions", { keyPath: "id" });
      sessions.createIndex("by-created", "createdAt");
    }
  });

  return dbPromise;
}

export async function resetDbConnection() {
  const db = await getDb();
  db.close();
  dbPromise = undefined;
}
