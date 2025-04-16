"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartData, type ChartOptions } from "chart.js"

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(ArcElement, Tooltip, Legend)

// Fonction pour générer des couleurs aléatoires mais visuellement distinctes
function generateColors(count: number) {
  const baseColors = [
    "rgba(255, 99, 132, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(199, 199, 199, 0.8)",
    "rgba(83, 102, 255, 0.8)",
    "rgba(78, 205, 196, 0.8)",
    "rgba(255, 99, 71, 0.8)",
  ]

  // Si nous avons besoin de plus de couleurs que dans notre base, générer des couleurs supplémentaires
  const colors = [...baseColors]

  while (colors.length < count) {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`)
  }

  return colors.slice(0, count)
}

export default function LanguageDonutChart({ languages }) {
  const [chartData, setChartData] = useState<ChartData<"doughnut">>({
    datasets: [],
    labels: [],
  })

  useEffect(() => {
    if (!languages || Object.keys(languages).length === 0) return

    // Calculer le total des octets pour tous les langages
    const totalBytes = Object.values(languages).reduce((sum: number, bytes: number) => sum + bytes, 0)

    // Trier les langages par taille et limiter à 10 maximum pour la lisibilité
    const sortedLanguages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const languageNames = sortedLanguages.map(([name]) => name)
    const languageBytes = sortedLanguages.map(([, bytes]) => bytes)
    const languagePercentages = languageBytes.map((bytes) => ((bytes / totalBytes) * 100).toFixed(1) + "%")

    // Générer des couleurs pour chaque langage
    const backgroundColors = generateColors(languageNames.length)
    const borderColors = backgroundColors.map((color) => color.replace("0.8", "1"))

    setChartData({
      labels: languageNames,
      datasets: [
        {
          data: languageBytes,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          hoverOffset: 15,
        },
      ],
    })
  }, [languages])

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.raw as number
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number
            const percentage = ((value / total) * 100).toFixed(1)
            const kilobytes = (value / 1024).toFixed(2)
            return `${label}: ${kilobytes} KB (${percentage}%)`
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des Langages</CardTitle>
        <CardDescription>Distribution des langages de programmation utilisés dans ce dépôt</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(languages).length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucune information sur les langages disponible</p>
        ) : (
          <div className="h-[350px] w-full">
            <Doughnut data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
