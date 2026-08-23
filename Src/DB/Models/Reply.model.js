import mongoose from "mongoose";
import { encrypt } from "../../Utils/encryption.utils.js";
import decryptContent from "../../Utils/decryptContent.utils.js";

const ReplySchema = new mongoose.Schema(
  {
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      required: [true, "Message is required"],
    },

    parentReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reply",
      default: null,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },

    content: {
      type: String,
      required: [true, "Reply content is required"],
      trim: true,
      maxLength: [1000, "Reply must be at most 1000 characters long"],
    },

    isAnonymous: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/*
|--------------------------------------------------------------------------
| Encrypt content before saving
|--------------------------------------------------------------------------
*/

// ReplySchema.pre("save", function (next) {
//   if (!this.isModified("content")) {
//     return next();
//   }

//   this.content = encrypt({
//     plainText: this.content,
//     secretKey: process.env.REPLY_CONTENT_SECRET_KEY,
//   });

//   next();
// });

// /*
// |--------------------------------------------------------------------------
// | Decrypt content when MongoDB initializes the document
// |--------------------------------------------------------------------------
// */

// ReplySchema.post("init", function (doc) {
//   if (!doc.content) {
//     return;
//   }

//   try {
//     doc.content = decrypt({
//       cipherText: doc.content,
//       secretKey: process.env.REPLY_CONTENT_SECRET_KEY,
//     });
//   } catch (error) {
//     console.error("Failed to decrypt reply content:", error.message);
//   }
// });

// /*
// |--------------------------------------------------------------------------
// | Decrypt the document returned by create/save
// |--------------------------------------------------------------------------
// |
// | post("save") is important because `create()` returns the same
// | document after saving, and post("init") does not run there.
// |
// */

// ReplySchema.post("save", function (doc) {
//   if (!doc.content) {
//     return;
//   }

//   try {
//     doc.content = decrypt({
//       cipherText: doc.content,
//       secretKey: process.env.REPLY_CONTENT_SECRET_KEY,
//     });
//   } catch (error) {
//     console.error("Failed to decrypt reply content:", error.message);
//   }
// });

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

ReplySchema.index({
  message: 1,
  parentReply: 1,
  isDeleted: 1,
  createdAt: -1,
});

ReplySchema.index({
  sender: 1,
  isDeleted: 1,
});

const Reply = mongoose.models.Reply || mongoose.model("Reply", ReplySchema);

export default Reply;

// ReplySchema.pre("save", function (next) {
//   if (!this.isModified("content")) {
//     return next();
//   }

//   this.content = encrypt({
//     plainText: this.content,
//     secretKey: process.env.REPLY_CONTENT_SECRET,
//   });

//   next();
// });

// ReplySchema.post("find", function (docs) {
//   docs.forEach((doc) => {
//     if (doc?.content) {
//       doc.content = decryptContent(doc.content);
//     }
//   });
// });

// ReplySchema.post("findOne", function (doc) {
//   if (doc?.content) {
//     doc.content = decryptContent(doc.content);
//   }
// });

// ReplySchema.post("findOneAndUpdate", function (doc) {
//   if (doc?.content) {
//     doc.content = decryptContent(doc.content);
//   }
// });

// const Reply =
//   mongoose.models.Reply || mongoose.model("Reply", ReplySchema);

// export default Reply;
