import { NextRequest, NextResponse } from "next/server";
import prismaClient from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { LoginSchema } from "../../../../lib/validator";
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest){
    try {
        const body = await req.json()

        const result = LoginSchema.safeParse(body)
        if(!result.success){
            return NextResponse.json({
                error: result.error.flatten().fieldErrors
            }, {status: 400})
        }

        const {email, password} = result.data 
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

        const jwtSecret = process.env.JWT_SECRET!

        const token = jwt.sign({
            userId: findUser.id
        }, jwtSecret, {expiresIn: '7d'})

        return NextResponse.json({
            msg: "Login Successfully", 
            token
        }, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            msg: "Internal Server Error"
        }, {status: 500})
    }
}