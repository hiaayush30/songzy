import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "@/lib/db";

const upvoteSchema = z.object({
    streamId: z.string()
})

export const POST = async (req: Request) => {
    try {
        const data = upvoteSchema.parse(req.body);
        const session = await getServerSession();
        if (!session?.user) {
            return Response.json({
                success: false,
                message: "unauthorized",
            }, { status: 403 });
        }
        //TODO: get rid of this db call
        const user = await prisma.user.findFirst({
            where: {
                email: session.user.email || ""
            }
        })
        if (!user) {
            return Response.json({
                success: false,
                message: "user not found",
            }, { status: 401 });
        }
        await prisma.upvote.create({
            data: {
                streamId: data.streamId,
                userId:user.id
            }
        })
        return Response.json({
            success: true,
            message: "stream upvoted"
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json({
                success: false,
                message: "Validation error",
                errors: error.errors
            }, { status: 400 });
        } else {
            // Handle other types of errors
            console.error("An unexpected error occurred:", error);
            return Response.json({
                success: false,
                message: "Internal server error"
            }, { status: 500 });
        }
    }
}