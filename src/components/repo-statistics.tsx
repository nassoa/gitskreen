"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import LanguageDonutChart from "./charts/language-donut-chart";
import CommitActivityChart from "./charts/commit-activity-chart";
import ContributorsBubbleChart from "./charts/contributors-bubble-chart";
import RepoRadarChart from "./charts/repo-radar-chart";

interface RepoData {
  commits: { commit: { author: { date: string; name?: string } } }[];
  branches: any[];
  languages: Record<string, number>;
  info: {
    open_issues_count: number;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
  };
  owner: string;
  repo: string;
}

export default function RepoStatistics({ repoData }: { repoData: RepoData }) {
  const [commitsByMonth, setCommitsByMonth] = useState({});

  useEffect(() => {
    // Process commits by month
    processCommitsByMonth();
  }, [repoData]);

  // Process commits by month
  const processCommitsByMonth = () => {
    const commits = repoData.commits;
    const commitMonths: Record<string, number> = {};

    commits.forEach((commit) => {
      const date = new Date(commit.commit.author.date);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!commitMonths[monthYear]) {
        commitMonths[monthYear] = 0;
      }

      commitMonths[monthYear]++;
    });

    // Sort by date
    const sortedMonths = Object.keys(commitMonths).sort();
    const sortedCommitsByMonth: Record<string, number> = {};

    sortedMonths.forEach((month) => {
      sortedCommitsByMonth[month] = commitMonths[month];
    });

    setCommitsByMonth(sortedCommitsByMonth);
  };

  // Format month for display
  const formatMonth = (monthYear: string): string => {
    const [year, month]: [string, string] = monthYear.split("-") as [
      string,
      string
    ];
    const date: Date = new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      1
    );
    return date.toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    });
  };

  // Calculate total language bytes
  const totalLanguageBytes = Object.values(repoData.languages).reduce(
    (sum, bytes) => sum + bytes,
    0
  );

  return (
    <div className="grid gap-6 mt-6">
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4 bg-zinc-700">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="languages">Langages</TabsTrigger>
          <TabsTrigger value="commits">Commits</TabsTrigger>
          <TabsTrigger value="contributors">Contributeurs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RepoRadarChart repoData={repoData} />

            <Card>
              <CardHeader>
                <CardTitle>Statistiques générales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {repoData.branches.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Branches
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {repoData.commits.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Commits récents
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {Object.keys(repoData.languages).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Langages
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold">
                      {repoData.info.open_issues_count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Issues ouvertes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="languages" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <LanguageDonutChart languages={repoData.languages} />

            <Card>
              <CardHeader>
                <CardTitle>Détail des langages</CardTitle>
                <CardDescription>
                  Répartition détaillée des langages utilisés
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(repoData.languages).length === 0 ? (
                  <p className="text-muted-foreground">
                    Aucune information sur les langages disponible
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(repoData.languages)
                      .sort(([, a], [, b]) => b - a)
                      .map(([language, bytes]) => {
                        const percentage = (
                          (bytes / totalLanguageBytes) *
                          100
                        ).toFixed(1);
                        const kilobytes = (bytes / 1024).toFixed(2);

                        // Generate a color based on the language name
                        const colors = [
                          "bg-blue-500",
                          "bg-green-500",
                          "bg-yellow-500",
                          "bg-red-500",
                          "bg-purple-500",
                          "bg-pink-500",
                          "bg-indigo-500",
                          "bg-orange-500",
                          "bg-teal-500",
                        ];

                        const colorIndex = language.length % colors.length;
                        const color = colors[colorIndex];

                        return (
                          <div key={language} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{language}</span>
                              <span>
                                {kilobytes} KB ({percentage}%)
                              </span>
                            </div>
                            <Progress
                              value={Number.parseFloat(percentage)}
                              className={color}
                            />
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commits" className="mt-6">
          <CommitActivityChart
            commits={repoData.commits.map((commit) => ({
              ...commit,
              commit: {
                ...commit.commit,
                author: {
                  ...commit.commit.author,
                  name: commit.commit.author.name || "Unknown",
                },
              },
            }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité par mois</CardTitle>
                <CardDescription>
                  Distribution des commits par mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(commitsByMonth).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune information sur les commits disponible
                  </p>
                ) : (
                  <div className="h-[250px] flex items-end gap-1">
                    {Object.entries(commitsByMonth).map(([month, count]) => {
                      const percentage =
                        (Number(count) /
                          Math.max(
                            ...(Object.values(commitsByMonth) as number[])
                          )) *
                        100;
                      return (
                        <div
                          key={month}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className="w-full bg-primary/80 hover:bg-primary rounded-t transition-all"
                            style={{ height: `${percentage}%` }}
                          />
                          <div className="text-xs mt-2 rotate-45 origin-left whitespace-nowrap">
                            {formatMonth(month)}
                          </div>
                          <div className="text-xs font-medium mt-1">
                            {count as number}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques des commits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">
                        {repoData.commits.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total des commits
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">
                        {Object.keys(commitsByMonth).length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Mois d&apos;activité
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-2">
                      Période d&apos;activité
                    </h4>
                    {Object.keys(commitsByMonth).length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <p>
                          Premier commit:{" "}
                          {formatMonth(Object.keys(commitsByMonth)[0])}
                        </p>
                        <p>
                          Dernier commit:{" "}
                          {formatMonth(
                            Object.keys(commitsByMonth)[
                              Object.keys(commitsByMonth).length - 1
                            ]
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contributors" className="mt-6">
          <ContributorsBubbleChart repoData={repoData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
