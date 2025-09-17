import express from "express";
import dotenv from 'dotenv';
import router from "./routes/api.routes.js";
import connectDB from "./db/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import serverless from "serverless-http";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN as string,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api", router)

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

async function start(){
  await connectDB()
  app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
}

start()

export const handler = serverless(app);
