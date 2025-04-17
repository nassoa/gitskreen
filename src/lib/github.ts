import { getSession } from "next-auth/react";
import { Session } from "next-auth";

// Extend the Session type to include accessToken
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

export async function fetchWithAuth(url: string) {
  const session = await getSession();
  const headers: HeadersInit = {};

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return fetch(url, { headers });
}

export async function getApiRateLimit() {
  const session = await getSession();

  try {
    const headers: HeadersInit = {};
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    const response = await fetch("https://api.github.com/rate_limit", {
      headers,
    });
    const data = await response.json();

    return {
      limit: data.resources.core.limit,
      remaining: data.resources.core.remaining,
      reset: new Date(data.resources.core.reset * 1000),
      authenticated: !!session?.accessToken,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des limites d'API:", error);
    return {
      limit: 60,
      remaining: "?",
      reset: new Date(),
      authenticated: false,
    };
  }
}
