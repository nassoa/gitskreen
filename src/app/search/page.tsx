"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchIcon } from "lucide-react";
import { fetchWithAuth } from "@/lib/github";
import AuthStatus from "@/components/auth-status";
import ApiStatus from "@/components/api-status";
import SearchResults from "@/components/search-results";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Langages de programmation populaires
const popularLanguages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "PHP",
  "C++",
  "Ruby",
  "Go",
  "Swift",
  "Kotlin",
  "Rust",
];

// Schéma de validation du formulaire
const searchFormSchema = z.object({
  query: z.string().min(1, "Veuillez entrer un terme de recherche"),
  language: z.string().optional(),
  minStars: z.number().min(0).default(0),
  sort: z
    .enum(["stars", "forks", "updated", "help-wanted-issues"])
    .default("stars"),
  order: z.enum(["desc", "asc"]).default("desc"),
  includeArchived: z.boolean().default(false),
});

export default function SearchPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Initialiser le formulaire avec react-hook-form
  const form = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: "",
      language: "",
      minStars: 0,
      sort: "stars",
      order: "desc",
      includeArchived: false,
    },
  });

  // Fonction de recherche
  const searchRepositories = async (
    values: z.infer<typeof searchFormSchema>,
    page = 1
  ) => {
    setLoading(true);

    try {
      // Construire la requête de recherche
      let searchQuery = values.query;

      // Ajouter les filtres
      if (values.language) {
        searchQuery += ` language:${values.language}`;
      }

      if (values.minStars > 0) {
        searchQuery += ` stars:>=${values.minStars}`;
      }

      if (!values.includeArchived) {
        searchQuery += " archived:false";
      }

      // Effectuer la recherche
      const response = await fetchWithAuth(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(
          searchQuery
        )}&sort=${values.sort}&order=${values.order}&per_page=10&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la recherche: ${response.status}`);
      }

      const data = await response.json();

      // Mettre à jour les résultats
      setSearchResults(data.items || []);
      setTotalCount(data.total_count || 0);
      setHasNextPage((data.items || []).length === 10);
      setCurrentPage(page);

      // Afficher un toast avec le nombre de résultats
      toast({
        title: "Recherche terminée",
        description: `${data.total_count} dépôts trouvés`,
      });
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast({
        variant: "destructive",
        title: "Erreur de recherche",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur s'est produite lors de la recherche",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gérer la soumission du formulaire
  const onSubmit = (values: z.infer<typeof searchFormSchema>) => {
    searchRepositories(values);
  };

  // Gérer la pagination
  const handleNextPage = () => {
    if (hasNextPage) {
      searchRepositories(form.getValues(), currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      searchRepositories(form.getValues(), currentPage - 1);
    }
  };

  // Gérer la sélection d'un dépôt
  const handleSelectRepository = (repoUrl: string) => {
    router.push(`/?url=${encodeURIComponent(repoUrl)}`);
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recherche de Dépôts GitHub</h1>
        {/* <div className="flex items-center gap-4">
          <ApiStatus />
          <AuthStatus />
        </div> */}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Rechercher des dépôts</CardTitle>
          <CardDescription>
            Trouvez des dépôts GitHub en fonction de différents critères
            {!session && (
              <span className="block mt-1 text-yellow-500">
                Connectez-vous avec GitHub pour augmenter les limites d&apos;API
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terme de recherche</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Exemple: nextjs, react, state management..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Recherchez par nom, description ou mots-clés
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Langage</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tous les langages" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Tous les langages</SelectItem>
                          {popularLanguages.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Filtrer par langage de programmation
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="minStars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre minimum d&apos;étoiles: {field.value}
                      </FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={10000}
                          step={100}
                          defaultValue={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Filtrer par popularité (nombre d&apos;étoiles)
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trier par</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Étoiles" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="stars">Étoiles</SelectItem>
                            <SelectItem value="forks">Forks</SelectItem>
                            <SelectItem value="updated">Mise à jour</SelectItem>
                            <SelectItem value="help-wanted-issues">
                              Issues ouvertes
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordre</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Décroissant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="desc">Décroissant</SelectItem>
                            <SelectItem value="asc">Croissant</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="includeArchived"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Inclure les dépôts archivés</FormLabel>
                      <FormDescription>
                        Par défaut, seuls les dépôts actifs sont affichés
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Recherche en cours..." : "Rechercher"}
                <SearchIcon className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Résultats ({totalCount > 1000 ? "1000+" : totalCount})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || loading}
              >
                Précédent
              </Button>
              <span className="text-sm">Page {currentPage}</span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={!hasNextPage || loading}
              >
                Suivant
              </Button>
            </div>
          </div>

          <SearchResults
            repositories={searchResults}
            onSelectRepository={handleSelectRepository}
          />
        </div>
      )}

      {searchResults.length === 0 && form.formState.isSubmitted && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Aucun résultat trouvé pour cette recherche.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Essayez de modifier vos critères de recherche.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
