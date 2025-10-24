import cors from "cors";

export const configureCors = (app) => {
  const corsOptions = {
    origin: process.env.NEXT_APP_FRONTEND || "http://localhost:3000", // Allowed origin
    credentials: true, // Access-Control-Allow-Credentials: true
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200, // Ensures success status 200 for some legacy browsers
  };

  app.use(cors(corsOptions)); // Applying CORS middleware with the defined options
};
