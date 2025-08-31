

// const passport = require("passport");
// const Auth0Strategy = require("passport-auth0");

// passport.use(
//   new Auth0Strategy(
//     {
//       domain: process.env.AUTH0_DOMAIN,
//       clientID: process.env.AUTH0_CLIENT_ID,
//       clientSecret: process.env.AUTH0_CLIENT_SECRET,
//       callbackURL: `${process.env.BACKEND_URL}/api/auth/auth0/callback`,
//       state: true,
//     },
//     async (accessToken, refreshToken, extraParams, profile, done) => {
//       console.log("Auth0 Profile:", profile); // ✅ Debugging

//       // Ensure `emails` and `name` are in expected format
//       const formattedProfile = {
//         emails: profile.emails || [{ value: profile._json.email }],
//         name: {
//           givenName: profile._json.given_name || profile.displayName?.split(" ")[0],
//           familyName: profile._json.family_name || profile.displayName?.split(" ")[1] || "",
//         },
//         sub: profile.id, // Auth0 User ID
//       };

//       return done(null, formattedProfile);
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });
// const passport = require("passport");
// const Auth0Strategy = require("passport-auth0");

// passport.use(
//   new Auth0Strategy(
//     {
//       domain: process.env.AUTH0_DOMAIN,
//       clientID: process.env.AUTH0_CLIENT_ID,
//       clientSecret: process.env.AUTH0_CLIENT_SECRET,
//       callbackURL: `${process.env.BACKEND_URL}/api/auth/auth0/callback`,
//       state: false,
//       scope: 'email profile'
//     },
//     async (accessToken, refreshToken, extraParams, profile, done) => {
//       // Log the entire profile object to see what's actually there
//       console.log("Auth0 Profile (FULL):", JSON.stringify(profile, null, 2));
//       console.log("Auth0 _json (FULL):", JSON.stringify(profile._json, null, 2));

//       // Your existing code
//       const formattedProfile = {
//         emails: profile.emails || [{ value: profile._json.email }],
//         name: {
//           givenName: profile._json.given_name || profile.displayName?.split(" ")[0],
//           familyName: profile._json.family_name || profile.displayName?.split(" ")[1] || "",
//         },
//         sub: profile.id,
//       };

//       return done(null, formattedProfile);
//     }
//   )
// );
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

passport.use(
  new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/auth0/callback`,
      state: true, // Re-enable state for session-based flow
    },
    async (accessToken, refreshToken, extraParams, profile, done) => {
      console.log("Auth0 Profile:", profile);

      const formattedProfile = {
        emails: profile.emails || [{ value: profile._json.email }],
        name: {
          givenName: profile._json.given_name || profile.displayName?.split(" ")[0],
          familyName: profile._json.family_name || profile.displayName?.split(" ")[1] || "",
        },
        sub: profile.id,
      };

      return done(null, formattedProfile);
    }
  )
);

// Re-add serializeUser and deserializeUser for session management
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});