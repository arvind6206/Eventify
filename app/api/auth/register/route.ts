import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { SignupSchema } from "../../../../lib/validator";

export async function POST(req: NextRequest){
    try {
        const body = await req.json()
        const result = SignupSchema.safeParse(body)
        
        if(!result.success){
            return NextResponse.json({
                error: result.error.flatten().fieldErrors
            }, {status: 400})
        }

        const {name, email, password, role} = result.data

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

        const hashedPassword = await bcrypt.hash(result.data.password, 10)

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