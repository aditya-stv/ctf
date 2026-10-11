import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes.js";

// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json).
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const ready = registerRoutes(app).then(() => {
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });
});

export default async function handler(req: Request, res: Response) {
  await ready;
  return app(req, res);
}
