import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/atoms/form";
import { Input } from "@components/atoms/input";
import { ComponentProps } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface InputFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  type?: ComponentProps<typeof Input>["type"];
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function InputForm<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  className,
  disabled,
  autoFocus,
}: InputFormProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
