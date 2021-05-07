import { Router } from "express";
import {
  RegistrationValidation,
  AuthorizationValidation,
  ResetPasswordValidation,
} from "../validators/user-validator";
import UserInputValidation from "../middlewares/register-user-validation";
import User from "../models/user";
import SendMailToRegisterUser from "../functions/mail-send-to-register-user";
import { APP_DOMAIN } from "../constants/index";
import ReturnResponse from "../functions/response-builder";
import { randomBytes } from "crypto";
import { join } from "path";
import consola from "consola";
import passport from "passport";
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
      return ReturnResponse(400, "Username Already Exists", false);
    }
    const emailUser = await User.findOne({ email });
    if (emailUser) {
      return ReturnResponse(400, "Email Already Exists", false);
    }
    const user = new User({
      ...req.body,
      verificationcode: randomBytes(20).toString("hex"),
    });
    const newUser = await user.save();
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
    return ReturnResponse(
      201,
      "User Created Successfully",
      true,
      null,
      newUser
    );
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
      return ReturnResponse(401, "UNAUTHORIZED", false);
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
        return ReturnResponse(res, 401, "Incorrect Password", false);
      }
      const token = await checkusername.generateToken();
      const getUserInfo = await checkusername.getUserInfo();
      return ReturnResponse(
        res,
        200,
        "Hurreyy, Login Successfully..",
        true,
        `Bearer ${token}`,
        getUserInfo
      );
    } catch (err) {
      return ReturnResponse(res, 400, err.message, false);
    }
  }
);

router.get(
  "/authenticate-user",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    const newUser = req.user;
    return ReturnResponse(
      res,
      200,
      "Successfully Authenticate User",
      true,
      null,
      newUser
    );
  }
);

router.put(
  "/resetpassword",
  ResetPasswordValidation,
  UserInputValidation,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return ReturnResponse(res, 401, "User Email Not Found.", false);
      }
      await user.resetgeneratePassword();
      const newUser = await user.save();
      console.log(newUser);
      const html = `
    <div>
    <h1>Reset Your Password By Clicking Below Link.</h1>
    <p>Hello ${newUser.username} </p>
    <a href="${APP_DOMAIN}users/reset-password/${newUser.resetPasswordToken}">Click To Reset Password</a>
    </div>
    `;
      SendMailToRegisterUser(
        newUser.email,
        "User Reset Password",
        "Please Your  Reset Password ",
        html
      );
      return ReturnResponse(
        res,
        200,
        "Reset Link has been sent to your email, Check Your email to Reset password ",
        true
      );
    } catch (err) {
      return ReturnResponse(res, 400, err.message, false);
    }
  }
);

router.get("/reset-password/:resetPasswordToken", async (req, res, next) => {
  const { resetPasswordToken } = req.params;
  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return ReturnResponse(
        res,
        400,
        "Invalid User Reset Password Token or Expired",
        false
      );
    }
    return res.sendFile(join(__dirname, "../../templates/reset-password.html"));
  } catch (err) {
    return res.sendFile(
      join(__dirname, "../../templates/verification-error.html")
    );
  }
});
router.post("/reset-password/:resetPasswordToken", async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return ReturnResponse(
        res,
        400,
        "Invalid User Reset Password Token or Expired",
        false
      );
    }
    user.password = password;
    user.resetPasswordExpiry = undefined;
    user.resetPasswordToken = undefined;
    const newUser = await user.save();
    const html = `
    <div>
    <p>Hello ${newUser.username} </p>
    <h1>You have Reset Your password Successfully</h1>
    </div>
    `;
    SendMailToRegisterUser(
      newUser.email,
      "User Reset Password successfully",
      "Successfull Reset Password Confirmation Email ",
      html
    );
    return ReturnResponse(
      res,
      200,
      "User Reset His Password Successfully",
      true
    );
  } catch (err) {
    return res.sendFile(
      join(__dirname, "../../templates/verification-error.html")
    );
  }
});
export default router;
