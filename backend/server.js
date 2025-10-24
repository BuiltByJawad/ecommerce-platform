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
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Sanitize data to prevent XSS

// Prevent MongoDB operator injection
app.use(mongoSanitize());

// Protect against HTTP parameter pollution
app.use(hpp());

// parse requests of content-type - application/json
app.use(express.json({ limit: "50mb" }));
// parse requests of content-type - application/x-www-form-urlencoded

app.use(express.urlencoded({ limit: "50mb", extended: false }));
// middleware for parsing cookies from incoming requests
app.use(cookieParser());

// middleware configuration for CORS
configureCors(app);

// register all routes
configureRoutes(app);

// route level error handler
app.use(errorHandler);

// function to start the server
const startServer = async () => {
  try {
    await db.connectToDatabase(); // wait for the database connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start the server:", err);
    process.exit(1); // exit the process if something goes wrong
  }
};

startServer();
