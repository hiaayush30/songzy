import { z } from "zod";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

//@ts-expect-error no ts declaration file
import youtubeSearchApi from "youtube-search-api";

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;


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

        const thumbnails = res.thumbnail.thumbnails as Array<{ url: string, height: number, width: number }>;
        thumbnails.sort((a, b) => a.width < b.width ? -1 : 1);

        const stream = await prisma.stream.create({
            data: {
                title: res.title ?? "404:Video not found",
                bigImg: thumbnails[thumbnails.length - 1].url ?? "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ?? "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                userId: data.creatorId,
                type: "Youtube",
                url: data.url,
                extractedId
            }
        })

        return Response.json({
            success: true,
            streamId:stream.id,
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