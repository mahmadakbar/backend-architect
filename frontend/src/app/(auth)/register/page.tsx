import { RegisterForm } from "@components/organisms/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 md:p-8">
      <RegisterForm />
    </main>
  );
}
