import fs from 'fs';
import path from 'path';
import url from 'url';
import { setCustomCookie } from '../controller/authController.js';
import { asyncHandler } from '../middlewares/index.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const authenticationForm = (
  type: "register"|"login"|"forgotPassword"|"resetPasswordPage"
) => asyncHandler(async (req, res) => {
  if(type === "resetPasswordPage"){
    const { token } = req.query;
    if (typeof token === 'string' && token)
      setCustomCookie(res, 'reset_token', token, 3600 * 1000);
  }
  const html = fs.readFileSync(path.join(__dirname, 'html', `${type}.html`), {
    encoding: 'utf8',
  });

  res.type('html');
  return res.status(200).send(html);
});

export const registerPage = authenticationForm("register");
export const loginPage = authenticationForm("login");
export const forgotPasswordPage = authenticationForm("forgotPassword");
export const requestPasswordResetPage = authenticationForm("resetPasswordPage");
