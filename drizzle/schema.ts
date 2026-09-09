import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the Manus auth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const registrations = mysqlTable("registrations", {
  id: int("id").autoincrement().primaryKey(),
  registrationNumber: varchar("registrationNumber", { length: 32 }).notNull().unique(),
  playerTitle: varchar("playerTitle", { length: 24 }).notNull(),
  playerFirstName: varchar("playerFirstName", { length: 100 }).notNull(),
  playerLastName: varchar("playerLastName", { length: 100 }).notNull(),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }).notNull(),
  placeOfBirth: varchar("placeOfBirth", { length: 120 }).notNull(),
  ageGroup: mysqlEnum("ageGroup", ["U7", "U9", "U11", "U13"]).notNull(),
  address: text("address").notNull(),
  guardianName: varchar("guardianName", { length: 180 }).notNull(),
  guardianRelation: varchar("guardianRelation", { length: 60 }).notNull(),
  guardianPhone: varchar("guardianPhone", { length: 32 }).notNull(),
  guardianPhone2: varchar("guardianPhone2", { length: 32 }),
  hasHealthIssue: boolean("hasHealthIssue").default(false).notNull(),
  healthDetails: text("healthDetails"),
  birthCertificate: boolean("birthCertificate").default(false).notNull(),
  medicalCertificate: boolean("medicalCertificate").default(false).notNull(),
  photos: boolean("photos").default(false).notNull(),
  guardianIdCopy: boolean("guardianIdCopy").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;

export const ageGroups = ["U7", "U9", "U11", "U13"] as const;
export type AgeGroup = (typeof ageGroups)[number];
