import Joi from "joi";

export const signUpSchema = {
  body: Joi.object({
    userName: Joi.string()
      .required()
      .trim()
      .min(3)
      .max(30)
      // .alphanum()
      .uppercase()
      .messages({
        "string.min": "User name must be at least 3 characters long",
        "string.max": "User name must be at most 30 characters long",
        "string.alphanum":
          "User name must only contain alphanumeric characters",
        "any.required": "User name is required",
        "string.empty": "User name is required",
        "string.base": "User name must be a string",
      }),
    email: Joi.string()
      .required()
      .email({
        tlds: {
          allow: ["com", "net", "org", "edu", "gov", "mil", "io", "co"],
        },
        maxDomainSegments: 2,
      })
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      .messages({
        "string.email": "Please fill a valid email address",
        "any.required": "Email is required",
        "string.empty": "Email is required",
        "string.base": "Email must be a string",
      }),
    password: Joi.string()
      .required()
      .min(8)
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password must be at most 100 characters long",
        "any.required": "Password is required",
        "string.empty": "Password is required",
        "string.base": "Password must be a string",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "any.only": "Password and confirm password must match",
        "any.required": "Confirm password is required",
        "string.empty": "Confirm password is required",
        "string.base": "Confirm password must be a string",
      }),
    gender: Joi.string()
      .valid("male", "female")
      .default("male")
      .lowercase()
      .messages({
        "any.only": "Gender must be 'male' or 'female'",
      }),
    age: Joi.number().required().min(18).max(100).messages({
      "number.base": "Age must be a number",
      "number.min": "Age must be at least 18",
      "number.max": "Age must be at most 100",
      "any.required": "Age is required",
    }),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    bio: Joi.string().optional(),
    birthDate: Joi.date().optional(),
    imageUrl: Joi.string().optional(),
    role: Joi.string()
      .valid("user", "admin", "super-admin")
      .default("user")
      .messages({
        "any.only": "Role must be 'user', 'admin', or 'super-admin'",
      }),
  }).messages({
    "object.unknown": "Unknown field: {{#label}}",
  }),
};
export const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .required()
      .email({
        tlds: {
          allow: ["com", "net", "org", "edu", "gov", "mil", "io", "co"],
        },
        maxDomainSegments: 2,
      })
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      .messages({
        "string.email": "Please fill a valid email address",
        "any.required": "Email is required",
        "string.empty": "Email is required",
        "string.base": "Email must be a string",
      }),
    password: Joi.string()
      .required()
      .min(8)
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password must be at most 100 characters long",
        "any.required": "Password is required",
        "string.empty": "Password is required",
        "string.base": "Password must be a string",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
  })
};
export const verifyEmailSchema = {
  body: Joi.object({
    email: Joi.string()
      .required()
      .email({
        tlds: {
          allow: ["com", "net", "org", "edu", "gov", "mil", "io", "co"],
        },
        maxDomainSegments: 2,
      })
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      .messages({
        "string.email": "Please fill a valid email address",
        "any.required": "Email is required",
        "string.empty": "Email is required",
        "string.base": "Email must be a string",
      }),
    otp: Joi.string()
      .required()
      .regex(/^[0-9]{6}$/)
      .messages({
        "string.length": "OTP must be 6 digits",
        "string.pattern.base": "OTP must be a 6-digit number",
        "any.required": "OTP is required",
        "string.empty": "OTP is required",
        "string.base": "OTP must be a string",
      }),
  }),
};
export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string()
      .required()
      .email({
        tlds: {
          allow: ["com", "net", "org", "edu", "gov", "mil", "io", "co"],
        },
        maxDomainSegments: 2,
      })
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      .messages({
        "string.email": "Please fill a valid email address",
        "any.required": "Email is required",
        "string.empty": "Email is required",
        "string.base": "Email must be a string",
      }),
  }),
};
export const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string()
      .required()
      .email({
        tlds: {
          allow: ["com", "net", "org", "edu", "gov", "mil", "io", "co"],
        },
        maxDomainSegments: 2,
      })
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      .messages({
        "string.email": "Please fill a valid email address",
        "any.required": "Email is required",
        "string.empty": "Email is required",
        "string.base": "Email must be a string",
      }),
    password: Joi.string()
      .required()
      .min(8)
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password must be at most 100 characters long",
        "any.required": "Password is required",
        "string.empty": "Password is required",
        "string.base": "Password must be a string",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "any.only": "Password and confirm password must match",
        "any.required": "Confirm password is required",
        "string.empty": "Confirm password is required",
        "string.base": "Confirm password must be a string",
      }),
    otp: Joi.string()
      .required()
      .regex(/^[0-9]{6}$/)
      .messages({
        "string.length": "OTP must be 6 digits",
        "string.pattern.base": "OTP must be a 6-digit number",
        "any.required": "OTP is required",
        "string.empty": "OTP is required",
        "string.base": "OTP must be a string",
      }),
  }),
};
export const googleSchema = {
  body: Joi.object({
    idToken: Joi.string().required().messages({
      "any.required": "ID token is required",
      "string.empty": "ID token is required",
      "string.base": "ID token must be a string",
    }),
  }),
};
