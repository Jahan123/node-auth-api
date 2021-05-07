import { Router } from "express";
import {
  RegistrationValidation,
  AuthorizationValidation,
} from "../validators/user-validator";
import UserInputValidation from "../middlewares/register-user-validation";
import User from "../models/user";
import SendMailToRegisterUser from "../functions/mail-send-to-register-user";
import { APP_DOMAIN } from "../constants/index";
import ReturnResponse from "../functions/response-builder";
import { randomBytes } from "crypto";
import { join } from "path";
import consola from "consola";
const router = Router();

/**
 * @description Register User
 * @Api /users/register
 * @access PUBLIC
 * @methods POST
 */

router.post(
  "/register",
  RegistrationValidation,
  UserInputValidation,
  async (req, res, next) => {
    const { username, email, name, password } = req.body;
    const resultUser = await User.findOne({ username });
    if (resultUser) {
      return res
        .status(400)
        .json({ message: "Username Already Exists", success: false });
    }
    const emailUser = await User.findOne({ email });
    if (emailUser) {
      return res
        .status(400)
        .json({ message: "Email Already Exists", success: false });
    }
    const user = new User({
      ...req.body,
      verificationcode: randomBytes(20).toString("hex"),
    });
    const newUser = await user.save();
    console.log(newUser);
    const html = `
    <div>
    <h1>Verify Yourself By Clicking Below Link</h1>
    <p>Hello ${newUser.username} </p>
    <a href="${APP_DOMAIN}users/verify_user/${newUser.verificationcode}">Click To Verify</a>
    </div>
    `;
    SendMailToRegisterUser(
      newUser.email,
      "User Email Verification",
      "Please Verify Email To Register Yourself",
      html
    );
    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      newUser,
    });
  }
);

/**
 * @description Verify User
 * @Api users/verify_user/verificationCode
 * @access PUBLIC
 * @methods GET
 */

router.get("/verify_user/:verificationCode", async (req, res, next) => {
  const { verificationCode } = req.params;
  try {
    const user = await User.findOne({ verificationcode: verificationCode });
    // console.log(user);
    if (!user) {
      return res.status(401).json({ message: "UNAUTHORIZED" });
    }
    user.verified = true;
    user.verificationcode = undefined;
    await user.save();
    return res.sendFile(
      join(__dirname, "../../templates/verification-success.html")
    );
  } catch (err) {
    consola.error(err.message);
    return res.sendFile(
      join(__dirname, "../../templates/verification-error.html")
    );
  }
});

router.post(
  "/login",
  AuthorizationValidation,
  UserInputValidation,
  async (req, res) => {
    const { username, password } = req.body;
    try {
      const checkusername = await User.findOne({ username: username });
      if (!checkusername) {
        return ReturnResponse(res, 401, "Username Doesn`t Exists", false);
      }
      if (!(await checkusername.comparePassword(password))) {
        return ReturnResponse(401, "Incorrect Password", false);
      }
      const token = await checkusername.generateToken();
      const getUserInfo = await checkusername.getUserInfo();
      return ReturnResponse(
        res,
        200,
        "Hurreyy, Login Successfully..",
        true,
        token,
        getUserInfo
      );
    } catch (err) {
      return ReturnResponse(res, 400, err.message, false);
    }
  }
);
export default router;
