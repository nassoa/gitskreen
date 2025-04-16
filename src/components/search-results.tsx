"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork, Eye, Calendar, Code, ArrowRight } from "lucide-react"

export default function SearchResults({ repositories, onSelectRepository }) {
  // Formater la date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  // Formater le nombre (ajouter des séparateurs de milliers)
  const formatNumber = (num) => {
    return num.toLocaleString("fr-FR")
  }

  return (
    <div className="space-y-4">
      {repositories.map((repo) => (
        <Card key={repo.id} className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {repo.full_name}
                  </a>
                </CardTitle>
                <CardDescription className="mt-1">
                  {repo.description || "Aucune description disponible"}
                </CardDescription>
              </div>
              {repo.archived && (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                >
                  Archivé
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{formatNumber(repo.stargazers_count)} étoiles</span>
              </div>
              <div className="flex items-center gap-2">
                <GitFork className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{formatNumber(repo.forks_count)} forks</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span className="text-sm">{formatNumber(repo.watchers_count)} observateurs</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-sm">Mis à jour le {formatDate(repo.updated_at)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {repo.language && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  {repo.language}
                </Badge>
              )}
              {repo.topics &&
                repo.topics.slice(0, 5).map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              Créé par{" "}
              <a
                href={repo.owner.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {repo.owner.login}
              </a>
            </div>
            <Button variant="outline" size="sm" onClick={() => onSelectRepository(repo.html_url)}>
              Explorer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
