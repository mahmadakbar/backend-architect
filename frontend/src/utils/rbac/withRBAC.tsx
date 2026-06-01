"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@services/session";

type Role = "superadmin" | "admin" | "user";

interface WithRBACProps {
  allowedRoles: Role[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function withRBAC<P extends object>(
  Component: React.ComponentType<P>,
  { allowedRoles, fallback, redirectTo }: WithRBACProps,
) {
  return function RBACComponent(props: P) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [userRole, setUserRole] = useState<Role | null>(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const session = await getSession();

          if (!session) {
            setIsAuthorized(false);
            if (redirectTo) {
              router.push(redirectTo);
            }
            return;
          }

          const role = session.role as Role;
          setUserRole(role);

          if (allowedRoles.includes(role)) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            if (redirectTo) {
              router.push(redirectTo);
            }
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          setIsAuthorized(false);
          if (redirectTo) {
            router.push(redirectTo);
          }
        }
      };

      checkAuth();
    }, [router]);

    if (isAuthorized === null) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthorized) {
      return fallback ? <>{fallback}</> : null;
    }

    return <Component {...props} />;
  };
}

interface RBACWrapperProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallback?: React.ReactNode;
}

export function RBACWrapper({
  children,
  allowedRoles,
  fallback,
}: RBACWrapperProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();

        if (!session) {
          setIsAuthorized(false);
          return;
        }

        const role = session.role as Role;
        setIsAuthorized(allowedRoles.includes(role));
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (isAuthorized === null) {
    return null;
  }

  if (!isAuthorized) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
