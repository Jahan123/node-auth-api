import { check } from "express-validator";

const title = check("title", "Title Is required").not().isEmpty();
const content = check("content", "Content is Required").not().isEmpty();
export const PostValidation = [title, content];
