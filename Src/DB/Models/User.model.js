import mongoose from "mongoose";
import { SYSTEM_PROVIDERS, SYSTEM_RULES } from "../../Constants/Constants.js";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minLength: [3, "User name must be at least 3 characters long"],
      maxLength: [30, "User name must be at most 30 characters long"],
      lowercase: true,
    },
    displayName: {
      type: String,
      trim: true,
      required: [true, "Display name is required"],
      unique: [true, "Display name already exists"],
      minLength: [3, "Display name must be at least 3 characters long"],
      maxLength: [30, "Display name must be at most 30 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      trim: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters long"],
      RegExp: {
        pattern:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
    gender: {
      type: String,
      lowercase: true,
      enum: ["male", "female"],
      default: "male",
    },
    age: {
      type: Number,
      min: [18, "Age must be at least 18"],
      max: [100, "Age must be at most 100"],
    },
    phone: String,
    image: {
      url: String,
      public_id: String,
    },
    coverImages: [
      {
        url: String,
        public_id: String,
      },
    ],
    address: String,
    bio: String,
    birthDate: {
      type: Date,
      max: [new Date(), "Birth date cannot be in the future"],
    },
    role: {
      type: String,
      enum: Object.values(SYSTEM_RULES),
      default: SYSTEM_RULES.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpiration: Date,
    forgetOtp: String,
    forgetOtpExpiration: Date,
    provider: {
      type: String,
      default: SYSTEM_PROVIDERS.SYSTEM,
      enum: Object.values(SYSTEM_PROVIDERS),
    },
  },
  { timestamps: true }
);


UserSchema.pre("save", function () {
  if (this.isModified("displayName") && !this.displayName.endsWith("Bsraha")) {
    this.displayName = this.displayName + "@Bsraha";
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
