import sgMail from "@sendgrid/mail";
import consola from "consola";
import { SENDGRID_API, SENDER_EMAIL } from "../constants/index";

const SendMailToRegisterUser = async (email, text, subject, html) => {
  sgMail.setApiKey(SENDGRID_API);
  const message = {
    to: email,
    from: SENDER_EMAIL,
    text,
    subject,
    html,
  };
  try {
    await sgMail.send(message);
    consola.success("Mail Send");
  } catch (e) {
    consola.error("Unable To Send Mail" + e.message);
  }
};
export default SendMailToRegisterUser;
