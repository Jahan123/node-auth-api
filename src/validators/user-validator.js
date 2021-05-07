import { check } from "express-validator";

const name = check("name", "Name Is required.").not().isEmpty();
const username = check("username", "Username Is required.").not().isEmpty();
const password = check(
  "password",
  "Password Is Required and Must Be 10 Charecter"
)
  .not()
  .isEmpty()
  .isLength({ min: 10 });
const email = check("email", "Please Provide Valid Email.")
  .not()
  .isEmpty()
  .isEmail();

export const RegistrationValidation = [email, password, username, name];
export const AuthorizationValidation = [username, password];
export const ResetPasswordValidation = [email];
