import { type NextRequest, NextResponse } from "next/server";
// import { db } from "./server/db";

/* 
 This works but it is waaaay too slow,
 instead I'm thinking of restricting profile access and features where needed
 until the user goes through with the onboarding process
*/
export async function middleware(request: NextRequest) {
  // const token = request.cookies.get("session-token");
  // if (token) {
  //   const session = await db.query.sessions.findFirst({
  //     where: (sessions, { eq }) => eq(sessions.sessionToken, token.value),
  //   });
  //   if (!session) throw new Error("Session not found");
  //   const user = await db.query.users.findFirst({
  //     where: (users, { eq }) => eq(users.id, session.userId),
  //   });
  //   if (!user?.username) {
  //     return NextResponse.rewrite(new URL("/onboarding", request.url));
  //   }
  // }
  // return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
