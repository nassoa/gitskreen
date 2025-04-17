"use client";

import { useState, useEffect } from "react";
import { getApiRateLimit } from "@/lib/github";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

export default function ApiStatus() {
  interface RateLimit {
    limit: number;
    remaining: number;
    reset: Date;
    authenticated: boolean;
  }

  const [rateLimit, setRateLimit] = useState<RateLimit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRateLimit = async () => {
      try {
        const limit = await getApiRateLimit();
        setRateLimit(limit);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des limites d'API:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRateLimit();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchRateLimit, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Chargement...
      </Badge>
    );
  }

  const resetTime = rateLimit?.reset
    ? new Date(rateLimit.reset).toLocaleTimeString()
    : "";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Badge variant={rateLimit?.authenticated ? "default" : "outline"}>
              API: {rateLimit?.remaining}/{rateLimit?.limit}
            </Badge>
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Requêtes API GitHub restantes: {rateLimit?.remaining} sur{" "}
            {rateLimit?.limit}
          </p>
          <p>Réinitialisation à {resetTime}</p>
          {!rateLimit?.authenticated && (
            <p className="text-yellow-500 mt-1">
              Connectez-vous pour augmenter cette limite
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
