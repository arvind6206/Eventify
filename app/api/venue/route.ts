import { NextRequest, NextResponse } from "next/server";
import { VenueSchema } from "../../../lib/validator/venueValidation";
import prismaClient from "../../../lib/db";

export async function POST(req: NextRequest){
    try {
        const body = await req.json()
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
            }, {status: 400})
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
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Error while creating venue"
        }, {status: 400})
    }
}