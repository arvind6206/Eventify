import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../lib/db";
import { VenueSchema } from "../../../../lib/validator/venueValidation";
import { getUserIdFromRequest } from "../../../../lib/getuserId";

export async function GET(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){
    try {
        const {id} = await params;
        if(!id){
            return NextResponse.json({
                msg: "id is required"
            })
        }

        const findVenue = await prismaClient.venue.findUnique({
            where: {
                id
            }
        })

        if(!findVenue){
            return NextResponse.json({
                msg: "Venue not found"
            }, {status: 400})
        }

        return NextResponse.json({
            msg: "Venue found successfully",
            findVenue
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}

export async function PATCH(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){
    try {
        const {id} = await params;
        const body = await req.json()
        if(!id){
            return NextResponse.json({
                msg: "id is required"
            })
        }

        const findVenue = await prismaClient.venue.findUnique({
            where: {
                id
            }
        })

        if(!findVenue){
            return NextResponse.json({
                msg: "Venue not found"
            }, {status: 400})
        }

        const result = VenueSchema.safeParse(body)
        if(!result.success){
            return NextResponse.json({
                error: result.error.flatten().fieldErrors
            }, {status: 400})
        }

        const {name, description, address, city, state, country, postalCode, capacity} = result.data

        const updatedVenue = await prismaClient.venue.update({
            where: {
                id
            },
            data: {
                name,
                description,
                address,
                city, 
                state,
                country,
                postalCode,
                capacity
            }
        })
        return NextResponse.json({
            msg: "Venue updated successfully",
            updatedVenue
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          msg: "venueId is required",
        },
        { status: 400 }
      );
    }

    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        {
          msg: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // 3. Find user
    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          msg: "User not found",
        },
        { status: 401 }
      );
    }

    // 4. Check ADMIN role
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          msg: "User not allowed to delete venue",
        },
        { status: 403 }
      );
    }

    const findVenue = await prismaClient.venue.findUnique({
      where: {
        id
      },
    });

    if (!findVenue) {
      return NextResponse.json(
        {
          msg: "Venue not found",
        },
        { status: 404 }
      );
    }

    // 6. Delete venue
    await prismaClient.venue.delete({
      where: {
        id: findVenue.id
      },
    });

    // 7. Success response
    return NextResponse.json(
      {
        msg: "Venue deleted successfully",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete venue error:", error);

    return NextResponse.json(
      {
        msg: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}