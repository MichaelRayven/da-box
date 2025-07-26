import type { z } from "zod";
import { signUpSchema } from "~/lib/validation";
import { db } from "../db";
import { users } from "../db/schema";
import { generateSalt, hashPassword } from "./utils";

export async function signUp(
  unsafeData: z.infer<typeof signUpSchema>,
): Promise<string | { id: string; email: string }> {
  const { success, data } = signUpSchema.safeParse(unsafeData);

  if (!success) return "Unable to create account, incorrect data format";

  const existingUser = db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, data.email),
  });

  if (existingUser != null) return "Account already exists for this email";

  try {
    const { username, email, password } = data;

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const [user] = await db
      .insert(users)
      .values({
        email: email,
        password: hashedPassword,
        salt: salt,
        name: username,
      })
      .returning({ id: users.id, email: users.email });

    if (user == null) return "Unable to create account";

    return user;
  } catch (e) {
    return "Unable to create account";
  }
}
