"use client";

import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2 } from "lucide-react";

const priorityConfig = {
  high: { label: "높음", className: "bg-red-100 text-red-700 border-red-200" },
  medium: { label: "보통", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  low: { label: "낮음", className: "bg-green-100 text-green-700 border-green-200" },
};

const statusConfig = {
  todo: { label: "할 일", className: "bg-slate-100 text-slate-600 border-slate-200" },
  "in-progress": { label: "진행 중", className: "bg-blue-100 text-blue-700 border-blue-200" },
  done: { label: "완료", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleDone }: TaskCardProps) {
  const isOverdue =
    task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  return (
    <Card className={`group transition-shadow hover:shadow-md ${task.status === "done" ? "opacity-60" : ""}`}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <CardTitle className={`text-base font-semibold leading-snug ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 outline-none">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onToggleDone(task.id)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {task.status === "done" ? "완료 취소" : "완료 처리"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="mr-2 h-4 w-4" />
              수정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={priorityConfig[task.priority].className}>
            {priorityConfig[task.priority].label}
          </Badge>
          <Badge variant="outline" className={statusConfig[task.status].className}>
            {statusConfig[task.status].label}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {task.assignee && (
            <span className="flex items-center gap-1">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-[10px]">
                {task.assignee.charAt(0)}
              </span>
              {task.assignee}
            </span>
          )}
          {task.dueDate && (
            <span className={isOverdue ? "text-red-500 font-medium" : ""}>
              {isOverdue ? "⚠ " : ""}
              {new Date(task.dueDate).toLocaleDateString("ko-KR", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
