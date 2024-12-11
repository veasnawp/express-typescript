import nodemailer from "nodemailer"
import { asyncHandler } from "../middlewares/index.js";
import { User } from "../mongodb/model/index.js";
import { generateAccessToken, tokenIsExpired } from "../helper/index.js";
import { CLIENT_URL } from "../app/constants.js";
import { isInValidPassword } from "./authController.js";
import type { SendMailOptions } from "nodemailer";

const GMAIL_SECRET = process.env.GMAIL_SECRET?.split('|');
const GMAIL_USERNAME = `${GMAIL_SECRET?.[0]}@gmail.com`;
const GMAIL_PASSWORD = GMAIL_SECRET?.[1];


const requestResetPasswordHtml = (name: string, link: string) => {
  return (
`<html>
  <head><style></style></head>
  <body>
    <p>Hi ${name},</p>
    <p>You requested to reset your password.</p>
    <p> Please, click the link below to reset your password</p>
    <a href="${link}">Reset Password</a>
  </body>
</html>`
  )
}

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email as string;

  const user = await User.findOne({ email }).lean()
  if (!user) return res.status(401).send({ error: "User not found" });

  const resetToken = generateAccessToken({ email }, 'access', { expiresIn: '10m' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USERNAME,
      pass: GMAIL_PASSWORD as string,
    },
  });
  const mailOptions: SendMailOptions = {
    from: GMAIL_USERNAME,
    to: email,
    subject: 'Password Reset',
    html: requestResetPasswordHtml(
      user.name || user.username as string,
      `${CLIENT_URL}/reset-password/?token=${resetToken}&id=${user._id.toString()}`
    ),
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error.message)
      res.status(500).send({ error: 'Error sending email' });
    } else {
      console.log(`Email sent: ${info.response}`);
      res.status(200).send({ message: 'Check your email for instructions on resetting your password' });
    }
  });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (tokenIsExpired(token)) {
    return res.status(400).json({
      error: "Expired reset token"
    });
  }

  const invalidPasswordMessage = isInValidPassword(password)
  if (invalidPasswordMessage) {
    return res.status(400).json({
      error: invalidPasswordMessage
    });
  }

  const user = await User.findOne({ resetToken: token });
  const userAuth = user?.authentication
  if (!userAuth) {
    return res.status(401).send({ error: "Invalid or expired password reset token" });
  } else {
    user.password = password;
    delete userAuth.resetToken;
    await user.save();
    res.status(200).send({ message: 'Password updated successfully' });
  }
});