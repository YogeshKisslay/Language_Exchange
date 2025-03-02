// const express = require("express");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// require("dotenv").config();
// const connectDB = require("./config/db");

// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes"); // Import user routes

// const app = express();
// connectDB();

// // Middleware
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoutes); // Use profile/logout routes

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// const express = require("express");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const passport = require("passport");
// require("dotenv").config();
// require("./config/passportConfig"); // Import Passport config
// const connectDB = require("./config/db");

// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const session = require("express-session");



// const app = express();
// connectDB();

// app.use(
//     session({
//       secret: "your_secret_key",
//       resave: false,
//       saveUninitialized: true,
//     })
//   );
  
//   app.use(passport.initialize());
//   app.use(passport.session());

// // Middleware
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));

// // Passport Middleware
// app.use(passport.initialize());

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// const express = require("express");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const passport = require("passport");
// const cron = require("node-cron");
// require("dotenv").config();
// require("./config/passportConfig");
// const connectDB = require("./config/db");
// const tokenController = require("./controllers/tokenController");

// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const callRoutes = require("./routes/callRoutes");
// const session = require("express-session");

// const app = express();
// connectDB();

// app.use(
//   session({
//     secret: "your_secret_key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));

// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/calls", callRoutes);

// cron.schedule("0 */2 * * *", () => {
//   tokenController.generatePowerToken(
//     { body: {} },
//     { status: () => ({ json: console.log }) }
//   );
//   console.log("Running power token generation...");
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// APIIIIIIII



// const express = require("express");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const passport = require("passport");
// const cron = require("node-cron");
// require("dotenv").config();
// require("./config/passportConfig");
// const connectDB = require("./config/db");
// const tokenController = require("./controllers/tokenController");

// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const callRoutes = require("./routes/callRoutes");
// const session = require("express-session");

// const app = express();
// connectDB();

// app.use(
//   session({
//     secret: "your_secret_key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());
// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));

// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api/calls", callRoutes);

// cron.schedule("0 */2 * * *", () => {
//   tokenController.generatePowerToken(
//     { body: {} },
//     { status: () => ({ json: console.log }) }
//   );
//   console.log("Running power token generation...");
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




const express = require("express");
const cookieParser = require("cookie-parser");
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
const session = require("express-session");

const app = express();
const server = http.createServer(app);
socket.init(server);

connectDB();

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/calls", callRoutes);

cron.schedule("0 */2 * * *", () => {
  tokenController.generatePowerToken(
    { body: {} },
    { status: () => ({ json: console.log }) }
  );
  console.log("Running power token generation...");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));