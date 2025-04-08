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
        async signIn({ user, account, profile }) {
            //find if the user exists in db else redirect him to signup
            console.log("user in signIn callback:", user); //need only this
            // console.log("account in signIn callback:", account);
            console.log("profile in signIn callback:", profile);
            // const userInDb = await findUserInDb(profile.email);

            // if (!userInDb) {
            // Redirect manually using the error page
            // return '/login?error=UserNotFound';
            // }

            return true;
        },
        async jwt({ token, user }) { //runs once on login to create jwt
            console.log("user:", user);
            console.log("token:", token);
            //everything is stored in token
            //add the custom things to the token


            return token
        },
        async session({ session, token }) {
            // This callback modifies the session object that is sent to the 
            // client.
            // Runs every time useSession() or getSession() is called on the
            // client.

            //put the things you want to access from the token into the session and return it

            console.log('session:', session);
            console.log('token in session callback:', token);

            return session
        }
    },
    pages: {
        error: '/login'  //http://localhost:3000/login?error=username%20or%20password%20incorrect
        //on error the above page will be sent with the error parameter
    },
    secret: process.env.NEXTAUTH_SECRET  //npx auth secret
}