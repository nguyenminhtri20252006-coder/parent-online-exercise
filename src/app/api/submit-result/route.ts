// File: src/app/api/submit-result/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Lấy URL GAS từ biến môi trường
const GAS_API_URL = process.env.GAS_API_URL || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, score, duration } = body;

    // 1. Validate
    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 },
      );
    }

    // 2. [MỚI] CHỐNG SPAM / DUPLICATE
    // Kiểm tra xem user này đã nộp kết quả y hệt (cùng điểm, cùng thời gian) trong vòng 1 phút qua chưa?
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const { data: existingRecords } = await supabase
      .from("exam_results")
      .select("id")
      .eq("phone", phone)
      .eq("score", score)
      .eq("duration", duration)
      .gte("created_at", oneMinuteAgo) // Chỉ check trong 1 phút gần nhất
      .limit(1);

    // Nếu đã tồn tại bản ghi tương tự vừa xong -> Coi như thành công nhưng không insert thêm
    if (existingRecords && existingRecords.length > 0) {
      console.log("Phát hiện duplicate submission, bỏ qua insert.");
      return NextResponse.json({ success: true, message: "Duplicate skipped" });
    }

    // 3. Nếu chưa có -> Lưu vào Supabase
    const { data, error } = await supabase
      .from("exam_results")
      .insert([
        {
          name,
          phone,
          email,
          score,
          duration,
        },
      ])
      .select();

    if (error) throw error;

    // 4. Gửi Mail qua Google Apps Script
    if (GAS_API_URL) {
      try {
        await fetch(GAS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            score,
            duration,
          }),
        });
      } catch (mailError) {
        console.error("Lỗi gửi mail qua GAS:", mailError);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error submitting result:", error);
    return NextResponse.json({ error: "Lỗi khi lưu kết quả" }, { status: 500 });
  }
}
