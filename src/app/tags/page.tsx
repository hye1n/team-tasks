"use client";

import { useEffect, useState } from "react";
import type { Tables } from "@/lib/database.types";

type Tag = Tables<"tags">;

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchTags() {
    setLoading(true);
    const res = await fetch("/api/tags");
    if (res.ok) setTags(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchTags(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("태그 이름은 필수입니다.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName("");
      await fetchTags();
    } else {
      const json = await res.json();
      setError(json.error ?? "오류가 발생했습니다.");
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("태그를 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (res.ok) setTags((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">태그</h1>

      <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-4">
        <h2 className="font-medium">새 태그</h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="태그 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white text-sm px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? "저장 중..." : "저장"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">불러오는 중...</p>
      ) : tags.length === 0 ? (
        <p className="text-sm text-gray-500">태그가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li key={tag.id} className="border rounded-lg p-4 flex justify-between items-center gap-4">
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium break-words">{tag.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(tag.created_at).toLocaleString("ko-KR")}
                </p>
              </div>
              <button
                onClick={() => handleDelete(tag.id)}
                className="text-xs text-red-500 hover:underline shrink-0"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
