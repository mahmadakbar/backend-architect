"use client";

import { useState } from "react";
import { Button } from "@components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/atoms/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/atoms/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/atoms/select";
import { Badge } from "@components/atoms/badge";
import { changeUserRole } from "@services/api/users";
import { toast } from "sonner";
import { Shield, RefreshCw } from "lucide-react";

interface IUser {
  id: number;
  username: string;
  name: string;
  createdAt: string;
  role: {
    id: number;
    name: string;
  };
}

interface IRole {
  id: number;
  name: string;
}

interface RoleManagementTableProps {
  users: IUser[];
  roles: IRole[];
  onRoleChange: () => void;
}

export function RoleManagementTable({
  users,
  roles,
  onRoleChange,
}: RoleManagementTableProps) {
  const [changingRole, setChangingRole] = useState<number | null>(null);

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case "superadmin":
        return "destructive";
      case "admin":
        return "default";
      default:
        return "secondary";
    }
  };

  const handleRoleChange = async (userId: number, newRoleId: string) => {
    setChangingRole(userId);
    try {
      const result = await changeUserRole(userId, parseInt(newRoleId));

      if ("error" in result) {
        toast.error("Failed to change role", {
          description: result.error.message,
        });
        return;
      }

      toast.success("Role changed successfully", {
        description: result.message,
      });

      // Refresh the user list
      onRoleChange();
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Failed to change role");
    } finally {
      setChangingRole(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Role Management
        </CardTitle>
        <CardDescription>
          Manage user roles and permissions. Only superadmins can access this
          page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Change Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.name || "-"}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role.name)}>
                    {user.role.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={user.role.id.toString()}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                    disabled={changingRole === user.id}
                  >
                    <SelectTrigger className="w-[150px]">
                      {changingRole === user.id ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Changing...</span>
                        </div>
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
