import { Reservation } from "./../../../../generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../../lib/getuserId";
import prismaClient from "../../../../../lib/db";
import { CANCELLED } from "dns";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        {
          msg: "Unauthorizzed",
        },
        { status: 401 },
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          msg: "reservationId is required",
        },
        { status: 400 },
      );
    }

    const findReservation = await prismaClient.reservation.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!findReservation) {
      return NextResponse.json(
        {
          msg: "reservtion not found",
        },
        { status: 404 },
      );
    }

    if (findReservation.status !== "ACTIVE") {
      return NextResponse.json(
        {
          msg: "Only an ACTIVE reservation should be cancelled",
        },
        { status: 400 },
      );
    }

    const result = await prismaClient.$transaction(async (tx) => {
      const reservation = await tx.reservation.update({
        where: {
          id: findReservation.id,
        },
        data: {
          status: "CANCELLED",
        },
      });

      //release seat if this is a seated Reservation
      if (findReservation.eventSeatId) {
        await tx.eventSeat.update({
          where: {
            id: findReservation.eventSeatId,
          },
          data: {
            status: "AVAILABLE",
          },
        });
      }
      return reservation;
    });

    return NextResponse.json({
        msg: "Reservation cancelled succesfully",
        reservation: result
    }, {status: 200})
  } catch (error) {
    console.error(error)
    return NextResponse.json({
        msg: "Internal Server Error"
    }, {status: 500})
  }
}
