import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest){
    try {
        const {name, email, password, role} = await req.json()
        if(!email || !password){
            return NextResponse.json({
                msg: "Email and Password role are required"
            }, {status: 400})
            
        }

        const existingUser = await prismaClient.user.findUnique({
            where: {
                email
            }
        })

        if(existingUser){
            return NextResponse.json({
                msg: "User already exists"
            }, {status: 400})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prismaClient.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        })

        return NextResponse.json({
            msg: "user created successfully",
            user
        }, {status: 201})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server error",
        }, {status: 500})
    }
}