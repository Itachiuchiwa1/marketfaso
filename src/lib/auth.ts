import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Identifiants MarketFaso",
      credentials: {
        identifiant: { label: "E-mail ou Téléphone", type: "text" },
        motDePasse: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifiant || !credentials?.motDePasse) {
          return null;
        }

        const identifiant = credentials.identifiant.trim();
        const motDePasse = credentials.motDePasse;

        const utilisateur = await prisma.utilisateur.findFirst({
          where: {
            OR: [
              { email: identifiant },
              { telephone: identifiant }
            ]
          },
          include: {
            vendeur: true,
            livreur: true
          }
        });

        if (!utilisateur) {
          return null;
        }

        const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash);
        if (!motDePasseValide) {
          return null;
        }

        return {
          id: utilisateur.id,
          name: `${utilisateur.prenom} ${utilisateur.nom}`,
          email: utilisateur.email,
          role: utilisateur.role,
          statut: utilisateur.statut,
          vendeurId: utilisateur.vendeur?.id || null,
          livreurId: utilisateur.livreur?.id || null,
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.statut = (user as any).statut;
        token.vendeurId = (user as any).vendeurId;
        token.livreurId = (user as any).livreurId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).statut = token.statut;
        (session.user as any).vendeurId = token.vendeurId;
        (session.user as any).livreurId = token.livreurId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/vendeur/connexion",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.AUTH_SECRET
};

export const auth = () => getServerSession(authOptions);
