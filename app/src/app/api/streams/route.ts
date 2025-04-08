import { z } from "zod";


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