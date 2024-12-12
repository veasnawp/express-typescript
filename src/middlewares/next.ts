import { NextFunction, Request, Response } from "express";
import lodash from 'lodash'
import { User } from "../mongodb/model/index.js";
import { setExpireCookie } from "../controller/authController.js";
import asyncHandler from "./asyncHandler.js";

const { get, merge } = lodash;

export const getIdentity = (req: Request) => {
  const user = get(req, 'identity') as unknown;
  return user as UserProps | undefined
}

export const getDataFromRequest = (req: Request, key: string) => {
  const data = get(req, key) as unknown;
  return data as any
}

export const isAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let role = getIdentity(req)?.role;

  try {
    if (!(role === "admin")) {
      return res.sendStatus(403);
    }
    next();
  } catch (error) {
    return res.status(400).send({ error: (error as Error).message });
  }
})

export const isOwner = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = getIdentity(req);
  const role = user?.role;
  if (role === "admin") {
    return next();
  }
  const { id, userId } = req.params;

  let ID = id || userId;
  if (userId && !req.path.startsWith('/users/')) {
    ID = userId
  }

  const currentUserId = user?._id;
  try {
    if (!currentUserId) {
      return res.sendStatus(403);
    }
    if (currentUserId.toString() !== ID) {
      return res.sendStatus(403);
    }
    next();
  } catch (error) {
    return res.status(400).send({ error: (error as Error).message, currentUserId });
  }
})

export const isAuthentication = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req?.cookies?.['user_session'];

  try {
    if (!accessToken) {
      return res.sendStatus(403);
    }
    const user = await User.findOne({ "authentication.accessToken": accessToken }).lean()

    if (!user) {
      return res.status(401).send({ error: "User not found" });
    }

    merge(req, { identity: user });
    return next()
  } catch (error) {
    return res.status(400).send({ error: (error as Error).message, accessToken });
  }
})


export const __getUserByAccessToken = async (
  accessToken: string,
  res: Response
) => {

  if (!accessToken) {
    return res.status(201).send({ error: "no session" });
  }
  try {
    const user = await User.findOne({ "authentication.accessToken": accessToken }).lean();
    const userAuth = user?.authentication;

    if (!userAuth) {
      setExpireCookie(res)
      return res.status(401).send({ error: "User not found" });
    }
    user.authentication = {
      ...userAuth
    }

    if (user.password) {
      delete user.password
    }

    return res.status(200).send(user).end()
  } catch (error) {
    return res.status(400).send({ error: (error as Error).message, accessToken });
  }
}

export const getUserByAccessToken = asyncHandler(async (req, res) => {
  const accessToken = req.body.token;
  return await __getUserByAccessToken(accessToken, res);
})

export const getUserSession = asyncHandler(async (req, res, next) => {
  const accessToken = req?.cookies?.['user_session'];
  return await __getUserByAccessToken(accessToken, res);
})
