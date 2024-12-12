import { asyncHandler } from "../middlewares/index.js";
import { User } from "../mongodb/model/index.js";
import { generateAccessToken, generateHashedPassword, tokenIsExpired } from "../helper/index.js";
import { isInValidPassword } from "./authController.js";
import { sendPasswordResetEmail, sendPasswordResetSuccessfulEmail } from "../nodemailer/email.js";



export const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email as string;

  const user = await User.findOne({ email })
  const userAuth = user?.authentication;
  if (!userAuth) return res.status(401).send({ error: "User not found" });

  const resetToken = generateAccessToken({ email }, 'access', { expiresIn: '1h' });

  sendPasswordResetEmail(
    {
      email, 
      name: user.name||user.username as string, 
      user_id: user._id.toString()
    },
    resetToken,
    async (error, info) => {
    if (error) {
      console.error(error.message)
      res.status(500).send({ error: 'Error sending email' });
    } else {
      userAuth.resetToken = resetToken;
      await user.save();
      console.log(`Email sent: ${info.response}`);
      res.status(200).send({ message: 'Check your email for instructions on resetting your password' });
    }
  })
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const token = req?.cookies?.['reset_token'];

  if (!password || !token) {
    return res.status(400).json({
      error: "Invalid token"
    });
  }

  if (tokenIsExpired(token)) {
    return res.status(400).json({
      error: "Expired password reset token"
    });
  }

  const invalidPasswordMessage = isInValidPassword(password)
  if (invalidPasswordMessage) {
    return res.status(400).json({
      error: invalidPasswordMessage
    });
  }

  const user = await User.findOne({ 'authentication.resetToken': token });
  const userAuth = user?.authentication;
  if (!userAuth) {
    return res.status(401).send({ error: "Invalid User" });
  } else {
    user.password = await generateHashedPassword(password);
    
    sendPasswordResetSuccessfulEmail(
      user.email,
      user.name||user.username as string,
      async (error, info) => {
        if (error) {
          console.error(error.message)
          res.status(500).send({ error: 'Error sending email' });
        } else {
          user.authentication!.resetToken = undefined;
          await user.save();
          console.log(`Email sent: ${info.response}`);
          res.status(200).send({ message: 'Password updated successfully' });
        }
      }
    )
  }
});