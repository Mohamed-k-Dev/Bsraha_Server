import { compare, hash } from "bcrypt";

export async function hashData(data, salt = +process.env.SALT) {
  return hash(data, salt);
}

export async function compareHashedData(data, hashedData) {
  return compare(data.toString(), hashedData);
}
