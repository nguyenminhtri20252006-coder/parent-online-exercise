// File: src/app/api/questions/route.ts
import { NextResponse } from "next/server";

// URL của Google Apps Script Web App (Bạn cần điền vào .env.local)
const GAS_API_URL = process.env.GAS_API_URL || "";

export async function GET() {
  try {
    // Gọi đến GAS để lấy JSON câu hỏi
    const res = await fetch(GAS_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Không cache để luôn lấy dữ liệu mới
    });

    if (!res.ok) {
      throw new Error("Failed to fetch from GAS");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { status: "error", message: "Không thể tải bộ câu hỏi." },
      { status: 500 },
    );
  }
}
