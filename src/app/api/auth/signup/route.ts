import { NextResponse } from "next/server";
import { signUpSchema } from "~/lib/validation";
import { generateSalt, hashPassword } from "~/server/auth/utils";
import { db } from "~/server/db";
import { accounts, users } from "~/server/db/schema";

export async function POST(request: Request) {
  const unsafeData = await request.json();
  const { success, data } = signUpSchema.safeParse(unsafeData);

  if (!success)
    return new NextResponse("Unable to create account, invalid credentials", {
      status: 400,
    });

  const existingUser = await db.query.users.findFirst({
    where: (users, { or, eq }) =>
      or(eq(users.email, data.email), eq(users.username, data.username)),
  });

  if (existingUser) {
    const field = existingUser.email === data.email ? "email" : "username";

    return new NextResponse(`Account already exists for this ${field}`, {
      status: 409,
    });
  }

  try {
    const { name, username, email, password } = data;

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const [user] = await db
      .insert(users)
      .values({
        name: name,
        email: email,
        password: hashedPassword,
        salt: salt,
        username: username,
      })
      .returning({ id: users.id, email: users.email });

    if (user == null)
      return new NextResponse("Unable to create account", { status: 500 });

    const [account] = await db
      .insert(accounts)
      .values({
        provider: "credentials",
        type: "credentials",
        userId: user.id,
        providerAccountId: user.id,
      })
      .returning();

    if (account == null)
      return new NextResponse("Unable to create account", { status: 500 });

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    return new NextResponse("Unable to create account", { status: 500 });
  }
}
