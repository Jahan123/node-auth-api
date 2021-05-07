import express from "express";
import { json } from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import consola from "consola";
import { APP_DB, APP_PORT } from "./src/constants/index";
import UserRouter from "./src/apis/user";
import passport from "passport";
import "./src/middlewares/passport-authenticate";
const app = express();
app.use(cors());
app.use(json());
app.use(passport.initialize());
app.use("/users", UserRouter);

const main = async () => {
  try {
    await mongoose.connect(APP_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
