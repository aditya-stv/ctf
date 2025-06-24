import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, requireAdmin, generateToken, type AuthenticatedRequest } from "./auth";
import { insertSubmissionSchema, insertChallengeSchema, insertUserSchema, insertEventConfigSchema } from "@shared/schema";
import { seedDatabase } from "./seedData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with seed data
  await seedDatabase();

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { teamId, accessToken } = req.body;

      if (!teamId || !accessToken) {
        return res.status(400).json({ message: "Team ID and access token are required" });
      }

      const user = await storage.validateCredentials(teamId, accessToken);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken({
        id: user.id,
        teamId: user.teamId,
        teamName: user.teamName,
        isAdmin: user.isAdmin || false,
      });

      res.json({
        token,
        user: {
          id: user.id,
          teamId: user.teamId,
          teamName: user.teamName,
          isAdmin: user.isAdmin,
          totalScore: user.totalScore,
          currentRank: user.currentRank,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        teamId: user.teamId,
        teamName: user.teamName,
        isAdmin: user.isAdmin,
        totalScore: user.totalScore,
        currentRank: user.currentRank,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      
      // Mark current user's entry
      const currentUserEntry = leaderboard.find(entry => entry.teamId === req.user!.teamId);
      if (currentUserEntry) {
        currentUserEntry.isCurrentUser = true;
      }

      res.json(leaderboard);
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User stats
  app.get("/api/user/stats", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getUserStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      console.error("User stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Challenge routes
  app.get("/api/challenges", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const challenges = await storage.getChallengesWithProgress(req.user!.id);
      
      // Remove flags from response for security
      const safeChallenges = challenges.map(({ flag, ...challenge }) => challenge);
      
      res.json(safeChallenges);
    } catch (error) {
      console.error("Get challenges error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/challenges/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallengeById(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      // Remove flag from response
      const { flag, ...safeChallenge } = challenge;
      res.json(safeChallenge);
    } catch (error) {
      console.error("Get challenge error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Flag submission
  app.post("/api/submissions", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { challengeId, submittedFlag } = req.body;

      if (!challengeId || !submittedFlag) {
        return res.status(400).json({ message: "Challenge ID and flag are required" });
      }

      const challenge = await storage.getChallengeById(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      // Check if already solved
      const userSubmissions = await storage.getUserSubmissions(req.user!.id);
      const alreadySolved = userSubmissions.some(
        s => s.challengeId === challengeId && s.isCorrect
      );

      if (alreadySolved) {
        return res.status(400).json({ message: "Challenge already solved" });
      }

      const isCorrect = submittedFlag.trim() === challenge.flag;
      const pointsAwarded = isCorrect ? challenge.points : 0;

      // Create submission
      const submission = await storage.createSubmission({
        userId: req.user!.id,
        challengeId,
        submittedFlag,
        isCorrect,
        pointsAwarded,
      });

      // Update user score if correct
      if (isCorrect) {
        const user = await storage.getUser(req.user!.id);
        const newScore = (user?.totalScore || 0) + pointsAwarded;
        await storage.updateUserScore(req.user!.id, newScore);

        // Update rankings
        await updateRankings();
      }

      res.json({
        isCorrect,
        pointsAwarded,
        message: isCorrect ? "Correct flag! Points awarded." : "Incorrect flag. Try again.",
      });
    } catch (error) {
      console.error("Submit flag error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user submissions
  app.get("/api/user/submissions", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const submissions = await storage.getUserSubmissions(req.user!.id);
      res.json(submissions);
    } catch (error) {
      console.error("Get submissions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/challenges", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const challenges = await storage.getAllChallenges();
      // For admin, include flags to show complete challenge data
      res.json(challenges);
    } catch (error) {
      console.error("Admin get challenges error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/challenges", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const challengeData = insertChallengeSchema.parse(req.body);
      const challenge = await storage.createChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Create challenge error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/challenges/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const updates = req.body;
      const challenge = await storage.updateChallenge(challengeId, updates);
      res.json(challenge);
    } catch (error) {
      console.error("Update challenge error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/challenges/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      await storage.deleteChallenge(challengeId);
      res.status(204).send();
    } catch (error) {
      console.error("Delete challenge error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all users for admin
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // For admin, include access tokens to show login credentials
      res.json(users);
    } catch (error) {
      console.error("Admin get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new user (admin only)
  app.post("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if team ID already exists
      const existingUser = await storage.getUserByTeamId(userData.teamId);
      if (existingUser) {
        return res.status(400).json({ message: "Team ID already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      console.error("Create user error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Event configuration
  app.get("/api/event/config", authenticateToken, async (req, res) => {
    try {
      const config = await storage.getEventConfig();
      res.json(config);
    } catch (error) {
      console.error("Get event config error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/event/config", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const configData = insertEventConfigSchema.parse(req.body);
      
      // Convert datetime strings to Date objects if provided
      const processedData = {
        ...configData,
        startTime: configData.startTime ? new Date(configData.startTime) : null,
        endTime: configData.endTime ? new Date(configData.endTime) : null,
      };

      const config = await storage.updateEventConfig(processedData);
      res.json(config);
    } catch (error: any) {
      console.error("Update event config error:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid event configuration", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Helper function to update all user rankings
  async function updateRankings() {
    const leaderboard = await storage.getLeaderboard();
    for (const entry of leaderboard) {
      const user = await storage.getUserByTeamId(entry.teamId);
      if (user) {
        await storage.updateUserRank(user.id, entry.rank);
      }
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
