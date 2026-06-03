import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4">
      <section className="w-full max-w-md rounded-lg border border-zinc-800 bg-stage p-6">
        <h1 className="text-3xl font-semibold">Organizer login</h1>
        <p className="mb-6 mt-2 text-zinc-300">Use the account created in Supabase Auth.</p>
        <LoginForm />
      </section>
    </main>
  );
}
