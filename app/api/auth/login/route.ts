import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest){
    try {
        const {email, password} = await req.json()
        if(!email || !password){
            return NextResponse.json({
                msg: "email and password field are required"
            }, {status: 400})
        }

        const findUser = await prismaClient.user.findUnique({
            where: {
                email
            }
        })

        if(!findUser){
            return NextResponse.json({
                msg: "user doesn't exists"
            }, {status: 400})
        }

        const matched = await bcrypt.compare(password, findUser.password)
        if(!matched){
            return NextResponse.json({
                msg: "Incorrect Password"
            }, {status: 400})
        }

        return NextResponse.json({
            msg: "Login Successfully"
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}