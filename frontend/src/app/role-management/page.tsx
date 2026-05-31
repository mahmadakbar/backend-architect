"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@components/molecules/Navbar";
import { RoleManagementTable } from "@components/organisms/RoleManagementTable";
import { getAllUsers, getAllRoles } from "@services/api/users";
import { getSession } from "@services/session";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface IUser {
  id: number;
  username: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    name: string;
  };
}

interface IRole {
  id: number;
  name: string;
}

export default function RoleManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<IUser[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      try {
        // Check if user is superadmin
        const session = await getSession();
        if (!session || session.role !== "superadmin") {
          setAuthorized(false);
          return;
        }

        setAuthorized(true);

        // Load data
        await loadData();
      } catch (error) {
        console.error("Error checking access:", error);
        setAuthorized(false);
      }
    };

    checkAccessAndLoadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResult, rolesResult] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
      ]);

      if ("error" in usersResult || "error" in rolesResult) {
        throw new Error("Failed to load data");
      }

      setUsers(usersResult.data);
      setRoles(rolesResult.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show 404 if not authorized
  if (authorized === false) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="mt-2 text-muted-foreground">
            Access denied. This page is only available to superadmins.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-primary hover:underline"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  // Show loading while checking authorization
  if (authorized === null || loading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <Navbar />
        <main className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <main className="flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <RoleManagementTable
            users={users}
            roles={roles}
            onRoleChange={loadData}
          />
        </div>
      </main>
    </div>
  );
}
