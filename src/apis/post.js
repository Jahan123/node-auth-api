import { Router } from "express";
import { APP_DOMAIN } from "../constants/index";
import passport from "passport";
import ReturnResponse from "../functions/response-builder";
import upload_post_image from "../middlewares/post-image-upload";
import UserInputValidation from "../middlewares/register-user-validation";
import { PostValidation } from "../validators/post-validator";
import Post from "../models/post";
import SlugGenerator from "../functions/slug-generator";
const router = Router();

router.post(
  "/image-upload",
  passport.authenticate("jwt", { session: false }),
  upload_post_image.single("postImage"),
  (req, res) => {
    try {
      const imagefile = req.file;
      return ReturnResponse(
        res,
        200,
        {
          text: "Uploaded Post Image Successfully",
          postImageLink: `${APP_DOMAIN}${imagefile.path}`,
        },
        true
      );
    } catch (err) {
      return ReturnResponse(res, 400, err.message, false);
    }
  }
);

router.post(
  "/create-post",
  passport.authenticate("jwt", { session: false }),
  PostValidation,
  UserInputValidation,
  async (req, res) => {
    const { title, content, postImage } = req.body;
    try {
      const post = new Post({
        title,
        content,
        slug: SlugGenerator(title),
        postImage,
        author: req.user._id,
      });
      const newPost = await post.save();
      return ReturnResponse(
        res,
        201,
        { text: "Post Created Successfully", post: newPost },
        true
      );
    } catch (err) {
      return ReturnResponse(res, 400, err.message, false);
    }
  }
);

router.put(
  "/update-post/:postId",
  passport.authenticate("jwt", { session: false }),
  upload_post_image.single("postImage"),
  async (req, res) => {
    const { postId } = req.params;
    const imagefile = req.file;
    let slugField = "";
    try {
      const checkpost = await Post.findById(postId);
      if (req.body.title) {
        slugField = req.body.title;
      } else {
        slugField = checkpost.title;
      }
      const post = await Post.findOneAndUpdate(
        { author: req.user._id, _id: postId },
        {
          ...req.body,
          postImage: `${APP_DOMAIN}${imagefile.path}`,
          slug: SlugGenerator(slugField),
        },
        { new: true }
      );
      if (!post) {
        ReturnResponse(res, 404, "Post Not Found", false);
      }
      ReturnResponse(
        res,
        200,
        { text: "User Updated Post Successfully", post },
        true
      );
    } catch (err) {
      return ReturnResponse(res, 400, err.message, false);
    }
  }
);

router.get(
  "/likes/:postId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { postId } = req.params;
    const { _id } = req.user;
    try {
      const post = await Post.findById(postId);
      if (post.likes.users.includes(req.user._id)) {
        return ReturnResponse(
          res,
          400,
          "You Have Already Like The post",
          false
        );
      } else {
        post.likes.count++;
        post.likes.users.push(req.user._id);
        const newPost = await post.save();
        return ReturnResponse(
          res,
          200,
          { text: "User like the post Successfully", post: newPost },
          true
        );
      }
    } catch (err) {
      return ReturnResponse(res, 400, err.message, false);
    }
  }
);

export default router;
