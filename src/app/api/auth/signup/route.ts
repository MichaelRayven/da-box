import { NextResponse } from "next/server";
import { signUpSchema } from "~/lib/validation";
import { signIn } from "~/server/auth";
import { generateSalt, hashPassword } from "~/server/auth/utils";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export async function POST(request: Request) {
  const unsafeData = await request.json();
  const { success, data } = signUpSchema.safeParse(unsafeData);

  if (!success)
    return new NextResponse("Unable to create account, incorrect data format", {
      status: 400,
    });

  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, data.email),
  });

  if (existingUser != null)
    return new NextResponse("Account already exists for this email", {
      status: 409,
    });

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

    if (user == null)
      return new NextResponse("Unable to create account", { status: 500 });

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      return new NextResponse("User created but login failed", { status: 500 });
    }

    // Redirect to homepage
    return NextResponse.redirect(new URL("/", request.url));
  } catch (e) {
    return new NextResponse("Unable to create account", { status: 500 });
  }
}
