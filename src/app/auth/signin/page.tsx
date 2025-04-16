"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Connexion à GitHub</CardTitle>
          <CardDescription>
            Connectez-vous avec GitHub pour augmenter les limites d&apos;API et accéder à vos dépôts privés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>En vous connectant avec GitHub, vous pourrez :</p>
              <ul className="mt-2 list-disc list-inside">
                <li>Augmenter les limites d&apos;API (5000 requêtes/heure au lieu de 60)</li>
                <li>Accéder à vos dépôts privés</li>
                <li>Voir plus de statistiques et d&apos;informations</li>
              </ul>
            </div>

            <Button variant="default" className="w-full" onClick={() => signIn("github", { callbackUrl: "/" })}>
              <Github className="mr-2 h-4 w-4" />
              Se connecter avec GitHub
            </Button>

            <div className="text-center text-xs text-muted-foreground mt-4">
              <p>
                Nous demandons uniquement les permissions nécessaires pour accéder aux informations des dépôts. Nous ne
                stockons pas votre token d&apos;accès de manière permanente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
