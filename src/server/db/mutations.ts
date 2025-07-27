"use server";

import { db } from "~/server/db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { nameSchema, usernameSchema } from "~/lib/validation";

const updateUserProfileSchema = z.object({
  username: nameSchema.optional(),
  name: usernameSchema.optional(),
  image: z.string().url().optional(),
});

export async function updateUserProfile(
  id: string,
  data: z.infer<typeof updateUserProfileSchema>,
) {
  await db.update(users).set(data).where(eq(users.id, id));
}
