"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, BarChart2, Home } from "lucide-react";
import AuthStatus from "@/components/auth-status";
import ApiStatus from "@/components/api-status";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BarChart2 className="h-5 w-5" />
            <span>GitHub Explorer</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 text-sm font-medium ${
                pathname === "/"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Accueil
            </Link>
            <Link
              href="/search"
              className={`flex items-center gap-2 text-sm font-medium ${
                pathname === "/search"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-4 w-4" />
              Recherche
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ApiStatus />
          {/* <AuthStatus /> */}
        </div>
      </div>
    </header>
  );
}
