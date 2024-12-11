import { Router } from "express";
import {
  getUserByUserId,
  getAllUsers,
  updateUserByUserId,
  deleteUserByUserId,
} from "../controller/userControllers.js";
import {
  getUserByAccessToken,
  isAdmin,
  isAuthentication,
  isOwner,
} from "../middlewares/next.js";

export default (router: Router) => {
  router.route("/users").get(isAuthentication, isAdmin, getAllUsers);
  router.route("/users").post(isAuthentication, isAdmin, getAllUsers);

  router.route("/users/:id").post(isAuthentication, isOwner, getUserByUserId);

  // Get User By User Session Token
  router.route("/users/session").post(getUserByAccessToken);

  // Update User By User ID
  router.route("/users/:id").put(isAuthentication, isOwner, updateUserByUserId);

  // Delete User By User ID
  router.route("/users/:id").delete(isAuthentication, isOwner, deleteUserByUserId);
};
