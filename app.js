import express from "express";
import { json } from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import consola from "consola";
import { APP_DB, APP_PORT } from "./src/constants/index";
import UserRouter from "./src/apis/user";
import ProfileRouter from "./src/apis/profile";
import PostRouter from "./src/apis/post";
import passport from "passport";
import "./src/middlewares/passport-authenticate";
import { join } from "path";
const app = express();
app.use(cors());
app.use(json());
app.use(passport.initialize());
app.use("/uploads", express.static(join(__dirname, "./uploads")));
app.use("/users", UserRouter);
app.use("/profiles", ProfileRouter);
app.use("/posts", PostRouter);
const main = async () => {
  try {
    await mongoose.connect(APP_DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    consola.success("database Connected...");
    app.listen(APP_PORT, () => {
      consola.success("App Running on port " + APP_PORT);
    });
  } catch (e) {
    consola.error(`enable to start server ${e.message}`);
  }
};
main();
