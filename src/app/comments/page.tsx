"use client";

import { useEffect, useState } from "react";
import type { Tables } from "@/lib/database.types";

type Comment = Tables<"comments">;

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [taskId, setTaskId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchComments() {
    setLoading(true);
    const res = await fetch("/api/comments");
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchComments(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!body.trim() || !taskId.trim()) {
      setError("본문과 task_id는 필수입니다.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, task_id: taskId }),
    });
    if (res.ok) {
      setBody("");
      setTaskId("");
      await fetchComments();
    } else {
      const json = await res.json();
      setError(json.error ?? "오류가 발생했습니다.");
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">댓글</h1>

      <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-4">
        <h2 className="font-medium">새 댓글</h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Task ID"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <textarea
          placeholder="댓글 내용"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2 text-sm resize-none"
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
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">댓글이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="border rounded-lg p-4 flex justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <p className="text-sm break-words">{comment.body}</p>
                <p className="text-xs text-gray-400">
                  task: {comment.task_id} · {new Date(comment.created_at).toLocaleString("ko-KR")}
                </p>
              </div>
              <button
                onClick={() => handleDelete(comment.id)}
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
