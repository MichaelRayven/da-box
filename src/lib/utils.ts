import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PostgresError } from "./interface";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function isUniqueConstraintViolation(e: unknown) {
  const error = e as PostgresError;

  if (error.cause.code === "23505") return true;
}

const signInErrorMessages: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  OAuthAccountNotLinked:
    "This account is linked to a different sign-in method. Please use the method you originally used.",
  AccountNotLinked:
    "This account is linked to a different sign-in method. Please use the method you originally used.",
  OAuthCallbackError: "Something went wrong during sign-in. Please try again.",
  OAuthSignInError:
    "We couldn't start the sign-in process. Please try again or use a different method.",
  EmailSignInError:
    "We couldn't send you a sign-in link. Please check your email and try again.",
  MissingCSRF: "Security check failed. Please refresh the page and try again.",
  AccessDenied:
    "Access was denied. You may not have the required permissions to sign in.",
};

export function getSignInError(error: string) {
  return (
    signInErrorMessages[error] || "Sign-in failed. Please try again later."
  );
}
