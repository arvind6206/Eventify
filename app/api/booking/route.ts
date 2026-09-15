import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../lib/getuserId";

export async function POST(req: NextRequest){
    try {
        const userId = await getUserIdFromRequest(req);
        if(!userId){
            return NextResponse.json({
                msg: "Unauthorized"
            }, {status: 401})
        }

        
    } catch (error) {
        
    }
}