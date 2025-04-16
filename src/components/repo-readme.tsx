"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileText } from "lucide-react"
import { fetchWithAuth } from "@/lib/github"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"

export default function RepoReadme({ repoData }) {
  const [readme, setReadme] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReadme = async () => {
      if (!repoData) return

      try {
        setLoading(true)
        setError("")

        const { owner, repo } = repoData
        const response = await fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}/readme`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Ce dépôt ne possède pas de fichier README.")
          } else {
            throw new Error(`Erreur lors de la récupération du README: ${response.status}`)
          }
        }

        const data = await response.json()

        // Le contenu est encodé en base64
        const decodedContent = atob(data.content)
        setReadme(decodedContent)
      } catch (error) {
        console.error("Erreur lors du chargement du README:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReadme()
  }, [repoData])

  // Fonction pour transformer les URLs relatives des images en URLs absolues
  const transformImageUrls = (src) => {
    if (src.startsWith("http")) {
      return src
    }

    // Construire l'URL absolue pour les images relatives
    const baseUrl = `https://github.com/${repoData.owner}/${repoData.repo}/raw/${repoData.info.default_branch}`
    return `${baseUrl}/${src}`
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          README
        </CardTitle>
        <CardDescription>Documentation principale du projet</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                img: ({ node, ...props }) => (
                  <img
                    {...props}
                    src={transformImageUrls(props.src) || "/placeholder.svg"}
                    className="max-w-full h-auto rounded-md my-4"
                    loading="lazy"
                  />
                ),
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
                ),
                pre: ({ node, ...props }) => (
                  <pre {...props} className="bg-muted p-4 rounded-md overflow-x-auto text-sm my-4" />
                ),
                code: ({ node, inline, ...props }) =>
                  inline ? <code {...props} className="bg-muted px-1 py-0.5 rounded text-sm" /> : <code {...props} />,
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table {...props} className="border-collapse w-full" />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th {...props} className="border border-border px-4 py-2 bg-muted font-medium text-left" />
                ),
                td: ({ node, ...props }) => <td {...props} className="border border-border px-4 py-2" />,
              }}
            >
              {readme}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
