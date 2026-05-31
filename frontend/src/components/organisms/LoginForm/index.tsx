"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@components/atoms/button";
import { Form, FormMessage } from "@components/atoms/form";
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
import { loginAction } from "@/app/(auth)/login/actions";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username cannot be empty." }),
  password: z.string().min(1, { message: "Password cannot be empty." }), // Basic validation
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      const result = await loginAction(data);

      if (!result.success) {
        toast.error("Login Failed", {
          description: result.error?.message || "Invalid username or password.",
        });
        return;
      }

      toast.success("Login Successful!", {
        description: "Welcome back!",
      });

      // Redirect to home page
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login Failed", {
        description: "An unexpected error occurred.",
      });
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {" "}
          {/* Increased spacing */}
          <CardContent className="space-y-4">
            <InputForm
              control={form.control}
              name="username"
              label="Username"
              type="text"
              placeholder="your_username"
              disabled={form.formState.isSubmitting}
            />
            <InputForm
              control={form.control}
              name="password"
              label="Password"
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
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
            </Button>

            <div className="flex w-full justify-between mt-1">
              <Button
                variant="link"
                type="button"
                className="w-full justify-start text-xs p-0 m-0 font-bold h-fit"
                onClick={() => {
                  // Handle navigation to registration page
                  router.push("/register"); // Adjust the path as needed
                }}
              >
                {" Don't have an account?"}
              </Button>
              <Button
                variant="link"
                type="button"
                className="w-full justify-end text-xs p-0 m-0 font-bold h-fit"
              >
                Forgot Password?
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
