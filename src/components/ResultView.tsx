/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/components/ResultView.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserData, ExamResult } from "@/types";

interface Props {
  userData: UserData;
  result: { score: number; duration: number };
  onRetest: () => void;
  onComplete: () => void;
}

// Mở rộng kiểu dữ liệu để TypeScript hiểu trường phone
interface RankingItem extends ExamResult {
  phone: string;
}

export default function ResultView({
  userData,
  result,
  onRetest,
  onComplete,
}: Props) {
  // Cập nhật state để sử dụng RankingItem thay vì ExamResult
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const submitAndFetch = async () => {
      try {
        // 1. Submit kết quả
        await fetch("/api/submit-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userData,
            score: result.score,
            duration: result.duration,
          }),
        });

        // 2. Lấy BXH
        const { data } = await supabase
          .from("exam_results")
          .select("name, score, duration, phone")
          .order("score", { ascending: false })
          .order("duration", { ascending: true })
          .limit(50);

        if (data) {
          const uniqueMap = new Map();
          data.forEach((item: any) => {
            if (!uniqueMap.has(item.phone)) {
              uniqueMap.set(item.phone, item);
            }
          });
          const top10Unique = Array.from(uniqueMap.values()).slice(
            0,
            10,
          ) as RankingItem[];
          setRanking(top10Unique);
        }
      } catch (error) {
        console.error("Lỗi quy trình kết quả", error);
      } finally {
        setLoading(false);
      }
    };

    submitAndFetch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDuration = (s: number) => {
    if (s < 60) return s + "s";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}p ${sec}s`;
  };

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto space-y-4 md:space-y-6 flex flex-col justify-center">
      {/* Score Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-8 md:p-10 rounded-3xl text-center shadow-2xl mt-4 md:mt-8 transform transition-all animate-fade-in-up">
        <p className="text-blue-100 uppercase tracking-widest text-xs font-bold mb-2">
          Kết quả bài kiểm tra
        </p>
        <h2 className="text-6xl md:text-7xl font-black mb-4">
          {result.score.toString().replace(".", ",")}
          <span className="text-2xl opacity-40 font-medium">/10</span>
        </h2>
        <div className="bg-black/20 px-4 py-2 md:px-5 md:py-2 rounded-full inline-block text-xs md:text-sm font-medium">
          Thời gian: {formatDuration(result.duration)}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 min-h-[300px] flex flex-col">
        <h3 className="font-black text-gray-700 mb-4 uppercase text-xs md:text-sm tracking-widest flex items-center gap-2">
          <span>🏆</span> Bảng xếp hạng Top 10
        </h3>

        {loading ? (
          <div className="space-y-3 flex-1 overflow-hidden">
            {/* Skeleton Loading */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 md:p-3 animate-pulse"
              >
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-200 rounded-full shrink-0"></div>
                <div className="flex-1 h-4 md:h-5 bg-gray-200 rounded-lg"></div>
                <div className="w-12 h-8 md:w-16 md:h-10 bg-gray-200 rounded-lg shrink-0"></div>
              </div>
            ))}
            <div className="flex justify-center mt-4 text-gray-400 text-xs gap-2 items-center">
              <span className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
              <span>Đang cập nhật bảng xếp hạng...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[250px] md:max-h-[300px] pr-1 custom-scrollbar">
            {ranking.map((r, idx) => {
              // Kiểm tra xem dòng này có phải của người dùng hiện tại không
              const isCurrentUser = r.phone === userData.phone;

              // Logic chọn class style
              let rowClass =
                "flex justify-between items-center p-2 md:p-3 rounded-xl transition-all ";
              if (isCurrentUser) {
                // Highlight người dùng hiện tại: Nền xanh, viền xanh đậm
                rowClass +=
                  "bg-blue-100 border-2 border-blue-400 shadow-md transform scale-[1.02]";
              } else if (idx === 0) {
                // Top 1: Nền vàng
                rowClass += "bg-yellow-50 border border-yellow-200";
              } else {
                // Các dòng khác: Nền xám
                rowClass += "bg-gray-50 hover:bg-gray-100";
              }

              return (
                <div key={idx} className={rowClass}>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-black w-6 text-center ${
                        idx < 3
                          ? "text-blue-600 text-base md:text-lg"
                          : "text-gray-300 text-sm"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-sm truncate max-w-[100px] md:max-w-[120px] ${
                            isCurrentUser ? "text-blue-800" : "text-gray-700"
                          }`}
                        >
                          {r.name}
                        </span>
                        {/* Thêm nhãn (Bạn) nếu là người dùng hiện tại */}
                        {isCurrentUser && (
                          <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            Bạn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 md:gap-4 text-right">
                    <div>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">
                        Điểm
                      </p>
                      <p
                        className={`font-black text-sm md:text-base ${
                          isCurrentUser ? "text-blue-700" : "text-blue-600"
                        }`}
                      >
                        {r.score}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">
                        Thời gian
                      </p>
                      <p className="font-bold text-gray-500 text-xs">
                        {formatDuration(r.duration)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {ranking.length === 0 && (
              <p className="text-center text-gray-400 py-4 italic text-sm">
                Chưa có dữ liệu xếp hạng
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pb-4 md:pb-8">
        <button
          onClick={onRetest}
          className="bg-gray-200 text-gray-600 p-3 md:p-4 rounded-2xl font-bold text-sm md:text-base hover:bg-gray-300 transition-colors"
        >
          LÀM LẠI
        </button>
        <button
          onClick={onComplete}
          className="bg-blue-600 text-white p-3 md:p-4 rounded-2xl font-bold text-sm md:text-base hover:bg-blue-700 shadow-lg uppercase transition-colors"
        >
          Hoàn thành
        </button>
      </div>
    </div>
  );
}
