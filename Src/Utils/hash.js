import { compareSync, hashSync } from "bcrypt";

export async function hash(data, salt = +process.env.SALT) {
  return hashSync(data, salt);
}

export async function compare(data, hashedData) {
  return compareSync(data.toString(), hashedData);
}
