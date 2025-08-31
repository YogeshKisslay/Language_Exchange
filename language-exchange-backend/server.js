

const express = require("express");
// const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");
const cron = require("node-cron");
const http = require("http");
require("dotenv").config();
require("./config/passportConfig");
const connectDB = require("./config/db");
const tokenController = require("./controllers/tokenController");
const socket = require("./socket");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const callRoutes = require("./routes/callRoutes");
// const session = require("express-session");

const app = express();
const server = http.createServer(app);
socket.init(server);

connectDB();

// Define allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000", // Vite local dev port
  "https://language-exchange-frontend.onrender.com", // Deployed frontend
];


// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "your_secret_key", // Use env variable or fallback
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());
app.use(express.json());
// app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman, curl)
      if (!origin) return callback(null, true);
      // Check if the origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies/credentials
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/calls", callRoutes);
console.log('NODE_ENV:', process.env.NODE_ENV);

console.log("Environment variables loaded - RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);


console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET);


// Schedule power token generation every 2 hours
cron.schedule(
  "0 */2 * * *",
  async () => {
    console.log("Running power token generation task at:", new Date().toISOString());
    try {
      await tokenController.generatePowerToken(
        { body: {} },
        {
          status: () => ({
            json: (data) => console.log("Power token generation result:", data),
          }),
        }
      );
      console.log("Power tokens generated successfully");
    } catch (error) {
      console.error("Cron power token generation failed:", error.message);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata", // IST
  }
);

// Test route to verify server is running
app.get("/", (req, res) => {
  res.send("Language Exchange Backend is running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));