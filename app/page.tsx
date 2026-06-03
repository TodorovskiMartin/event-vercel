import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.25em] text-neon">EventKahoot</p>
        <h1 className="mt-4 text-4xl font-semibold text-white md:text-6xl">Live album voting that keeps the show moving.</h1>
        <p className="mt-5 max-w-2xl text-lg text-zinc-300">
          Scan, select exactly three songs, submit once, and reveal confirmed results from the database.
        </p>
        <div className="mt-8 flex gap-3">
          <Link className="rounded-md bg-brass px-5 py-3 font-semibold text-ink" href="/admin/events">
            Admin dashboard
          </Link>
          <Link className="rounded-md border border-zinc-700 px-5 py-3 text-zinc-100" href="/e/demo">
            Demo public page
          </Link>
        </div>
      </div>
    </main>
  );
}
