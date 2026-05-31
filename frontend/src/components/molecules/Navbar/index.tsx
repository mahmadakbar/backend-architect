"use client";

import { UserNav } from "@components/molecules/UserNav";
import { useGetSession } from "@services/query/session";
import { CheckSquare } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useGetSession();

  if (!session) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6" />
          <span className="font-bold text-xl">Todo App</span>
        </Link>
        <div className="flex-1" />
        <UserNav />
      </div>
    </div>
  );
}
