import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { APP_SECRET_KEY } from "../constants/index";
import User from "../models/user";
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: APP_SECRET_KEY,
};
passport.use(
  new Strategy(opts, async ({ id }, done) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error("User Not Exists");
      }
      done(null, user.getUserInfo());
    } catch (err) {
      done(err, false);
    }
  })
);
