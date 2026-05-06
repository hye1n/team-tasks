"use client";

import { useEffect, useState, useMemo } from "react";
import { Task, Status } from "@/types/task";
import { loadTasks, saveTasks } from "@/lib/store";
import TaskCard from "@/components/TaskCard";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: "todo", label: "할 일", color: "border-t-slate-400" },
  { key: "in-progress", label: "진행 중", color: "border-t-blue-500" },
  { key: "done", label: "완료", color: "border-t-emerald-500" },
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  function persist(next: Task[]) {
    setTasks(next);
    saveTasks(next);
  }

  function handleCreate(data: Omit<Task, "id" | "createdAt">) {
    const task: Task = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    persist([task, ...tasks]);
    setDialogOpen(false);
  }

  function handleUpdate(data: Omit<Task, "id" | "createdAt">) {
    if (!editing) return;
    persist(tasks.map((t) => (t.id === editing.id ? { ...editing, ...data } : t)));
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("이 일감을 삭제하시겠습니까?")) return;
    persist(tasks.filter((t) => t.id !== id));
  }

  function handleToggleDone(id: string) {
    persist(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "todo" : "done" }
          : t
      )
    );
  }

  const assignees = useMemo(
    () => [...new Set(tasks.map((t) => t.assignee).filter(Boolean))],
    [tasks]
  );

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.assignee.toLowerCase().includes(search.toLowerCase());
      const matchPriority = filterPriority === "all" || t.priority === filterPriority;
      const matchAssignee = filterAssignee === "all" || t.assignee === filterAssignee;
      return matchSearch && matchPriority && matchAssignee;
    });
  }, [tasks, search, filterPriority, filterAssignee]);

  const counts = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === "todo").length,
      "in-progress": tasks.filter((t) => t.status === "in-progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    }),
    [tasks]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">팀 일감 관리</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              전체 {tasks.length}개 · 완료 {counts.done}개
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            새 일감
          </Button>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b bg-card/50 px-6 py-3">
        <div className="mx-auto max-w-7xl flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="제목 또는 담당자 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v ?? "all")}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="우선순위" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 우선순위</SelectItem>
              <SelectItem value="high">높음</SelectItem>
              <SelectItem value="medium">보통</SelectItem>
              <SelectItem value="low">낮음</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterAssignee} onValueChange={(v) => setFilterAssignee(v ?? "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="담당자" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 담당자</SelectItem>
              {assignees.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="flex flex-col gap-3">
                <div className={`rounded-lg border-t-4 bg-muted/40 px-4 pt-3 pb-2 ${col.color}`}>
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm">{col.label}</h2>
                    <span className="text-xs font-medium text-muted-foreground bg-background rounded-full px-2 py-0.5 border">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={(t) => setEditing(t)}
                      onDelete={handleDelete}
                      onToggleDone={handleToggleDone}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                      일감이 없습니다
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>새 일감 추가</DialogTitle>
          </DialogHeader>
          <TaskForm onSubmit={handleCreate} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>일감 수정</DialogTitle>
          </DialogHeader>
          {editing && (
            <TaskForm
              initial={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
