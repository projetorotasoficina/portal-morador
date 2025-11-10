import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Moradores table - stores resident information and their addresses
 */
export const moradores = mysqlTable("moradores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  telefone: varchar("telefone", { length: 20 }),
  // Endereço completo
  endereco: text("endereco").notNull(),
  numero: varchar("numero", { length: 20 }),
  complemento: varchar("complemento", { length: 255 }),
  bairro: varchar("bairro", { length: 255 }),
  cidade: varchar("cidade", { length: 255 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),
  cep: varchar("cep", { length: 10 }),
  // Coordenadas geográficas para integração com backend
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Morador = typeof moradores.$inferSelect;
export type InsertMorador = typeof moradores.$inferInsert;
