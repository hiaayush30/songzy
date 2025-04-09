import { z } from "zod";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

//@ts-ignore
import youtubeSearchApi from "youtube-search-api";

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;
// const YT_REGEX = new RegExp("^https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})(&.*)?$")
const createStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string().url().refine(
        (val) => val.includes("youtube.com") || val.includes("spotify.com"),
        {
            message: "URL must be a YouTube or Spotify link",
        }
    )
})

export const POST = async (req: Request) => {
    try {
        const data = createStreamSchema.parse(req.body);
        const isYt = data.url.match(YT_REGEX);
        //returns  null if not valid
        if (!isYt) {
            return Response.json({
                success: false,
                message: "not a valid youtube url"
            }, { status: 401 })
        }
        const extractedId = data.url.split("?v=")[1];
        const res = await youtubeSearchApi.GetVideoDetails(extractedId);
        console.log("video details:", res)
        const stream = await prisma.stream.create({
            data: {
                userId: data.creatorId,
                type: "Youtube",
                url: data.url,
                extractedId
            }
        })

        return Response.json({
            success: true,
            stream,
            message: "stream created"
        }, { status: 201 })

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

export const GET = async (req: NextRequest) => {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    if (!creatorId) {
        return Response.json({
            success: false,
            message: 'creatorId required'
        }, { status: 401 })
    }
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return Response.json({
                success: false,
                message: "unauthorized"
            }, { status: 403 })
        }
        const stream = await prisma.stream.findMany({
            where: {
                userId: creatorId
            }
        })
        if (!stream) {
            return Response.json({
                success: false,
                message: "stream not found"
            }, { status: 401 })
        } else {
            return Response.json({
                success: true,
                message: "stream fetched successfully",
                stream,
            }, { status: 200 })
        }
    } catch (error) {
        console.error("An unexpected error occurred:", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}