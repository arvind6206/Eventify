import { NextRequest, NextResponse } from "next/server";
import { VenueSchema } from "../../../lib/validator/venueValidation";
import prismaClient from "../../../lib/db";
import { getUserIdFromRequest } from "../../../lib/getuserId";

export async function GET(req: NextRequest) {
  try {
    const venues = await prismaClient.venue.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json({
        msg: "Venues Fetched successfully",
      venues
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      msg: "Internal Server error"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest){
    try {
        const body = await req.json()
        const userId = await getUserIdFromRequest(req)
        console.log("id: ",userId)


        const findUser = await prismaClient.user.findFirst({
            where: {
                id: userId
            }
        })

        if(!findUser || findUser.role !== 'ADMIN'){
            return NextResponse.json({
                msg: "User is not allowed to create venue"
            }, {status: 403})
        }

        const result = VenueSchema.safeParse(body)
        if(!result.success){
            return NextResponse.json({
                error: result.error.flatten().fieldErrors
            }, {status: 400})
        }

        const {name, description, address, city, state, country, postalCode, capacity} = result.data;
        const existingVenue = await prismaClient.venue.findUnique({
            where: {
                name
            }
        })

        if(existingVenue){
            return NextResponse.json({
                msg: "Venue already exists"
            }, {status: 401})
        }

        

        const venue = await prismaClient.venue.create({
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
            msg: "venue created successfully",
            venue
        },{status: 201}) 
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server error"
        }, {status: 500})
    }
}