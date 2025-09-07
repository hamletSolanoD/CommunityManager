// middleware.ts (en la raíz del proyecto)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./server/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const isHomePage = request.nextUrl.pathname === "/";

  if (session?.user && isHomePage) {
    return NextResponse.redirect(new URL("/editor/chatlist", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
