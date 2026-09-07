import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/getuserId";
import prismaClient from "../../../../lib/db";
import { EventSchema } from "../../../../lib/validator/eventValidation";

export async function GET(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){
    try {
        const organizerId = await getUserIdFromRequest(req)
        if(!organizerId){
            return NextResponse.json({
                mag: "Unauthorized"
            }, {status: 401})
        }

        const findOrganizer = await prismaClient.user.findUnique({
            where: {
                id: organizerId
            }
        })

        if(!findOrganizer){
            return NextResponse.json({
                msg: "organizer not found"
            }, {status: 404})
        }

        const {id} = await params;
        if(!id){
            return NextResponse.json({
                msg: "eventtId is required"
            }, {status: 400})
        }

        const findEvent = await prismaClient.event.findUnique({
            where: {
                id,
                organizerId: organizerId
            }
        })

        if(!findEvent){
            return NextResponse.json({
                msg: "event not found"
            }, {status: 404})
        }

        return NextResponse.json({
            msg: "seat fetched successfully",
            findEvent
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json(
                {
                    msg: "Unauthorized"
                },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    msg: "eventId is required"
                },
                { status: 400 }
            );
        }

        // Get logged-in user's role
        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            },
            select: {
                role: true
            }
        });

        if (!user) {
            return NextResponse.json(
                {
                    msg: "User not found"
                },
                { status: 404 }
            );
        }

        // USER cannot update events
        if (user.role === "USER") {
            return NextResponse.json(
                {
                    msg: "Users are not allowed to update events"
                },
                { status: 403 }
            );
        }

        // ADMIN can update any event
        // ORGANIZER can update only their own event
        let findEvent;

        if (user.role === "ADMIN") {
            findEvent = await prismaClient.event.findUnique({
                where: {
                    id
                }
            });
        } else {
            findEvent = await prismaClient.event.findFirst({
                where: {
                    id,
                    organizerId: userId
                }
            });
        }

        if (!findEvent) {
            return NextResponse.json(
                {
                    msg: "Event not found or you don't have permission"
                },
                { status: 404 }
            );
        }

        const body = await req.json();

        const result = EventSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: result.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        const updatedEvent = await prismaClient.event.update({
            where: {
                id
            },
            data: result.data
        });

        return NextResponse.json(
            {
                msg: "Event updated successfully",
                updatedEvent
            },
            { status: 200 }
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                msg: "Internal Server Error"
            },
            { status: 500 }
        );
    }
}