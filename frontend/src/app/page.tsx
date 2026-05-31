import TodoList from "@components/organisms/TodoList";
import { Navbar } from "@components/molecules/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <main className="flex flex-col items-center p-4 md:p-8">
        <TodoList />
      </main>
    </div>
  );
}
