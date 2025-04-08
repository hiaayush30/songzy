import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 20 * 24 * 60 * 60 //30 days
    },
    callbacks: {
        // async jwt({ token, user, profile }) { //runs once on login to create jwt
        //     // user here comes from the authorize fn or provided to 
        //     // us in case of authProviders like google or github
        //     if (user) {
        //         token.email = user.email;
        //         token.id = user.id;
        //         token.picture = user.image;
        //         token.name = user.name;

        //     }
        //     else if (profile) {
        //         const foundUser = await prisma.user.findFirst({
        //             where: {
        //                 email: profile.email
        //             }
        //         })
        //         if (foundUser) {
        //             token.id = foundUser.id;
        //             token.username = foundUser.username;
        //             token.email = foundUser.email;
        //             token.bio = foundUser.bio;
        //             token.gender = foundUser.gender;
        //             token.profilePic = foundUser.profilePic;
        //             token.updatedAt = foundUser.updatedAt;
        //         }
        //     }
        //     return token
        // },
        // async session({ session, token }) {
        //     // This callback modifies the session object that is sent to the 
        //     // client.
        //     // Runs every time useSession() or getSession() is called on the
        //     // client.
        //     // Uses data from the token (not user, since user data is only
        //     // available on login).

        //     // console.log("token in session:"+token);
        //     if (token) {
        //         session.user.id = token.id;
        //         session.user.username = token.username;
        //         session.user.bio = token.bio;
        //         session.user.email = token.email;
        //         session.user.gender = token.gender;
        //         session.user.createdAt = token.createdAt;
        //         session.user.updatedAt = token.updatedAt;
        //         session.user.profilePic = token.profilePic;
        //     }
        //     return session
        // }
    },
    pages: {
        error: '/login'  //http://localhost:3000/login?error=username%20or%20password%20incorrect
        //on error the above page will be sent with the error parameter
    },
    secret: process.env.NEXTAUTH_SECRET  //npx auth secret
}