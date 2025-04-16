import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitBranch, GitFork, Star, Clock, Eye, Calendar } from "lucide-react"

export default function RepoSummary({ repoData }) {
  const { info } = repoData

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  return (
    <div className="grid gap-6 mt-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{info.name}</CardTitle>
              <CardDescription className="text-lg mt-1">{info.full_name}</CardDescription>
            </div>
            {info.language && (
              <Badge variant="outline" className="ml-2">
                {info.language}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">{info.description || "Aucune description disponible"}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>{info.stargazers_count.toLocaleString()} étoiles</span>
            </div>

            <div className="flex items-center gap-2">
              <GitFork className="h-5 w-5 text-blue-500" />
              <span>{info.forks_count.toLocaleString()} forks</span>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <span>{info.watchers_count.toLocaleString()} observateurs</span>
            </div>

            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-green-500" />
              <span>{repoData.branches.length} branches</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <span>Créé le {formatDate(info.created_at)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              <span>Dernière mise à jour le {formatDate(info.updated_at)}</span>
            </div>
          </div>

          {info.homepage && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Site web</h3>
              <a
                href={info.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {info.homepage}
              </a>
            </div>
          )}

          <div className="mt-6">
            <a href={info.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Voir sur GitHub →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
