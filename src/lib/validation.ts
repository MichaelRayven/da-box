import { z } from "zod";

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
export const emailSchema = z.string().email("Invalid email address");

// Password: at least 8 characters, one uppercase, one lowercase, one number, one special character
export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters long")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(
		/[^A-Za-z0-9]/,
		"Password must contain at least one special character",
	);

export const signUpSchema = z
	.object({
		username: usernameSchema,
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["password", "confirmPassword"], // this will show the error on the password and confirmPassword field
	});

export const signInSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});
