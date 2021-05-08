import { Router } from "express";
import Profile from "../models/profile";
import upload from "../middlewares/image-uploader";
import passport from "passport";
import ReturnResponse from "../functions/response-builder";
import { APP_DOMAIN } from "../constants/index";
import User from "../models/user";

const router = Router();

router.post(
  "/create-profile",
  upload.single("avatar"),
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const { twitter, linkedin, github, instagram } = req.body;
    try {
      const profile = await Profile({
        account: req.user._id,
        social: {
          twitter,
          linkedin,
          github,
          instagram,
        },
        avatar: `${APP_DOMAIN}${req.file.path}`,
      });
      const newProfile = await profile.save();
      return ReturnResponse(
        res,
        201,
        "User Created His Profile Successfully",
        true,
        null,
        newProfile
      );
    } catch (err) {
      return ReturnResponse(res, 400, err.message, false);
    }
  }
);

router.put(
  "/update-profile/",
  upload.single("avatar"),
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log(req.user);
    try {
      const profile = await Profile.findOneAndUpdate(
        { account: req.user._id },
        { social: req.body, avatar: `${APP_DOMAIN}${req.file.path}` },
        { new: true }
      );
      return ReturnResponse(
        res,
        200,
        "User Updated His Profile Successfully",
        true,
        null,
        profile
      );
    } catch (err) {
      return ReturnResponse(res, 400, err.message, false);
    }
  }
);

router.get(
  "/my-profile/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const profile = await await Profile.findOne({
        account: req.user._id,
      }).populate("account", "name username email _id");
      return ReturnResponse(
        res,
        200,
        "User Fetch His Profile Successfully",
        true,
        null,
        profile
      );
    } catch (err) {
      return ReturnResponse(res, 400, err.message, false);
    }
  }
);

router.get("/my-profile/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return ReturnResponse(res, 400, "User Not Found", false);
    }
    const profile = await Profile.findOne({ account: user._id });
    return ReturnResponse(
      res,
      200,
      "User Profile Fetched Successfully",
      true,
      null,
      { ...user.getUserInfo(), profile }
    );
  } catch (err) {
    return ReturnResponse(res, 400, err.message, false);
  }
});

export default router;
