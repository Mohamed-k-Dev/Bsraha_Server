import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export async function generateAccessToken({ data, options } = {}) {
  return jwt.sign(data, process.env.JWT_ACCESS_KEY, {
    ...options,
    expiresIn: process.env.JWT_ACCESS_EXPIRE,
    jwtid: uuidv4(),
  });
}

export async function generateRefreshToken({ data, options } = {}) {
  return jwt.sign(data, process.env.JWT_REFRESH_KEY, {
    ...options,
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
    jwtid: uuidv4(),
  });
}

export async function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_KEY);
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      throw new Error("Access token is expired", { cause: 401 });
    } else if (error.name == "JsonWebTokenError") {
      throw new Error("Access token is invalid", { cause: 401 });
    }
  }
}

export async function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY);
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      throw new Error("Refresh token is expired", { cause: 401 });
    } else if (error.name == "JsonWebTokenError") {
      throw new Error("Refresh token is invalid", { cause: 401 });
    }
  }
}
