import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/auth/login")
  ) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      {
        success: false,
        message: "Authorization header is missing",
      },
      { status: 401 }
    );
  }

  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid authorization format",
      },
      { status: 401 }
    );
  }

  const parts = authHeader.split(" ");

if (parts.length !== 2 || parts[0] !== "Bearer") {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid authorization format",
    },
    { status: 401 }
  );
}

const token = parts[1];

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

    return NextResponse.next();
  } catch (error) {
    console.error("JWT verification failed:", error);

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
  matcher: [
    "/api/:path*",
  ],
};