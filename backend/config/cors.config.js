import cors from "cors";

export const configureCors = (app) => {
  const whitelist = [
    process.env.NEXT_APP_FRONTEND || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.DEV_LAN_FRONTEND || "http://192.168.0.126:3000",
  ].filter(Boolean);

  const corsOptions = {
    origin: whitelist,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));
};
