import { dbConnect } from "@/db/dbConnect";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        try {
          await dbConnect();
          const user = await UserModel.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("No user found");
          }
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValid) {
            throw new Error("Invalid Password");
          }
          return {
            id: user._id.toString(),
            email: user.email,
            databaseId: user._id.toString(),
          };
        } catch (error) {
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbConnect();

        if (account?.provider === "google") {
          const email = user?.email || profile?.email;
          if (!email) {
            throw new Error("No email returned from Google");
          }

          // Check if a user exists with the given email
          let existingUser = await UserModel.findOne({ email });
          if (!existingUser) {
            const baseUsername =
              user?.name?.replace(/\s+/g, "").toLowerCase() ||
              email.split("@")[0];
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Create a new user
            existingUser = await UserModel.create({
              name: user?.name || baseUsername,
              email,
              password: hashedPassword,
              favourite: [],
            });
          }
          user.databaseId = existingUser._id.toString();
          return true;
        }

        if (account?.provider === "credentials") {
          user.databaseId = user.id;
          return true;
        }

        return true;
      } catch (error) {
        console.error("Error during signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user?.databaseId) {
        token.id = user.databaseId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/HomePage",
    error: "/Login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET!,
};

export default authOptions;
