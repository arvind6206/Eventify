import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../../lib/db";
import { SeatSchema } from "../../../../../lib/validator/seatValidation";

export async function POST(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){
    try {
        const body = await req.json()
        const {id} = await params
        
        if(!id){
            return NextResponse.json({
                msg: "venueId is required"
            }, {status: 400})
        }

        const findVenue = await prismaClient.venue.findUnique({
            where: {
                id
            }
        })
    

        if(!findVenue){
            return NextResponse.json({
                msg: "venue not found"
            }, {status: 404})
        }

        const result = SeatSchema.safeParse(body)
        console.log("Before: ", result)
        if(!result.success){
            return NextResponse.json({
                error: result.error.flatten().fieldErrors
            }, {status: 400})
        }
        console.log("After: ", result)
        
        const{row, number, section, type} = result.data

        const seat = await prismaClient.seat.create({
        
            data: {
                venueId: findVenue.id,
                row,
                number,
                section,
                type
            }
        })

        return NextResponse.json({
            msg: "seat added succesfully",
            seat
        }, {status: 201})

     } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server error"
        }, {status: 500})
    }
}