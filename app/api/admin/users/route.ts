import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/getuserId";
import prismaClient from "../../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ msg: "Access denied. Admin only." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const users = await prismaClient.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reservations: true,
            payments: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({
      msg: "Users fetched successfully",
      users
    }, { status: 200 });

  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ msg: "Access denied. Admin only." }, { status: 403 });
    }

    const body = await req.json();
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json({ msg: "User ID and role are required" }, { status: 400 });
    }

    if (!["USER", "ADMIN", "ORGANIZER"].includes(role)) {
      return NextResponse.json({ msg: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prismaClient.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      msg: "User role updated successfully",
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ msg: "Access denied. Admin only." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("id");

    if (!targetUserId) {
      return NextResponse.json({ msg: "User ID is required" }, { status: 400 });
    }

    if (targetUserId === userId) {
      return NextResponse.json({ msg: "Cannot delete your own account" }, { status: 400 });
    }

    // Check if user has active bookings or payments
    const userBookings = await prismaClient.booking.count({
      where: { userId: targetUserId, status: "CONFIRMED" }
    });

    if (userBookings > 0) {
      return NextResponse.json({
        msg: "Cannot delete user with active confirmed bookings. Cancel bookings first."
      }, { status: 409 });
    }

    await prismaClient.user.delete({
      where: { id: targetUserId }
    });

    return NextResponse.json({
      msg: "User deleted successfully"
    }, { status: 200 });

  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ msg: "Access denied. Admin only." }, { status: 403 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json({ msg: "User ID and isActive status are required" }, { status: 400 });
    }

    if (id === userId) {
      return NextResponse.json({ msg: "Cannot deactivate your own account" }, { status: 400 });
    }

    const updatedUser = await prismaClient.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      msg: `User ${isActive ? "activated" : "deactivated"} successfully`,
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error("Toggle user status error:", error);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}