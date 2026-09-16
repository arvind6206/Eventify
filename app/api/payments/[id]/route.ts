import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/getuserId";
import prismaClient from "../../../../lib/db";

export async function GET(req: NextRequest,
    {params}: {params: Promise<{id: string}>}
){
    try {
        const userId = await getUserIdFromRequest(req);
        if(!userId){
            return NextResponse.json({
                msg: "Unauthorized"
            }, {status: 401})
        }

        const {id} = await params;
        if(!id){
            return NextResponse.json({
                msg: "paymentId is required"
            }, {status: 400})
        }

        const payment = await prismaClient.payment.findFirst({
            where: {
                id,
                userId
            }
        })

        if(!payment){
            return NextResponse.json({
                msg: "payment not found"
            }, {status: 404})
        }

        return NextResponse.json({
            msg: "Payment fetched successfully",
            payment
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}