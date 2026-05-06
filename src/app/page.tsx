"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";

type Task = Tables<"tasks">;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function load() {
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    load();
  }

  async function handleToggle(task: Task) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: task.status === "done" ? "todo" : "done" }),
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">팀 일감</h1>
          <p className="text-sm text-muted-foreground mt-0.5">내가 만들거나 내게 배정된 일감만 표시됩니다.</p>
        </div>
        <div className="flex items-center gap-3">
          {email && <span className="text-sm text-muted-foreground">{email}</span>}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 일감 제목"
          required
        />
        <Button type="submit" disabled={!title.trim()}>추가</Button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">불러오는 중…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">일감이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3 rounded-lg border p-3">
              <button
                onClick={() => handleToggle(task)}
                aria-label={task.status === "done" ? "완료 취소" : "완료로 표시"}
                className={`shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.status === "done"
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-slate-300 hover:border-emerald-400"
                }`}
              >
                {task.status === "done" && (
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="1.5,6 4.5,9.5 10.5,2.5" />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 text-sm ${
                  task.status === "done" ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.title}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(task.id)}
                className="shrink-0 text-destructive hover:text-destructive h-7 w-7 p-0"
              >
                ×
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
