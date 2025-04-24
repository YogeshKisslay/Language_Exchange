// const nodemailer = require("nodemailer");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASSWORD, // Use the generated App Password
//   },
// });

// const sendVerificationEmail = (user, type = "verify") => {
//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
//   const url = `${process.env.FRONTEND_URL}/${type}/${token}`;

//   const mailOptions = {
//     from: `"Language Exchange" <${process.env.EMAIL}>`,
//     to: user.email,
//     subject: type === "verify" ? "Verify Your Email" : "Reset Your Password",
//     text: `Click the link to ${type}: ${url}`,
//   };

//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       console.log("Error sending email:", err);
//     } else {
//       console.log("Email sent:", info.response);
//     }
//   });
// };

// module.exports = { sendVerificationEmail };



// const nodemailer = require("nodemailer");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// const sendVerificationEmail = (user, type = "verify") => {
//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//   // Backend API URL
//   const apiUrl = `${process.env.BACKEND_URL}/api/auth/${type}/${token}`;

//   const mailOptions = {
//     from: `"Language Exchange" <${process.env.EMAIL}>`,
//     to: user.email,
//     subject: type === "verify" ? "Verify Your Email" : "Reset Your Password",
//     text: `Click the link to ${type}: ${apiUrl}`,
//   };

//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       console.log("Error sending email:", err);
//     } else {
//       console.log("Email sent:", info.response);
//     }
//   });
// };

// module.exports = { sendVerificationEmail };



// const nodemailer = require("nodemailer");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// const sendVerificationEmail = (user, type = "verify") => {
//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//   const url = type === "reset"
//     ? `${process.env.FRONTEND_URL}/${type}/${token}`  // Frontend for reset
//     : `${process.env.BACKEND_URL}/api/auth/${type}/${token}`;  // Backend for verify

//   const mailOptions = {
//     from: `"Language Exchange" <${process.env.EMAIL}>`,
//     to: user.email,
//     subject: type === "verify" ? "Verify Your Email" : "Reset Your Password",
//     text: `Click the link to ${type}: ${url}`,
//   };

//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       console.log("Error sending email:", err);
//     } else {
//       console.log("Email sent:", info.response);
//     }
//   });
// };

// module.exports = { sendVerificationEmail, transporter }; // Export transporter


// const nodemailer = require("nodemailer");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// const sendVerificationEmail = (user, type = "verify") => {
//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

//   const url = type === "reset"
//     ? `${process.env.FRONTEND_URL}/${type}/${token}`  // Frontend for reset
//     : `${process.env.BACKEND_URL}/api/auth/${type}/${token}`;  // Backend for verify

//   const mailOptions = {
//     from: `"Language Exchange" <${process.env.EMAIL}>`,
//     to: user.email,
//     subject: type === "verify" ? "Verify Your Email" : "Reset Your Password",
//     text: `Click the link to ${type}: ${url}`,
//   };

//   transporter.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       console.log("Error sending email:", err);
//     } else {
//       console.log("Email sent:", info.response);
//     }
//   });
// };

// const sendEmailService = async ({ to, subject, text }) => {
//   const mailOptions = {
//     from: `"Language Exchange" <${process.env.EMAIL}>`,
//     to,
//     subject,
//     text,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent:", info.response);
//     return info;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send email");
//   }
// };

// module.exports = { sendVerificationEmail, sendEmailService, transporter };

const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = (user, type = "verify") => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Use frontend URL for reset password, backend URL for verification
  const url = type === "reset"
    ? `${process.env.FRONTEND_URL}/${type}/${token}`  // Frontend for reset
    : `${process.env.BACKEND_URL}/api/auth/${type}/${token}`;  // Backend for verify

  const mailOptions = {
    from: `"Language Exchange" <${process.env.EMAIL}>`,
    to: user.email,
    subject: type === "verify" ? "Verify Your Email" : "Reset Your Password",
    text: `Click the link to ${type}: ${url}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log("Error sending email:", err);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

const sendEmailService = async ({ to, subject, text, from }) => {
  const mailOptions = {
    from: from ? `"${from.name}" <${from.email}>` : `"Language Exchange" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
    replyTo: from ? from.email : process.env.EMAIL, // Add reply-to for sender's email
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendVerificationEmail, sendEmailService, transporter };
