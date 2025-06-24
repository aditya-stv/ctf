import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  teamId: varchar("team_id", { length: 50 }).notNull().unique(),
  accessToken: text("access_token").notNull(),
  teamName: varchar("team_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  isAdmin: boolean("is_admin").default(false),
  totalScore: integer("total_score").default(0),
  currentRank: integer("current_rank").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  points: integer("points").notNull(),
  flag: text("flag").notNull(),
  isActive: boolean("is_active").default(true),
  hints: jsonb("hints"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  challengeId: integer("challenge_id").references(() => challenges.id),
  submittedFlag: text("submitted_flag").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  pointsAwarded: integer("points_awarded").default(0),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const eventConfig = pgTable("event_config", {
  id: serial("id").primaryKey(),
  eventName: text("event_name").notNull().default("CyberArena CTF 2024"),
  eventDescription: text("event_description").default("Welcome to CyberArena CTF competition!"),
  maxTeamSize: integer("max_team_size").default(4),
  allowLateRegistration: boolean("allow_late_registration").default(true),
  isEventActive: boolean("is_event_active").default(true),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [submissions.challengeId],
    references: [challenges.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActivity: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
});

export const insertEventConfigSchema = createInsertSchema(eventConfig).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type EventConfig = typeof eventConfig.$inferSelect;
export type InsertEventConfig = z.infer<typeof insertEventConfigSchema>;

// Additional types for API responses
export type LeaderboardEntry = {
  rank: number;
  teamId: string;
  teamName: string;
  totalScore: number;
  challengesSolved: number;
  lastSubmission: string | null;
  isCurrentUser?: boolean;
};

export type ChallengeWithProgress = Challenge & {
  isSolved: boolean;
  attempts: number;
};

export type UserStats = {
  totalScore: number;
  challengesSolved: number;
  totalChallenges: number;
  currentRank: number;
  lastActivity: string;
};
