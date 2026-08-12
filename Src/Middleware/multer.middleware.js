import multer from "multer";
import path from "path";
import fs from "fs";

export default function Multer(allowedFileTypes = []) {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  };

  const upload = multer({ fileFilter, storage });
  return upload;
}

// Multer middleware for handling file uploads and saving them to the specified folder (locally)

// export default function Multer(
//   folder = "generalImages",
//   allowedFileTypes = []
// ) {
//   const filePath = path.resolve(`Assets/${folder}`);
//   if (!fs.existsSync(filePath)) {
//     fs.mkdirSync(filePath, { recursive: true });
//   }

//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, filePath);
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, uniqueSuffix + "-" + file.originalname);
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     if (allowedFileTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Invalid file type"), false);
//     }
//   };

//   const upload = multer({ fileFilter, storage });
//   return upload;
// }
