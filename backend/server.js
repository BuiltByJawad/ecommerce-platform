import dotenv from "dotenv";
import express from "express";
import { configureCors } from "./config/cors.config.js";
import db from "./config/database.config.js";
import configureRoutes from "./config/route.config.js";
import errorHandler from "./utils/errorHandler.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// import xss from "xss";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import net from "node:net";
dotenv.config();

const app = express();
const REQUESTED_PORT = Number(process.env.PORT) || 5000;

// CORS must be applied as early as possible
configureCors(app);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting (development-friendly): avoid counting preflights and refresh token
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // higher ceiling to prevent accidental throttling during dev
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS" || req.path === "/api/refresh-token",
});
app.use(limiter);

// Sanitize data to prevent XSS

// Prevent MongoDB operator injection
app.use(mongoSanitize());

// Protect against HTTP parameter pollution
app.use(hpp());

// parse requests of content-type - application/json
// Accept any valid JSON, including primitives like null (fixes 400 from body-parser on refresh-token)
app.use(express.json({ limit: "50mb", strict: false }));
// parse requests of content-type - application/x-www-form-urlencoded

app.use(express.urlencoded({ limit: "50mb", extended: false }));
// middleware for parsing cookies from incoming requests
app.use(cookieParser());

// register all routes
configureRoutes(app);

// route level error handler
app.use(errorHandler);

const findAvailablePort = (start) => {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      .once("error", (err) => {
        if (err.code === "EADDRINUSE") {
          resolve(findAvailablePort(start + 1));
        } else {
          reject(err);
        }
      })
      .once("listening", () => {
        tester.close(() => resolve(start));
      });
    tester.listen(start, "0.0.0.0");
  });
};
// function to start the server
const startServer = async () => {
  try {
    await db.connectToDatabase();
    const port = await findAvailablePort(REQUESTED_PORT);
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      if (port !== REQUESTED_PORT) {
        console.log(`Requested port ${REQUESTED_PORT} is in use; started on ${port}`);
      }
    });
    server.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to start the server:", err);
    process.exit(1); // exit the process if something goes wrong
  }
};

startServer();
