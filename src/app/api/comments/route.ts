import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const taskId = request.nextUrl.searchParams.get("task_id");

  let query = supabase.from("comments").select("*").order("created_at", { ascending: false });
  if (taskId) query = query.eq("task_id", taskId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { body: commentBody, task_id } = body as { body: string; task_id: string };

  if (!commentBody?.trim()) return NextResponse.json({ error: "body is required" }, { status: 400 });
  if (!task_id) return NextResponse.json({ error: "task_id is required" }, { status: 400 });

  const { data, error } = await supabase
    .from("comments")
    .insert({ body: commentBody.trim(), task_id, created_by: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
