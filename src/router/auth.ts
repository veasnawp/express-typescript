import { Router } from "express";
import {
  login,
  logout,
  register,
  token,
} from "../controller/authController.js";
import { getUserSession } from "../middlewares/next.js";
import { rateLimiter } from "../middlewares/index.js";
import {
  forgotPassword,
  requestPasswordReset,
} from "../controller/resetPassword.js";

const customLimitRequest = () => {
  return rateLimiter({
    windowMs: 30 * 60 * 1000,
    limit: 10,
  });
};

const limiterRequest = customLimitRequest();

export default (router: Router) => {
  router.route("/auth/register").post(limiterRequest, register);
  router.route("/auth/login").post(limiterRequest, login);
  router.route("/auth/logout").post(logout);
  router.route("/auth/token").post(token);
  router.route("/auth/reset-password").post(requestPasswordReset);
  router.route("/auth/forgot-password").post(forgotPassword);
  router.route("/auth/session").post(getUserSession);
};
