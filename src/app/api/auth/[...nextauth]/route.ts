import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId:
        process.env.GITHUB_ID ||
        (() => {
          throw new Error("GITHUB_ID is not defined in environment variables");
        })(),
      clientSecret:
        process.env.GITHUB_SECRET ||
        (() => {
          throw new Error(
            "GITHUB_SECRET is not defined in environment variables"
          );
        })(),
      authorization: {
        params: {
          // Demander les scopes nécessaires pour accéder à l'API GitHub
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: any; account?: any }) {
      // Persister le token d'accès dans le JWT
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Ajouter le token d'accès à la session
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "github-explorer-secret-key",
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
