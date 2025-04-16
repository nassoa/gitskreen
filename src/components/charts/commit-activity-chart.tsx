"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from "chart.js"

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function CommitActivityChart({ commits }) {
  const [chartData, setChartData] = useState<ChartData<"line">>({
    datasets: [],
    labels: [],
  })

  useEffect(() => {
    if (!commits || commits.length === 0) return

    // Grouper les commits par jour
    const commitsByDay = {}
    const commitsByAuthor = {}
    const authors = new Set()

    // Trier les commits par date (du plus ancien au plus récent)
    const sortedCommits = [...commits].sort(
      (a, b) => new Date(a.commit.author.date).getTime() - new Date(b.commit.author.date).getTime(),
    )

    // Obtenir la plage de dates (premier et dernier commit)
    const firstCommitDate = new Date(sortedCommits[0]?.commit.author.date)
    const lastCommitDate = new Date(sortedCommits[sortedCommits.length - 1]?.commit.author.date)

    // Créer un tableau de toutes les dates entre le premier et le dernier commit
    const dateRange = []
    const currentDate = new Date(firstCommitDate)

    while (currentDate <= lastCommitDate) {
      const dateString = currentDate.toISOString().split("T")[0]
      dateRange.push(dateString)
      commitsByDay[dateString] = 0
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Compter les commits par jour et par auteur
    sortedCommits.forEach((commit) => {
      const date = new Date(commit.commit.author.date).toISOString().split("T")[0]
      const author = commit.author?.login || commit.commit.author.name || "Unknown"

      // Incrémenter le compteur pour ce jour
      commitsByDay[date] = (commitsByDay[date] || 0) + 1

      // Suivre les commits par auteur
      if (!commitsByAuthor[author]) {
        commitsByAuthor[author] = {}
        authors.add(author)
      }

      commitsByAuthor[author][date] = (commitsByAuthor[author][date] || 0) + 1
    })

    // Préparer les données pour le graphique
    const labels = Object.keys(commitsByDay).sort()
    const data = labels.map((date) => commitsByDay[date])

    // Calculer la moyenne mobile sur 7 jours
    const movingAverage = []
    for (let i = 0; i < data.length; i++) {
      let sum = 0
      let count = 0

      for (let j = Math.max(0, i - 3); j <= Math.min(data.length - 1, i + 3); j++) {
        sum += data[j]
        count++
      }

      movingAverage.push(sum / count)
    }

    setChartData({
      labels,
      datasets: [
        {
          label: "Commits par jour",
          data,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.1,
          fill: true,
        },
        {
          label: "Tendance (moyenne mobile sur 7 jours)",
          data: movingAverage,
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
      ],
    })
  }, [commits])

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
          callback: function (value, index, values) {
            const label = this.getLabelForValue(Number(value))
            if (!label) return ""
            const date = new Date(label)
            return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            const date = new Date(tooltipItems[0].label)
            return date.toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité des Commits</CardTitle>
        <CardDescription>Évolution des commits au fil du temps avec tendance</CardDescription>
      </CardHeader>
      <CardContent>
        {!commits || commits.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucune information sur les commits disponible</p>
        ) : (
          <div className="h-[350px] w-full">
            <Line data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
