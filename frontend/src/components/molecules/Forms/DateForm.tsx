import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/atoms/form";
import { Button } from "@components/atoms/button";
import { Calendar } from "@components/atoms/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/atoms/popover";
import { Input } from "@components/atoms/input";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@utils";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface DateFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  showTime?: boolean;
  className?: string;
}

export function DateForm<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder = "Pick a date",
  showTime = true,
  className,
}: DateFormProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col space-y-3", className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <div className="flex gap-2">
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal bg-accent",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>{placeholder}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const currentValue = field.value
                          ? new Date(field.value)
                          : new Date();
                        date.setHours(currentValue.getHours());
                        date.setMinutes(currentValue.getMinutes());
                        field.onChange(date.toISOString());
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {showTime && (
              <div className="w-32">
                <FormControl>
                  <Input
                    type="time"
                    value={
                      field.value ? format(new Date(field.value), "HH:mm") : ""
                    }
                    onChange={(e) => {
                      const timeValue = e.target.value;
                      if (timeValue) {
                        const [hours, minutes] = timeValue.split(":");
                        const date = field.value
                          ? new Date(field.value)
                          : new Date();
                        date.setHours(parseInt(hours));
                        date.setMinutes(parseInt(minutes));
                        field.onChange(date.toISOString());
                      }
                    }}
                    className="bg-accent"
                  />
                </FormControl>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
