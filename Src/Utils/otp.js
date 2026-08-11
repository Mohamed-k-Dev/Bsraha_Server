import { hashData } from "./hash.js";

export const generateOtp = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiration = new Date(
    Date.now() + +process.env.OTP_EXPIRATION * 60 * 1000
  );
  const hashedOtp = await hashData(otp, +process.env.OTP_SALT);
  return { otp, otpExpiration, hashedOtp };
};
