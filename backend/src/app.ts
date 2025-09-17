import express from "express";
import dotenv from "dotenv";
import router from "./routes/api.routes.js";
import connectDB from "./db/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // e.g. https://your-app.vercel.app
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Lazy one-time DB connect per cold start
let dbReady: Promise<void> | null = null;
async function ensureDB() {
  if (!dbReady) dbReady = connectDB();
  await dbReady;
}
app.use(async (_req, _res, next) => {
  try {
    await ensureDB();
    next();
  } catch (e) {
    next(e);
  }
});

app.use("/api", router);

app.get("/api/test", (_req, res) => {
  res.json({ message: "Backend is working!" });
});

export default app;
