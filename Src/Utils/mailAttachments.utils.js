import path from "path";
import fs from "node:fs";

export function mailAttachmentsHandler(fileName) {
  return {
    filename: fileName,
    content: fs
      .readFileSync(path.resolve(`Assets/${fileName}`))
      .toString("base64"),
  };
}
