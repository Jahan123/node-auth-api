import { model, Schema } from "mongoose";

const ProfileSchema = Schema(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    avatar: {
      type: String,
      required: false,
    },
    social: {
      twitter: {
        type: String,
        required: false,
      },
      instagram: {
        type: String,
        required: false,
      },
      linkedin: {
        type: String,
        required: false,
      },
      github: { type: String, required: false },
    },
  },
  { timestamps: true }
);

const Profile = model("Profile", ProfileSchema);
export default Profile;
