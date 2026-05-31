"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";

import { Button } from "@components/atoms/button";
import { Form, FormDescription, FormMessage } from "@components/atoms/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/atoms/card";
import { InputForm } from "@components/molecules/Forms";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSubmitRegister } from "@services/query/auth";
import { env } from "@utils/environment";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters." }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters." })
      .max(20, { message: "Username must be at most 20 characters." })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores.",
      }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/[a-zA-Z]/, {
        message: "Password must contain at least one letter.",
      }) // Inspired by [21]
      .regex(/[0-9]/, { message: "Password must contain at least one number." }) // Inspired by [21]
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character.",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match. Please re-enter.",
    path: ["confirmPassword"], // Apply error to the confirmPassword field
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutateAsync: register } = useSubmitRegister();

  async function onSubmit(data: RegisterFormValues) {
    const response = await register({
      name: data.fullName,
      username: data.username,
      password: data.password,
    });

    if ("error" in response) {
      const errorMessage =
        typeof response.error === "object" &&
        response.error !== null &&
        "message" in response.error &&
        typeof response.error.message === "string"
          ? response.error.message
          : "An error occurred during registration";
      toast.error(errorMessage);
      return;
    }

    toast.success("Registration Successful!", {
      description:
        "Your account has been created. Please check your email to verify.",
    });
    form.reset(); // Optionally reset form on success
    router.push("/login"); // Redirect to login page after successful registration
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-1 text-center">
        {/* back button */}
        <Button
          variant="ghost"
          size="icon"
          className="top-4 left-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>
          Fill in the details below to get started.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-4">
            <InputForm
              control={form.control}
              name="fullName"
              label="Full Name"
              placeholder="John Doe"
              disabled={form.formState.isSubmitting}
            />
            <InputForm
              control={form.control}
              name="username"
              label="Username"
              type="text"
              placeholder="your_username"
              disabled={form.formState.isSubmitting}
            />
            <div>
              <InputForm
                control={form.control}
                name="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                disabled={form.formState.isSubmitting}
              />
              <FormDescription className="mt-2">
                Must be 8+ characters with letters, numbers, and special
                characters.
              </FormDescription>
            </div>
            <InputForm
              control={form.control}
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              disabled={form.formState.isSubmitting}
            />

            {form.formState.errors.root?.serverError && (
              <FormMessage className="text-destructive">
                {form.formState.errors.root.serverError.message}
              </FormMessage>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Creating Account..."
                : "Create Account"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
