"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Radar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js"

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function RepoRadarChart({ repoData }) {
  const [chartData, setChartData] = useState<ChartData<"radar">>({
    datasets: [],
    labels: [],
  })

  useEffect(() => {
    if (!repoData) return

    // Définir les métriques à afficher
    const metrics = [
      { name: "Stars", value: repoData.info.stargazers_count, max: 10000 },
      { name: "Forks", value: repoData.info.forks_count, max: 5000 },
      { name: "Watchers", value: repoData.info.watchers_count, max: 1000 },
      { name: "Issues", value: repoData.info.open_issues_count, max: 500 },
      { name: "Branches", value: repoData.branches.length, max: 50 },
      { name: "Langages", value: Object.keys(repoData.languages).length, max: 20 },
    ]

    // Normaliser les valeurs entre 0 et 100
    const normalizedValues = metrics.map((metric) => Math.min(100, (metric.value / metric.max) * 100))

    setChartData({
      labels: metrics.map((metric) => metric.name),
      datasets: [
        {
          label: "Métriques du dépôt",
          data: normalizedValues,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(75, 192, 192, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(75, 192, 192, 1)",
        },
      ],
    })
  }, [repoData])

  const options: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: "rgba(0, 0, 0, 0)",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const index = context.dataIndex
            const metric = {
              name: context.chart.data.labels?.[index] as string,
              value: repoData.info.stargazers_count,
              max: 10000,
            }

            // Déterminer la valeur réelle en fonction du nom de la métrique
            switch (metric.name) {
              case "Stars":
                metric.value = repoData.info.stargazers_count
                break
              case "Forks":
                metric.value = repoData.info.forks_count
                break
              case "Watchers":
                metric.value = repoData.info.watchers_count
                break
              case "Issues":
                metric.value = repoData.info.open_issues_count
                break
              case "Branches":
                metric.value = repoData.branches.length
                break
              case "Langages":
                metric.value = Object.keys(repoData.languages).length
                break
            }

            return `${metric.name}: ${metric.value} (${context.formattedValue}%)`
          },
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil du Dépôt</CardTitle>
        <CardDescription>Vue d&apos;ensemble des métriques clés du dépôt</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <Radar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
