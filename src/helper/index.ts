import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

const TOKEN_SECRET = process.env.TOKEN_SECRET
const ACCESS_TOKEN = TOKEN_SECRET + '-ACCESS-TOKEN'; //-ACCESS-TOKEN
const REFRESH_TOKEN = TOKEN_SECRET + '-REFRESH-TOKEN';

export function tokenIsExpired(token: string) {
  const decodedJwt = JSON.parse(atob(token.split(".")[1]));
  return decodedJwt?.exp * 1000 < Date.now()
}

export async function generateHashedPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function passwordMatch(inputPassword: string, userPassword: string) {
  return await bcrypt.compare(
    inputPassword,
    userPassword
  )
}

export const generateAccessToken = (user: string | object | Buffer, key: "access" | "refresh", options?: jwt.SignOptions) => {
  const secretKey = key === "access" ? ACCESS_TOKEN : REFRESH_TOKEN;
  return jwt.sign(user, secretKey, options)
}

export const verifyToken = (token: string, callback?: jwt.VerifyCallback<string | jwt.JwtPayload> | undefined) => {
  return jwt.verify(token, ACCESS_TOKEN, callback)
}

export const verifyRefreshToken = (refreshToken: string, callback?: jwt.VerifyCallback<string | jwt.JwtPayload> | undefined) => {
  return jwt.verify(refreshToken, REFRESH_TOKEN, callback)
}

export function generatePassword(passwordLength = 18, useLowercaseCb = true, useUppercaseCb = true, useDigitsCb = true, useSpecialsCb = true) {
  let dictionary = "";
  if (useLowercaseCb) {
    dictionary += "qwertyuiopasdfghjklzxcvbnm";
  }
  if (useUppercaseCb) {
    dictionary += "QWERTYUIOPASDFGHJKLZXCVBNM";
  }
  if (useDigitsCb) {
    dictionary += "1234567890";
  }
  if (useSpecialsCb) {
    dictionary += "!@#$%^&*()_+-={}[];<>:";
  }
  const length = passwordLength;

  if (length < 1 || dictionary.length === 0) {
    return;
  }

  let password = "";
  for (let i = 0; i < length; i++) {
    const pos = Math.floor(Math.random() * dictionary.length);
    password += dictionary[pos];
  }

  return password
}
