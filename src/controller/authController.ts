import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/index.js";
import { User } from "../mongodb/model/index.js";
import { generatePassword, generateAccessToken, passwordMatch, generateHashedPassword, verifyRefreshToken, tokenIsExpired } from "../helper/index.js";
import ms from 'ms';
import { isNumber } from "../util/index.js";
import { getIpAddress } from "../lib/index.js";
import { IS_DEV } from "../app/constants.js";



/**
 * @desc Token expires in of value of maxAge
 * @example const maxAge = 24 * 3600 * 1000 // 1 day
 * const maxAge = 60 * 1000 // 1 minute
 */
export const defaultMaxAge = 30 * 24 * 3600 * 1000

/**
 * @readDocs https://www.npmjs.com/package/ms
 */
export const expireTime = ms(defaultMaxAge)

export const setCustomCookie = (res: Response, cookie_name: string, cookie_value: string, maxAge = defaultMaxAge) => {
  res.cookie(cookie_name, cookie_value, {
    maxAge: maxAge,
    httpOnly: true,
    secure: IS_DEV,
    sameSite: 'strict'
  })
}

export const setCookie = (res: Response, accessToken: string, maxAge = defaultMaxAge) => {
  res.cookie('user_session', accessToken, {
    maxAge: maxAge,
    httpOnly: true,
    secure: IS_DEV,
    sameSite: 'strict'
  })
}

export const setExpireCookie = (res: Response, cookie_name?: string) => {
  res.cookie(cookie_name || 'user_session', '', {
    httpOnly: true,
    expires: new Date(0),
  })
}

export const isValidEmail = (email: string) => {
  // /^\S+@\S+$/ /?_end=([0-9])&_start=([0-9])$/
  return /^(([^<>()[\]\\.,;:#\s@"]+(\.[^<>()[\]\\.,;:#\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    .test(email.toLowerCase())
}

export const isInValidPassword = (value: string) => {
  if (value.length < 6) {
    return "Password must be at least 6 characters long";
  }

  if (!/[A-Z]/.test(value)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(value)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(value)) {
    return "Password must contain at least one number";
  }

  if (value.length > 60) {
    return "Password is too long";
  }
}

/**
 * @api {post} /register
 * @apiGroup Authentication
 * @access Public
 */
export const register = asyncHandler(async (req, res) => {

  let newUserBody = req.body;
  let { email, username, password, withSocial, name, provider } = newUserBody;

  const withOauth = provider === 'oauth';
  if (!password && withOauth) {
    password = generatePassword() + "__random";
  }

  if (!['oauth', 'credentials'].some(v => v === provider))
    return res.status(401).send({ error: "Invalid Credentials" });
  if (!email || !password)
    return res.status(400).send({ error: "Please provide an email" });

  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: "incorrect email"
    });
  }

  const invalidPasswordMessage = isInValidPassword(password)
  if (invalidPasswordMessage) {
    return res.status(400).json({
      error: invalidPasswordMessage
    });
  }


  const userExists = await User.findOne({ email })
  if (userExists)
    return res.status(200).json({
      email: userExists.email,
      error: "user already registered"
    });

  const ip = (await getIpAddress(''))?.ip
  const users = await User.find({ 'authentication.ip': ip }).select('authentication');
  const ips = users.map(user => user.authentication?.ip);
  if (!IS_DEV && ips.length >= 1) {
    return res.status(400).json({
      error: "User created many accounts",
      message: "Please don't create many accounts. You can delete old account and create a new one."
    });
  }

  if (!username) {
    const emailSplit = email.split('@')
    newUserBody.username = (emailSplit[0] + '_' + emailSplit[1].split('.')[0]).toLowerCase();
  }

  const accessToken = generateAccessToken({ email }, 'access', { expiresIn: expireTime });
  const refreshToken = generateAccessToken({ email }, 'refresh');

  if (password) {
    const hashedPassword = await generateHashedPassword(password);
    newUserBody = {
      ...newUserBody,
      password: hashedPassword,
      authentication: {
        accessToken: accessToken,
        refreshToken,
        ip
      }
    }
  }

  const userCreated = new User(newUserBody);
  const user = await userCreated.save();
  setCookie(res, accessToken);

  const userObj = user.toObject();
  if (userObj.password) {
    delete userObj.password
  }
  res.status(200).send(userObj).end();
})

/**
 * @api {post} /login
 * @apiGroup Authentication
 * @access Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  let newUserBody = req.body;
  let { email, password, provider } = newUserBody;

  const withOauth = provider === 'oauth';
  if (!password && withOauth) {
    password = generatePassword() + "__random";
  }


  if (!['oauth', 'credentials'].some(v => v === provider))
    return res.status(401).send({ error: "Invalid Credentials" });
  if (!email || !password)
    return res.status(400).send({ error: "Please provide an email" });

  const user = await User.findOne({ email })
  if (!user) return res.status(401).send({ error: "User not found" });

  const userAuth = user.authentication

  console.log("userAuth", userAuth)

  if (userAuth && user.password) {
    if (!(user.provider === 'oauth') && !withOauth) {
      const passwordIsValid = await passwordMatch(password, user.password);

      if (!passwordIsValid) {
        return res.status(403).send({ error: "Incorrect password" });
      }
    }

    const ip = (await getIpAddress(''))?.ip
    let userAuthUpdate = {
      ...userAuth,
      ip: ip || userAuth.ip,
    }
    let accessToken = userAuth.accessToken as string
    if (accessToken) {
      if (tokenIsExpired(accessToken)) {
        accessToken = generateAccessToken({ email }, 'access', { expiresIn: expireTime });
        const refreshToken = generateAccessToken({ email }, 'refresh');
        userAuthUpdate.accessToken = accessToken
        userAuthUpdate.refreshToken = refreshToken
      }
    }
    user.authentication = {
      ...userAuthUpdate
    }
    if (withOauth) {
      user.provider = provider
      if (typeof newUserBody.avatar === 'string')
        user.avatar = newUserBody.avatar
    }

    await user.save();

    setCookie(res, accessToken);
  }

  let userObj = user.toObject();
  if (userObj.password) {
    delete userObj.password
  }

  res.status(200).send(userObj).end();
})

/**
 * @api {post} /logout
 * @apiGroup Authentication
 * @access Public
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  setExpireCookie(res);
  res.status(200).json({ message: "User logged out" })
})

/**
 * @api {post} /token
 * @apiGroup Authentication
 * @access Public
 */
export const token = asyncHandler(async (req: Request, res: Response) => {
  let refreshToken = req.body.token || req.query.token;
  let maxAge = req.body.maxAge || req.query.maxAge;

  if (!refreshToken) return res.sendStatus(401);

  const user = await User.findOne({ "authentication.refreshToken": refreshToken });
  const userAuth = user?.authentication
  if (!user || !userAuth || userAuth.refreshToken !== refreshToken)
    return res.status(401).send({ error: "User not found" });

  verifyRefreshToken(refreshToken, async (err, userToken) => {
    if (err) return res.sendStatus(403);
    if (!userToken || typeof userToken === 'string' || !userToken.email) return res.status(401).send({ error: "User not found" });

    let expiresIn = expireTime;
    if (isNumber(maxAge)) {
      maxAge = Number(maxAge);
      expiresIn = ms(maxAge);
    } else {
      maxAge = undefined
    }
    const email = userToken.email
    const accessToken = generateAccessToken({ email }, 'access', { expiresIn });
    user.authentication = { ...userAuth, accessToken: accessToken }
    await user.save();

    setCookie(res, accessToken, maxAge);

    res.status(200).send({ accessToken: accessToken }).end()
  })
})

/**
 * @api {post} /passwordReset
 * @apiGroup Authentication
 * @access Private
 */
export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  let newUserBody = req.body;
  let { password, provider } = newUserBody;

  const withOauth = provider === 'oauth';
  if (!password && withOauth) {
    password = generatePassword() + "__random";
  }

  if (!['oauth', 'credentials'].some(v => v === provider))
    return res.status(401).send({ error: "Invalid Credentials" });
  if (!password)
    return res.status(400).send({ error: "Please provide an password" });

  const invalidPasswordMessage = isInValidPassword(password)
  if (invalidPasswordMessage) {
    return res.status(400).json({
      error: invalidPasswordMessage
    });
  }

  const user = await User.findById(id);
  const userAuth = user?.authentication

  if (!user || !userAuth)
    return res.status(401).send({ error: "User not found" });

  const email = user.email
  const accessToken = generateAccessToken({ email }, 'access');
  const refreshToken = generateAccessToken({ email }, 'refresh');
  const hashedPassword = await generateHashedPassword(password);
  user.authentication = {
    ...userAuth,
    accessToken: accessToken,
    refreshToken
  }
  user.password = hashedPassword;
  await user.save();

  setCookie(res, accessToken);
  res.status(200).send({ message: 'Your password changed successful', accessToken }).end()
})