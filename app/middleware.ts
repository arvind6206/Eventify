// app/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/me",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new NextResponse(JSON.stringify({ msg: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  try {
    const { payload } = await jwtVerify(token, secret);
    // Attach user info to request headers for downstream handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(payload.userId));
    requestHeaders.set("x-user-role", String(payload.role ?? "USER"));
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (e) {
    console.error("JWT verification failed", e);
    return new NextResponse(JSON.stringify({ msg: "Invalid token" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
}

export const config = {
  matcher: "/api/:path*",
};
