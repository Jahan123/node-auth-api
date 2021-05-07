import { Schema, model } from "mongoose";
import { hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { APP_SECRET_KEY } from "../constants/index";
import { randomBytes } from "crypto";
import { pick } from "lodash";
const UserSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationcode: {
      type: String,
      required: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpiry: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  user.password = await hash(user.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await compare(password, this.password);
};
UserSchema.methods.generateToken = async function () {
  const payload = {
    name: this.name,
    username: this.username,
    email: this.email,
    id: this._id,
  };
  const token = await sign(payload, APP_SECRET_KEY, { expiresIn: "1d" });
  return token;
};

UserSchema.methods.resetgeneratePassword = function () {
  this.resetPasswordExpiry = new Date(Date.now() + 36000000);
  this.resetPasswordToken = randomBytes(20).toString("hex");
};

UserSchema.methods.getUserInfo = function () {
  return pick(this, ["_id", "email", "username", "name", "verified"]);
};

const User = model("User", UserSchema);
export default User;
