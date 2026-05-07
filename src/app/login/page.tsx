"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.replace("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
        <h1 className="text-2xl font-bold">팀 일감</h1>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3 w-full">
          <input
            data-testid="email-input"
            type="email"
            name="email"
            placeholder="이메일"
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            data-testid="password-input"
            type="password"
            name="password"
            placeholder="비밀번호"
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            data-testid="email-login-submit"
            type="submit"
            disabled={pending}
            className="w-full"
          >
            Email로 로그인
          </Button>
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </form>

        <div className="flex items-center gap-3 w-full">
          <hr className="flex-1" />
          <span className="text-xs text-muted-foreground">또는</span>
          <hr className="flex-1" />
        </div>

        <Button variant="outline" onClick={handleGoogleLogin} className="w-full">
          Google로 로그인
        </Button>
      </div>
    </main>
  );
}
