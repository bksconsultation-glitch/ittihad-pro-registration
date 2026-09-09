import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertRegistration, InsertUser, registrations, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createRegistration(input: InsertRegistration) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(registrations).values(input);
  const id = Number(result[0].insertId);
  const created = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
  const registration = created[0];
  if (!registration) return registration;

  let sheetSynced = false;
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzqsQ8ZRdKf6WRFtf9ysmqc9G9mXZ-xbW0O5eosyA6Pgx2p3dIT5OiTc36dedGmcMHv/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationNumber: registration.registrationNumber,
        playerTitle: registration.playerTitle,
        playerFirstName: registration.playerFirstName,
        playerLastName: registration.playerLastName,
        dateOfBirth: registration.dateOfBirth,
        placeOfBirth: registration.placeOfBirth,
        ageGroup: registration.ageGroup,
        address: registration.address,
        guardianName: registration.guardianName,
        guardianRelation: registration.guardianRelation,
        guardianPhone: registration.guardianPhone,
        guardianPhone2: registration.guardianPhone2,
        hasHealthIssue: registration.hasHealthIssue,
        healthDetails: registration.healthDetails,
        birthCertificate: registration.birthCertificate,
        medicalCertificate: registration.medicalCertificate,
        photos: registration.photos,
        guardianIdCopy: registration.guardianIdCopy,
        createdAt: registration.createdAt,
      }),
      signal: AbortSignal.timeout(10000),
    });
    const responseText = await response.text();
    let responsePayload: { success?: boolean } = {};
    try {
      responsePayload = JSON.parse(responseText) as { success?: boolean };
    } catch {
      // Apps Script errors are returned as an HTML page, not JSON.
    }
    sheetSynced = response.ok && responsePayload.success === true;
    if (!sheetSynced) console.warn(`[Google Sheets] Webhook sync failed (${response.status}): ${responseText.slice(0, 160)}`);
  } catch (error) {
    console.warn("[Google Sheets] Registration saved locally but sync failed:", error);
  }

  return { ...registration, sheetSynced };
}

export async function listRegistrations(search = "", ageGroup = "all") {
  const db = await getDb();
  if (!db) return [];
  const normalizedSearch = search.trim();
  const searchCondition = normalizedSearch
    ? or(
        like(registrations.playerFirstName, `%${normalizedSearch}%`),
        like(registrations.playerLastName, `%${normalizedSearch}%`),
        like(registrations.guardianName, `%${normalizedSearch}%`),
        like(registrations.registrationNumber, `%${normalizedSearch}%`),
      )
    : undefined;
  const categoryCondition = ageGroup !== "all" && ageGroup ? eq(registrations.ageGroup, ageGroup as "U7" | "U9" | "U11" | "U13") : undefined;
  const conditions = [searchCondition, categoryCondition].filter(Boolean);
  if (!conditions.length) return db.select().from(registrations).orderBy(desc(registrations.createdAt));
  return db.select().from(registrations).where(and(...conditions)).orderBy(desc(registrations.createdAt));
}

export async function updateRegistration(id: number, input: Partial<InsertRegistration>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(registrations).set(input).where(eq(registrations.id, id));
  const updated = await db.select().from(registrations).where(eq(registrations.id, id)).limit(1);
  return updated[0];
}

export async function deleteRegistration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(registrations).where(eq(registrations.id, id));
  return { success: true } as const;
}
