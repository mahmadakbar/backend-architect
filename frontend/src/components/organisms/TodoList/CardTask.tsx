import React from "react";
import { Button } from "@components/atoms/button";
import { IApiResTasks } from "@interfaces/api";
import { Trash2, Edit3 } from "lucide-react";
import { format } from "date-fns";

interface CardTaskProps {
  todo: IApiResTasks;
  onEdit: (todo: IApiResTasks) => void;
  onDelete: (id: number) => void;
}

export function CardTask({ todo, onEdit, onDelete }: CardTaskProps) {
  return (
    <div className="flex items-center">
      <div
        className={`grow text-sm ${
          todo.status ? "text-slate-400" : "text-black"
        }`}
      >
        <div className="font-medium">{todo.title}</div>
        <div className="text-[9px] text-gray-500 line-clamp-1 mt-0.5">
          {todo.description}
        </div>
        <div className="mt-1 flex">
          {todo.status ? (
            <span className="text-xs text-green-600 dark:text-green-400">
              ✓ Completed
            </span>
          ) : (
            <span className="text-xs text-red-600 dark:text-red-400">
              ✗ Incomplete
            </span>
          )}

          {todo.deadline && (
            <span className="ml-4 text-xs text-blue-600 dark:text-blue-400">
              🗓️ Due: {format(new Date(todo.deadline), "PPP p")}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(todo)}
        className="ml-2 hover:text-blue-500 dark:hover:text-blue-400"
        aria-label="Edit task"
      >
        <Edit3 size={16} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(todo.id)}
        className="hover:text-red-500 dark:hover:text-red-400"
        aria-label="Delete task"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
