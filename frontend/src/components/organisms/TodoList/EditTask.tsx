import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@components/atoms/button";
import { Checkbox } from "@components/atoms/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/atoms/form";
import { InputForm, DateForm } from "@components/molecules/Forms";
import { IAddTaskPayload } from "@services/api/tasks";
import { PlusCircle, Save, XCircle } from "lucide-react";

interface TaskFormProps {
  form: UseFormReturn<IAddTaskPayload>;
  onSubmit: (data: IAddTaskPayload) => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  mode: "add" | "edit";
  onCancel?: () => void;
  advancedBgColor?: string;
}

export function TaskForm({
  form,
  onSubmit,
  showAdvanced,
  setShowAdvanced,
  mode,
  onCancel,
  advancedBgColor = "bg-slate-50",
}: TaskFormProps) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={mode === "add" ? "space-y-4 mb-6" : "space-y-3"}
      >
        <div className="flex gap-2">
          <InputForm
            control={form.control}
            name="title"
            placeholder="Task title..."
            className="flex-1"
            autoFocus={mode === "edit"}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowAdvanced(!showAdvanced)}
            title={showAdvanced ? "Hide details" : "Show details"}
          >
            {showAdvanced ? <XCircle size={20} /> : <PlusCircle size={20} />}
          </Button>
        </div>

        <InputForm
          control={form.control}
          name="description"
          placeholder="Task description..."
        />

        {showAdvanced && (
          <div className={`space-y-4 p-4 ${advancedBgColor} rounded-md`}>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 p-4 border rounded-md">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value ? "Finished" : "To-do"}
                    </div>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DateForm
              control={form.control}
              name="deadline"
              label="Deadline"
              placeholder="Pick a date"
              showTime={true}
            />
          </div>
        )}

        {mode === "add" ? (
          <Button
            type="submit"
            className="w-full"
            disabled={!form.watch("title") || !form.watch("description")}
          >
            <PlusCircle size={20} className="mr-2" /> Add Task
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="flex-1"
              aria-label="Save task"
            >
              <Save size={16} className="mr-2" /> Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              aria-label="Cancel edit"
              className="flex-1"
            >
              <XCircle size={16} className="mr-2" /> Cancel
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
