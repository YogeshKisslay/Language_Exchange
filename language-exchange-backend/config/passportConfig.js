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
//       return done(null, profile);
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });



const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

passport.use(
  new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/auth0/callback`,
      state: true,
    },
    async (accessToken, refreshToken, extraParams, profile, done) => {
      console.log("Auth0 Profile:", profile); // ✅ Debugging

      // Ensure `emails` and `name` are in expected format
      const formattedProfile = {
        emails: profile.emails || [{ value: profile._json.email }],
        name: {
          givenName: profile._json.given_name || profile.displayName?.split(" ")[0],
          familyName: profile._json.family_name || profile.displayName?.split(" ")[1] || "",
        },
        sub: profile.id, // Auth0 User ID
      };

      return done(null, formattedProfile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
