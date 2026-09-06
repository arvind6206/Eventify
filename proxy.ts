import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip auth endpoints (register, login, etc.)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow GET requests without authentication
  if (method === "GET") {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        success: false,
        message: "Authorization header is missing or invalid",
      },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, secret);

    if (!payload.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    // Forward userId to route via x-user-id header
    const headers = new Headers(request.headers);
    headers.set("x-user-id", payload.userId as string);

    return NextResponse.next({
      request: {
        headers,
      },
    });

  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token",
      },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};