import type { Router } from "express";
import { forgotPasswordPage, loginPage, registerPage, requestPasswordResetPage } from "./authPages.js";


export default (router: Router) => {
  router.route("/login").get(loginPage);
  router.route("/register").get(registerPage);
  router.route("/forgot-password").get(forgotPasswordPage);
  router.route("/reset-password").get(requestPasswordResetPage);
};