import { config } from "dotenv";
config();
export const SENDGRID_API = process.env.SENDGRID_API;
export const APP_DB = process.env.APP_DB;
export const APP_PORT = process.env.APP_PORT;
export const APP_DOMAIN = process.env.APP_DOMAIN;
export const APP_SECRET_KEY = process.env.APP_SECRET_KEY;
export const SENDER_EMAIL = process.env.SENDER_EMAIL;
