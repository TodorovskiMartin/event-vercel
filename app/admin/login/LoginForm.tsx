"use client";

import { useState } from "react";
import { Button, TextInput } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const supabase = createSupabaseBrowserClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) setError(loginError.message);
    else window.location.href = "/admin/events";
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2">
        <span>Email</span>
        <TextInput autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <label className="grid gap-2">
        <span>Password</span>
        <TextInput autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </label>
      {error ? <p className="rounded-md border border-rose/50 bg-rose/10 p-3">{error}</p> : null}
      <Button type="submit">Sign in</Button>
    </form>
  );
}
