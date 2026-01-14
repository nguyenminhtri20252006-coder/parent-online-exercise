// File: src/app/api/save-feedback/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, feedback } = body;

    if (!email || !feedback) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // Cập nhật record mới nhất của email này
    // Lưu ý: Logic này giả định người dùng vừa nộp bài xong.
    // Để chính xác tuyệt đối, nên truyền ID, nhưng để đơn giản hóa luồng hiện tại ta dùng email.

    // 1. Tìm ID của bài thi gần nhất
    const { data: records } = await supabase
      .from("exam_results")
      .select("id")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy bài thi" },
        { status: 404 },
      );
    }

    const latestId = records[0].id;

    // 2. Update feedback
    const { error } = await supabase
      .from("exam_results")
      .update({ feedback: feedback })
      .eq("id", latestId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
