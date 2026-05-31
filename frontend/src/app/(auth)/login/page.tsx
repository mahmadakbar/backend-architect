import { LoginForm } from "@components/organisms/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 md:p-8">
      <LoginForm />
    </main>
  );
}
