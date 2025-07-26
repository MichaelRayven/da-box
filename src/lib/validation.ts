import { z } from "zod";

// Username: 3–30 characters, alphanumeric, optional underscores or dashes
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must be at most 30 characters long")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, or dashes"
  );

// Email: valid email format
export const emailSchema = z
  .string({
    required_error: "Email is required",
  })
  .min(1, "Email is required")
  .email("Invalid email address");

export const confirmPasswordSchema = z
  .string({
    required_error: "Confirm password is required",
  })
  .min(1, "Confirm password is required");

// Password: at least 8 characters, one uppercase, one lowercase, one number, one special character
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const signUpSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // this will show the error on the password and confirmPassword field
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const emailSignInSchema = z.object({
  email: emailSchema,
});
