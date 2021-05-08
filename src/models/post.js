import paginator from "mongoose-paginate-v2";
import { Schema, model } from "mongoose";
const PostSchema = Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    postImage: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: false,
    },
    likes: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

PostSchema.plugin(paginator);

const Post = model("Post", PostSchema);
export default Post;

/**
 * 1.upload postimage
 * 2.save post data
 * 3.update post router
 * 4. like dislike functionlity
 */
