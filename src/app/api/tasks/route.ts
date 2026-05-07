// SUSPICIOUS: middleware.ts 가 미인증 요청을 /login 으로 307 redirect 처리함.
// API 클라이언트는 401 JSON 을 기대하므로, 필요 시 middleware.ts 에서 /api/* 분기 추가 요망.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildTaskRecord } from "@/lib/tasks/buildTaskRecord";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const assigneeId = request.nextUrl.searchParams.get("assignee_id");

  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (assigneeId) query = query.eq("assignee_id", assigneeId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = buildTaskRecord(body, user);
  if (result.ok === false) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert(result.record)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
