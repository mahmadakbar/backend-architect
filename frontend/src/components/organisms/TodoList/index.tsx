"use client";

import { Button } from "@components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/atoms/card";
import { TaskForm } from "./EditTask";
import { CardTask } from "./CardTask";
import { IApiResTasks } from "@interfaces/api";
import { useGetListTask } from "@services/fatcher/task";
import {
  useSubmitAddTask,
  useSubmitDeleteTask,
  useSubmitUpdateTask,
} from "@services/query/tasks";
import { IAddTaskPayload } from "@services/api/tasks";
import React, { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

export function TodoList() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [showEditAdvancedForm, setShowEditAdvancedForm] = useState(false);

  const { data: todos, error, isError, isLoading, refetch } = useGetListTask();
  const { mutateAsync: addTask } = useSubmitAddTask();
  const { mutateAsync: deleteTask } = useSubmitDeleteTask();
  const { mutateAsync: updateTask } = useSubmitUpdateTask();

  const form = useForm<IAddTaskPayload>({
    defaultValues: {
      title: "",
      description: "",
      status: undefined,
      deadline: undefined,
    },
  });

  const editForm = useForm<IAddTaskPayload>({
    defaultValues: {
      title: "",
      description: "",
      status: undefined,
      deadline: undefined,
    },
  });

  const handleAddTodo = (data: IAddTaskPayload) => {
    if (!data.title?.trim() || !data.description?.trim()) {
      toast.error("Title and description are required");
      return;
    }

    const payload: IAddTaskPayload = {
      title: data.title?.trim(),
      description: data.description?.trim(),
      status: data.status,
      deadline: data.deadline,
    };

    addTask(payload)
      .then(() => {
        refetch();
        form.reset();
        toast.success("Task added successfully!");
      })
      .catch((err) => {
        console.error("Error adding todo:", err);
        toast.error("Failed to add todo");
      });
  };

  const handleDeleteTodo = (id: number) => {
    deleteTask(id.toString())
      .then(() => {
        refetch(); // Refetch todos after deletion
        toast.success("Task deleted successfully!");
      })
      .catch((err) => {
        console.error("Error deleting todo:", err);
        toast.error("Failed to delete todo");
      });

    if (editingId === id) {
      // If deleting the task being edited, cancel edit mode
      setEditingId(null);
      editForm.reset();
    }
  };

  const handleStartEdit = (todo: IApiResTasks) => {
    setEditingId(todo.id);

    editForm.reset({
      title: todo.title,
      description: todo.description,
      status: todo.status || false,
      deadline: todo.deadline || undefined,
    });
    setShowEditAdvancedForm(false);
  };

  const handleSaveEdit = (data: IAddTaskPayload) => {
    if (!editingId) return;

    if (!data.title?.trim() && !data.description?.trim()) {
      toast.error("Title or description is required");
      return;
    }

    updateTask({
      taskId: editingId.toString(),
      data: {
        title: data.title?.trim(),
        description: data.description?.trim(),
        status: data.status,
        deadline: data.deadline,
      },
    })
      .then(() => {
        refetch(); // Refetch todos after updating
        toast.success("Task updated successfully!");
        setEditingId(null);
        editForm.reset();
        setShowEditAdvancedForm(false);
      })
      .catch((err) => {
        console.error("Error updating todo:", err);
        toast.error("Failed to update todo");
      });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    editForm.reset();
    setShowEditAdvancedForm(false);
  };

  const completedCount = todos?.filter((todo) => todo.status).length || 0;
  const pendingCount = (todos?.length || 0) - completedCount;

  if (isLoading) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isError || !todos) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle>Error loading tasks</CardTitle>
            <CardDescription>
              {error?.message || "An unexpected error occurred."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="w-full shadow-xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>My To-Do List</CardTitle>
            <CardDescription>Stay organized and productive.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <TaskForm
            form={form}
            onSubmit={handleAddTodo}
            showAdvanced={showAdvancedForm}
            setShowAdvanced={setShowAdvancedForm}
            mode="add"
          />

          {todos.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400 py-4">
              No tasks yet. Add one above!
            </p>
          )}

          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="p-3 bg-slate-50 rounded-md shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {editingId === todo.id ? (
                  <TaskForm
                    form={editForm}
                    onSubmit={handleSaveEdit}
                    showAdvanced={showEditAdvancedForm}
                    setShowAdvanced={setShowEditAdvancedForm}
                    mode="edit"
                    onCancel={handleCancelEdit}
                    advancedBgColor="bg-white"
                  />
                ) : (
                  <CardTask
                    todo={todo}
                    onEdit={handleStartEdit}
                    onDelete={handleDeleteTodo}
                  />
                )}
              </li>
            ))}
          </ul>
        </CardContent>
        {todos.length > 0 && (
          <CardFooter className="text-xs text-slate-500 dark:text-slate-400 justify-between">
            <span>{pendingCount} task(s) pending</span>
            <span>{completedCount} task(s) completed</span>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default TodoList;
