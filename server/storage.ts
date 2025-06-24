import { 
  users, 
  challenges, 
  submissions, 
  eventConfig,
  type User, 
  type InsertUser,
  type Challenge,
  type InsertChallenge,
  type Submission,
  type InsertSubmission,
  type EventConfig,
  type InsertEventConfig,
  type LeaderboardEntry,
  type ChallengeWithProgress,
  type UserStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByTeamId(teamId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserScore(userId: number, newScore: number): Promise<void>;
  updateUserRank(userId: number, rank: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Challenge management
  getAllChallenges(): Promise<Challenge[]>;
  getActiveChecallenges(): Promise<Challenge[]>;
  getChallengeById(id: number): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, challenge: Partial<Challenge>): Promise<Challenge>;
  deleteChallenge(id: number): Promise<void>;
  
  // Submission management
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getUserSubmissions(userId: number): Promise<Submission[]>;
  getChallengeSubmissions(challengeId: number): Promise<Submission[]>;
  getSubmissionById(id: number): Promise<Submission | undefined>;
  
  // Leaderboard and stats
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  getUserStats(userId: number): Promise<UserStats>;
  getChallengesWithProgress(userId: number): Promise<ChallengeWithProgress[]>;
  
  // Event configuration
  getEventConfig(): Promise<EventConfig | undefined>;
  updateEventConfig(config: Partial<EventConfig>): Promise<EventConfig>;
  
  // Authentication
  validateCredentials(teamId: string, accessToken: string): Promise<User | null>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByTeamId(teamId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.teamId, teamId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserScore(userId: number, newScore: number): Promise<void> {
    await db
      .update(users)
      .set({ totalScore: newScore, lastActivity: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserRank(userId: number, rank: number): Promise<void> {
    await db
      .update(users)
      .set({ currentRank: rank })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return await db.select().from(challenges).orderBy(challenges.category, challenges.points);
  }

  async getActiveChecallenges(): Promise<Challenge[]> {
    return await db
      .select()
      .from(challenges)
      .where(eq(challenges.isActive, true))
      .orderBy(challenges.category, challenges.points);
  }

  async getChallengeById(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge || undefined;
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db
      .insert(challenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async updateChallenge(id: number, challenge: Partial<Challenge>): Promise<Challenge> {
    const [updated] = await db
      .update(challenges)
      .set(challenge)
      .where(eq(challenges.id, id))
      .returning();
    return updated;
  }

  async deleteChallenge(id: number): Promise<void> {
    await db.delete(challenges).where(eq(challenges.id, id));
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db
      .insert(submissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async getUserSubmissions(userId: number): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getChallengeSubmissions(challengeId: number): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.challengeId, challengeId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getSubmissionById(id: number): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission || undefined;
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const result = await db
      .select({
        teamId: users.teamId,
        teamName: users.teamName,
        totalScore: users.totalScore,
        challengesSolved: sql<number>`COUNT(DISTINCT CASE WHEN ${submissions.isCorrect} THEN ${submissions.challengeId} END)`,
        lastSubmission: sql<string>`MAX(${submissions.submittedAt})`,
      })
      .from(users)
      .leftJoin(submissions, eq(users.id, submissions.userId))
      .groupBy(users.id, users.teamId, users.teamName, users.totalScore)
      .orderBy(desc(users.totalScore), sql`MAX(${submissions.submittedAt}) ASC`);

    return result.map((entry, index) => ({
      rank: index + 1,
      teamId: entry.teamId,
      teamName: entry.teamName,
      totalScore: entry.totalScore || 0,
      challengesSolved: Number(entry.challengesSolved) || 0,
      lastSubmission: entry.lastSubmission,
    }));
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    const [challengesCount] = await db
      .select({ count: count() })
      .from(challenges)
      .where(eq(challenges.isActive, true));

    const [solvedCount] = await db
      .select({ count: count() })
      .from(submissions)
      .where(and(eq(submissions.userId, userId), eq(submissions.isCorrect, true)));

    return {
      totalScore: user?.totalScore || 0,
      challengesSolved: solvedCount?.count || 0,
      totalChallenges: challengesCount?.count || 0,
      currentRank: user?.currentRank || 0,
      lastActivity: user?.lastActivity?.toISOString() || new Date().toISOString(),
    };
  }

  async getChallengesWithProgress(userId: number): Promise<ChallengeWithProgress[]> {
    const challengesList = await db.select().from(challenges).where(eq(challenges.isActive, true));
    
    const userSubmissions = await db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId));

    return challengesList.map(challenge => {
      const challengeSubmissions = userSubmissions.filter(s => s.challengeId === challenge.id);
      const isSolved = challengeSubmissions.some(s => s.isCorrect);
      
      return {
        ...challenge,
        isSolved,
        attempts: challengeSubmissions.length,
      };
    });
  }

  async getEventConfig(): Promise<EventConfig | undefined> {
    const [config] = await db.select().from(eventConfig).limit(1);
    return config || undefined;
  }

  async updateEventConfig(config: Partial<EventConfig>): Promise<EventConfig> {
    const existing = await this.getEventConfig();
    
    if (existing) {
      const [updated] = await db
        .update(eventConfig)
        .set(config)
        .where(eq(eventConfig.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(eventConfig)
        .values(config as InsertEventConfig)
        .returning();
      return created;
    }
  }

  async validateCredentials(teamId: string, accessToken: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.teamId, teamId), eq(users.accessToken, accessToken)));
    
    if (user) {
      // Update last activity
      await db
        .update(users)
        .set({ lastActivity: new Date() })
        .where(eq(users.id, user.id));
    }
    
    return user || null;
  }
}

export const storage = new DatabaseStorage();
