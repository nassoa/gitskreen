"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import RepoSummary from "@/components/repo-summary";
import RepoReadme from "@/components/repo-readme";
import BranchesAndCommits from "@/components/branches-commits";
import BranchComparison from "@/components/branch-comparison";
import RepoStatistics from "@/components/repo-statistics";
import { fetchWithAuth } from "@/lib/github";
import { useToast } from "@/hooks/use-toast";
// import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [repoUrl, setRepoUrl] = useState("");
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Vérifier si une URL est fournie dans les paramètres de recherche
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam) {
      setRepoUrl(urlParam);
      fetchRepoData(urlParam);
    }
  }, [searchParams]);

  const extractRepoInfo = (url: any) => {
    try {
      // Handle different GitHub URL formats
      const regex = /github\.com\/([^/]+)\/([^/]+)/;
      const match = url.match(regex);

      if (!match) {
        throw new Error(
          "URL invalide. Veuillez entrer une URL de dépôt GitHub valide."
        );
      }

      return {
        owner: match[1],
        repo: match[2].replace(".git", ""),
      };
    } catch (error) {
      throw new Error(
        "URL invalide. Veuillez entrer une URL de dépôt GitHub valide."
      );
    }
  };

  const fetchRepoData = async (url = repoUrl) => {
    setLoading(true);
    setError("");

    try {
      const { owner, repo } = extractRepoInfo(url);

      // Fetch repository information using authenticated fetch
      const repoResponse = await fetchWithAuth(
        `https://api.github.com/repos/${owner}/${repo}`
      );

      if (!repoResponse.ok) {
        throw new Error(
          `Dépôt non trouvé ou API GitHub indisponible (${repoResponse.status})`
        );
      }

      const repoInfo = await repoResponse.json();

      // Fetch branches
      const branchesResponse = await fetchWithAuth(
        `https://api.github.com/repos/${owner}/${repo}/branches`
      );
      const branches = await branchesResponse.json();

      // Fetch languages
      const languagesResponse = await fetchWithAuth(
        `https://api.github.com/repos/${owner}/${repo}/languages`
      );
      const languages = await languagesResponse.json();

      // Fetch commits for the default branch (limited to 100)
      const commitsResponse = await fetchWithAuth(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`
      );
      const commits = await commitsResponse.json();

      setRepoData({
        info: repoInfo,
        branches,
        languages,
        commits,
        owner,
        repo,
      });

      toast({
        title: "Dépôt chargé avec succès",
        description: `${repoInfo.full_name} a été chargé avec succès.`,
      });
    } catch (error) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    fetchRepoData();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Entrez l&apos;URL d&apos;un dépôt GitHub</CardTitle>
          <CardDescription>
            Exemple: https://github.com/vercel/next.js
            {!session && (
              <span className="block mt-1 text-yellow-500">
                Connectez-vous avec GitHub pour augmenter les limites d&apos;API
                et accéder aux dépôts privés
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              type="text"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Chargement..." : "Explorer"}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {repoData && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Résumé</TabsTrigger>
            <TabsTrigger value="readme">README</TabsTrigger>
            <TabsTrigger value="branches">Branches & Commits</TabsTrigger>
            <TabsTrigger value="compare">Comparaison</TabsTrigger>
            <TabsTrigger value="statistics">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <RepoSummary repoData={repoData} />
          </TabsContent>

          <TabsContent value="readme">
            <RepoReadme repoData={repoData} />
          </TabsContent>

          <TabsContent value="branches">
            <BranchesAndCommits repoData={repoData} />
          </TabsContent>

          <TabsContent value="compare">
            <BranchComparison repoData={repoData} />
          </TabsContent>

          <TabsContent value="statistics">
            <RepoStatistics repoData={repoData} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
