"use client";

import { Button } from "@components/atoms/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/atoms/dropdown-menu";
import { Avatar, AvatarFallback } from "@components/atoms/avatar";
import { useGetSession } from "@services/query/session";
import { submitLogout } from "@services/api/auth/logout";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, User, Shield, Settings } from "lucide-react";

export function UserNav() {
  const { data: session } = useGetSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await submitLogout();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  if (!session) {
    return null;
  }

  const initials =
    session.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || session.username.substring(0, 2).toUpperCase();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "text-red-600 bg-red-50 dark:bg-red-950";
      case "admin":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">{session.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              @{session.username}
            </p>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(session.role)}`}
              >
                {session.role}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        {session.role === "superadmin" && (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                router.push("/role-management");
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Role Management</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
