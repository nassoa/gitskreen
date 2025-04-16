"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { GitCommit } from "lucide-react"
import { fetchWithAuth } from "@/lib/github"

export default function BranchesAndCommits({ repoData }) {
  const [selectedBranch, setSelectedBranch] = useState("")
  const [branchCommits, setBranchCommits] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (repoData.branches.length > 0) {
      // Set default branch
      const defaultBranch = repoData.info.default_branch
      setSelectedBranch(defaultBranch)

      // Default branch commits are already loaded
      if (defaultBranch === repoData.info.default_branch) {
        setBranchCommits(repoData.commits)
      } else {
        fetchBranchCommits(defaultBranch)
      }
    }
  }, [repoData])

  const fetchBranchCommits = async (branch) => {
    setLoading(true)
    try {
      const { owner, repo } = repoData
      const response = await fetchWithAuth(
        `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=100`,
      )
      const commits = await response.json()
      setBranchCommits(commits)
    } catch (error) {
      console.error("Error fetching branch commits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBranchChange = (value) => {
    setSelectedBranch(value)
    fetchBranchCommits(value)
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString("fr-FR", options)
  }

  return (
    <div className="grid gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
          <CardDescription>Sélectionnez une branche pour voir ses commits</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedBranch} onValueChange={handleBranchChange}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Sélectionnez une branche" />
            </SelectTrigger>
            <SelectContent>
              {repoData.branches.map((branch) => (
                <SelectItem key={branch.name} value={branch.name}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commits</CardTitle>
          <CardDescription>
            {branchCommits.length} commits sur la branche {selectedBranch}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {branchCommits.map((commit) => (
                <div key={commit.sha} className="flex gap-4 items-start border-b pb-4 last:border-0">
                  <Avatar>
                    <AvatarImage src={commit.author?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{commit.commit.author.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-medium">{commit.commit.message}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">{commit.commit.author.name}</span> a commité le{" "}
                      {formatDate(commit.commit.author.date)}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <GitCommit className="h-3 w-3" />
                      <a
                        href={commit.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {commit.sha.substring(0, 7)}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
