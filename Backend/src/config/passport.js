import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./index.js";

// Only register the Google strategy if credentials are configured
if (config.google.clientId && config.google.clientSecret) {
  console.log("🔑 Google OAuth callback URL:", config.google.callbackUrl);
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      (_accessToken, _refreshToken, profile, done) => done(null, profile)
    )
  );
} else {
  console.warn("⚠️  Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable it.");
}

export default passport;
