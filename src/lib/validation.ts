import { z } from "zod";

export const nameSchema = z.string().min(1, "Name is required");

// Username: 3–30 characters, alphanumeric, optional underscores or dashes
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must be at most 30 characters long")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, or dashes",
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
    "Password must contain at least one special character",
  );

export const avatarSchema = z.union([
  z
    .custom<File>()
    .refine((file) => {
      if (!file) return true;
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
        "image/gif",
        "image/svg+xml",
        "image/tiff",
      ];
      return validTypes.includes(file.type);
    }, "Unsupported image format")
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "Max file size is 5MB",
    ),
  z.string().url(),
]);

export const signUpSchema = z
  .object({
    name: nameSchema,
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

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  username: usernameSchema.optional(),
  avatar: avatarSchema.optional(),
});

export const fileNameSchema = z.object({
  name: z
    .string()
    .max(255, "Filename is too long")
    .refine(
      (name) =>
        !name.includes("/") && !name.includes("\\") && !name.includes("\0"),
      {
        message: "Filename cannot contain slashes or null bytes",
      },
    )
    .refine((name) => /^[^<>:"|?*]+$/.test(name), {
      message: 'Filename contains invalid characters (<>:"|?*)',
    }),
});

export const shareSchema = z.object({
  email: emailSchema,
  permission: z.enum(["view", "edit"]),
});
