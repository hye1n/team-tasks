import { Task } from "@/types/task";

const STORAGE_KEY = "team-tasks";

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "랜딩 페이지 디자인",
    description: "메인 페이지 UI/UX 디자인 및 피그마 작업",
    status: "done",
    priority: "high",
    assignee: "김민준",
    dueDate: "2026-05-01",
    createdAt: "2026-04-20",
  },
  {
    id: "2",
    title: "API 연동",
    description: "백엔드 REST API 연동 및 에러 핸들링 구현",
    status: "in-progress",
    priority: "high",
    assignee: "이서연",
    dueDate: "2026-05-10",
    createdAt: "2026-04-25",
  },
  {
    id: "3",
    title: "단위 테스트 작성",
    description: "주요 컴포넌트 Jest 단위 테스트 작성",
    status: "todo",
    priority: "medium",
    assignee: "박지호",
    dueDate: "2026-05-20",
    createdAt: "2026-04-28",
  },
  {
    id: "4",
    title: "성능 최적화",
    description: "Lighthouse 점수 90점 이상 달성",
    status: "todo",
    priority: "low",
    assignee: "최수아",
    dueDate: "2026-05-25",
    createdAt: "2026-04-30",
  },
];

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return INITIAL_TASKS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveTasks(INITIAL_TASKS);
    return INITIAL_TASKS;
  }
  return JSON.parse(raw) as Task[];
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
