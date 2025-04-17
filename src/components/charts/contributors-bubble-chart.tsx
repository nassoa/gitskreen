"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { fetchWithAuth } from "@/lib/github";

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

interface RepoData {
  owner: string;
  repo: string;
}

export default function ContributorsBubbleChart({
  repoData,
}: {
  repoData: RepoData;
}) {
  const [chartData, setChartData] = useState<ChartData<"scatter">>({
    datasets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContributors = async () => {
      if (!repoData) return;

      try {
        setLoading(true);
        const { owner, repo } = repoData;

        // Récupérer les contributeurs du dépôt
        const response = await fetchWithAuth(
          `https://api.github.com/repos/${owner}/${repo}/stats/contributors`
        );

        if (!response.ok) {
          throw new Error(
            `Erreur lors de la récupération des contributeurs: ${response.status}`
          );
        }

        let contributors = await response.json();

        // Si l'API renvoie un tableau vide, cela signifie que GitHub est en train de calculer les statistiques
        if (contributors.length === 0) {
          // Attendre 2 secondes et réessayer
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const retryResponse = await fetchWithAuth(
            `https://api.github.com/repos/${owner}/${repo}/stats/contributors`
          );
          contributors = await retryResponse.json();
        }

        // Limiter à 20 contributeurs maximum pour la lisibilité
        contributors = (contributors as Contributor[])
          .sort((a, b) => b.total - a.total)
          .slice(0, 20);

        // Préparer les données pour le graphique à bulles
        const datasets = [];

        // Générer des couleurs pour chaque contributeur
        const colors = [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(199, 199, 199, 0.7)",
          "rgba(83, 102, 255, 0.7)",
        ];

        // Créer un dataset unique avec tous les contributeurs
        interface Contributor {
          author: {
            login: string;
            avatar_url: string;
          };
          total: number;
          weeks: Array<{
            c: number; // Number of commits
            a: number; // Number of additions
            d: number; // Number of deletions
          }>;
        }

        interface DataPoint {
          x: number; // First contribution (weeks since epoch)
          y: number; // Active weeks
          r: number; // Bubble radius
          contributor: {
            name: string;
            commits: number;
            additions: number;
            deletions: number;
            avatar: string;
          };
          backgroundColor: string;
        }

        const data: DataPoint[] = contributors.map(
          (contributor: Contributor, index: number) => {
            const colorIndex = index % colors.length;
            const weeks = contributor.weeks || [];

            // Calculer le nombre de semaines actives
            const activeWeeks = weeks.filter((week) => week.c > 0).length;

            // Calculer la date du premier commit (en semaines depuis l'époque)
            const firstCommitWeek = weeks.findIndex((week) => week.c > 0);

            return {
              x: firstCommitWeek,
              y: activeWeeks,
              r: Math.min(Math.sqrt(contributor.total) * 2, 40), // Rayon proportionnel à la racine carrée du nombre de commits
              contributor: {
                name: contributor.author?.login || "Unknown",
                commits: contributor.total,
                additions: weeks.reduce((sum, week) => sum + week.a, 0),
                deletions: weeks.reduce((sum, week) => sum + week.d, 0),
                avatar: contributor.author?.avatar_url,
              },
              backgroundColor: colors[colorIndex],
            };
          }
        );

        setChartData({
          datasets: [
            {
              label: "Contributeurs",
              data,
              backgroundColor: data.map((item) => item.backgroundColor),
            },
          ],
        });
      } catch (err) {
        console.error("Erreur lors du chargement des contributeurs:", err);
        setError("Impossible de charger les données des contributeurs");
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, [repoData]);

  const options: ChartOptions<"scatter"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Première contribution (semaines depuis le début du projet)",
        },
        ticks: {
          stepSize: 10,
        },
      },
      y: {
        title: {
          display: true,
          text: "Semaines d'activité",
        },
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataPoint = context.raw as any;
            const contributor = dataPoint.contributor;
            return [
              `Contributeur: ${contributor.name}`,
              `Commits: ${contributor.commits}`,
              `Ajouts: ${contributor.additions}`,
              `Suppressions: ${contributor.deletions}`,
              `Semaines actives: ${dataPoint.y}`,
            ];
          },
        },
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse des Contributeurs</CardTitle>
        <CardDescription>
          Visualisation des contributeurs par activité et impact
          <span className="block text-xs text-muted-foreground mt-1">
            Taille des bulles = nombre de commits, X = première contribution, Y
            = semaines d&apos;activité
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[350px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <p className="text-muted-foreground text-center py-8">{error}</p>
        ) : (
          <div className="h-[350px] w-full">
            <Scatter data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
