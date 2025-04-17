"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  GitCompare,
  FileCode,
  GitCommit,
  Plus,
  Minus,
  FileText,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/github";

interface RepoData {
  info: {
    default_branch: string;
  };
  branches: { name: string }[];
  owner: string;
  repo: string;
}

export default function BranchComparison({ repoData }: { repoData: RepoData }) {
  const [baseBranch, setBaseBranch] = useState("");
  const [compareBranch, setCompareBranch] = useState("");
  interface ComparisonData {
    files?: {
      filename: string;
      additions: number;
      deletions: number;
      changes: number;
      status: string;
      patch?: string;
    }[];
    total_commits?: number;
    stats?: { additions: number; deletions: number };
    status?: string;
    ahead_by?: number;
    behind_by?: number;
    merge_base_commit?: { sha: string };
    commits?: {
      sha: string;
      commit: { message: string; author: { name: string; date: string } };
      html_url: string;
    }[];
  }

  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Définir les branches par défaut lors du chargement initial
    if (repoData?.branches?.length > 0) {
      // Utiliser la branche par défaut comme base
      const defaultBranch = repoData.info.default_branch;
      setBaseBranch(defaultBranch);

      // Trouver une autre branche pour la comparaison
      const otherBranch = repoData.branches.find(
        (branch) => branch.name !== defaultBranch
      );
      if (otherBranch) {
        setCompareBranch(otherBranch.name);
      } else if (repoData.branches.length > 1) {
        // Si la branche par défaut n'est pas trouvée mais qu'il y a d'autres branches
        setCompareBranch(repoData.branches[1].name);
      } else {
        // S'il n'y a qu'une seule branche, l'utiliser aussi pour la comparaison
        setCompareBranch(defaultBranch);
      }
    }
  }, [repoData]);

  const compareRepositories = async () => {
    if (baseBranch === compareBranch) {
      setError(
        "Veuillez sélectionner deux branches différentes pour la comparaison."
      );
      setComparisonData(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { owner, repo } = repoData;
      const response = await fetchWithAuth(
        `https://api.github.com/repos/${owner}/${repo}/compare/${baseBranch}...${compareBranch}`
      );

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la comparaison des branches: ${response.status}`
        );
      }

      const data = await response.json();
      setComparisonData(data);
    } catch (error) {
      console.error("Erreur lors de la comparaison des branches:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors de la comparaison des branches."
      );
    } finally {
      setLoading(false);
    }
  };

  // Formater la date
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Fonction pour déterminer la couleur de la ligne de code
  interface LineClassMap {
    addition: string;
    deletion: string;
    context: string;
  }

  const getLineClass = (type: keyof LineClassMap): string => {
    switch (type) {
      case "addition":
        return "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-300";
      case "deletion":
        return "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-300";
      default:
        return "";
    }
  };

  // Fonction pour rendre les lignes de code avec coloration syntaxique
  interface DiffLine {
    type: "addition" | "deletion" | "context";
    content: string;
  }

  const renderDiffContent = (patch: string | null): JSX.Element | null => {
    if (!patch) return null;

    const lines: string[] = patch.split("\n");
    return (
      <>
        {lines.map((line: string, index: number) => {
          let type: DiffLine["type"] = "context";
          if (line.startsWith("+")) type = "addition";
          if (line.startsWith("-")) type = "deletion";

          return (
            <div
              key={index}
              className={`font-mono text-xs whitespace-pre-wrap ${getLineClass(
                type
              )} px-2 py-0.5`}
            >
              {line}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="grid gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Comparaison de branches
          </CardTitle>
          <CardDescription>
            Comparez les différences entre deux branches du dépôt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Branche de base
              </label>
              <Select value={baseBranch} onValueChange={setBaseBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une branche" />
                </SelectTrigger>
                <SelectContent>
                  {repoData?.branches?.map((branch) => (
                    <SelectItem key={`base-${branch.name}`} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Branche à comparer
              </label>
              <Select value={compareBranch} onValueChange={setCompareBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une branche" />
                </SelectTrigger>
                <SelectContent>
                  {repoData?.branches?.map((branch) => (
                    <SelectItem
                      key={`compare-${branch.name}`}
                      value={branch.name}
                    >
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={compareRepositories}
            disabled={loading || !baseBranch || !compareBranch}
          >
            {loading ? "Comparaison en cours..." : "Comparer les branches"}
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
          </CardContent>
        </Card>
      )}

      {comparisonData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la comparaison</CardTitle>
              <CardDescription>
                Comparaison de <strong>{baseBranch}</strong> avec{" "}
                <strong>{compareBranch}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">
                    {comparisonData.total_commits}
                  </div>
                  <div className="text-sm text-muted-foreground">Commits</div>
                </div>

                <div className="bg-muted rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold">
                    {comparisonData.files?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fichiers modifiés
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 text-center flex justify-center items-center gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center">
                      <Plus className="h-4 w-4 mr-1" />
                      {comparisonData.stats?.additions || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Ajouts</div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center justify-center">
                      <Minus className="h-4 w-4 mr-1" />
                      {comparisonData.stats?.deletions || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Suppressions
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Statut</h3>
                <Badge
                  variant={
                    comparisonData.status === "ahead" ? "default" : "secondary"
                  }
                  className="mb-2"
                >
                  {comparisonData.status === "identical"
                    ? "Identiques"
                    : comparisonData.status === "ahead"
                    ? `${compareBranch} est en avance de ${comparisonData.ahead_by} commits`
                    : comparisonData.status === "behind"
                    ? `${compareBranch} est en retard de ${comparisonData.behind_by} commits`
                    : comparisonData.status === "diverged"
                    ? `Les branches ont divergé (${compareBranch} est en avance de ${comparisonData.ahead_by} commits et en retard de ${comparisonData.behind_by} commits)`
                    : comparisonData.status}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {comparisonData.status === "identical"
                    ? "Les branches sont identiques."
                    : `Comparaison entre ${comparisonData.merge_base_commit?.sha.substring(
                        0,
                        7
                      )} et ${
                        comparisonData.commits?.[
                          comparisonData.commits.length - 1
                        ]?.sha.substring(0, 7) || ""
                      }`}
                </p>
              </div>

              {comparisonData.commits && comparisonData.commits.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Commits ({comparisonData.commits.length})
                  </h3>
                  <div className="border rounded-md overflow-hidden">
                    <ScrollArea className="h-[300px]">
                      {comparisonData.commits.map((commit, index) => (
                        <div
                          key={commit.sha}
                          className="p-3 border-b last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            <GitCommit className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                              <div className="font-medium">
                                {commit.commit.message}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium">
                                  {commit.commit.author.name}
                                </span>{" "}
                                a commité le{" "}
                                {formatDate(commit.commit.author.date)}
                              </div>
                              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
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
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {comparisonData.files && comparisonData.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Fichiers modifiés ({comparisonData.files.length})
                </CardTitle>
                <CardDescription>
                  Détails des modifications de fichiers entre les branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="files-list">
                  <TabsList className="mb-4">
                    <TabsTrigger value="files-list">
                      Liste des fichiers
                    </TabsTrigger>
                    <TabsTrigger value="files-diff">Différences</TabsTrigger>
                  </TabsList>

                  <TabsContent value="files-list">
                    <div className="border rounded-md overflow-hidden">
                      <ScrollArea className="h-[400px]">
                        {comparisonData.files.map((file, index) => (
                          <div
                            key={file.filename}
                            className="p-3 border-b last:border-0"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <FileCode className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <div className="font-medium break-all">
                                    {file.filename}
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 text-sm">
                                    <span className="text-green-600 dark:text-green-400 flex items-center">
                                      <Plus className="h-3 w-3 mr-1" />
                                      {file.additions}
                                    </span>
                                    <span className="text-red-600 dark:text-red-400 flex items-center">
                                      <Minus className="h-3 w-3 mr-1" />
                                      {file.deletions}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {file.status === "added"
                                        ? "Ajouté"
                                        : file.status === "modified"
                                        ? "Modifié"
                                        : file.status === "removed"
                                        ? "Supprimé"
                                        : file.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline">
                                {file.changes} changement
                                {file.changes > 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="files-diff">
                    <div className="space-y-6">
                      {comparisonData.files.map((file) => (
                        <div
                          key={file.filename}
                          className="border rounded-md overflow-x-auto w-full"
                        >
                          <div className="bg-muted p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium">
                              <FileText className="h-4 w-4" />
                              <span className="break-all">{file.filename}</span>
                            </div>
                            <Badge variant="outline">
                              {file.status === "added"
                                ? "Ajouté"
                                : file.status === "modified"
                                ? "Modifié"
                                : file.status === "removed"
                                ? "Supprimé"
                                : file.status}
                            </Badge>
                          </div>
                          <Separator />
                          <ScrollArea className="max-h-[300px] overflow-y-auto">
                            <div className="p-1">
                              {renderDiffContent(file.patch ?? null)}
                            </div>
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
