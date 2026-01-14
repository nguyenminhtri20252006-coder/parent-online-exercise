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

interface RankingItem extends ExamResult {
  phone: string;
}

export default function ResultView({
  userData,
  result,
  onRetest,
  onComplete,
}: Props) {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const submitAndFetch = async () => {
      try {
        await fetch("/api/submit-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userData,
            score: result.score,
            duration: result.duration,
          }),
        });

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
    <div className="min-h-screen p-4 max-w-md mx-auto space-y-4 md:space-y-6 flex flex-col justify-center text-gray-900 bg-transparent">
      {/* CSS ẩn thanh cuộn */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>

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
      <div className="bg-gradient-to-br from-[#FFFDE7] to-[#FFF8E1] p-4 md:p-6 rounded-3xl shadow-lg border-2 border-yellow-200 flex flex-col h-[400px]">
        <h3 className="font-black text-yellow-800 mb-4 uppercase text-xs md:text-sm tracking-widest flex items-center gap-2 shrink-0">
          <span className="text-lg">🏆</span> Bảng Vàng Thành Tích
        </h3>

        {loading ? (
          <div className="flex-1 overflow-hidden space-y-3 px-1">
            {/* Hiệu ứng Skeleton Loading cho Bảng xếp hạng */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 md:p-3 rounded-xl bg-white/40 border border-yellow-100 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }} // Hiệu ứng xuất hiện lần lượt
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-yellow-200/60 rounded-full shrink-0"></div>
                  <div className="h-4 md:h-5 w-24 md:w-32 bg-yellow-200/60 rounded-lg"></div>
                </div>
                <div className="flex gap-2 md:gap-4 shrink-0">
                  <div className="h-6 w-8 bg-yellow-200/60 rounded"></div>
                  <div className="h-6 w-10 bg-yellow-200/60 rounded"></div>
                </div>
              </div>
            ))}

            <div className="flex flex-col justify-center items-center mt-6 text-yellow-600/70 text-xs gap-2">
              <div className="w-6 h-6 border-2 border-yellow-400 border-t-yellow-600 rounded-full animate-spin"></div>
              <span className="font-medium animate-pulse">
                Đang cập nhật kết quả...
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
            <div className="space-y-2">
              {ranking.map((r, idx) => {
                const isCurrentUser = r.phone === userData.phone;

                let rowClass =
                  "flex justify-between items-center p-2 md:p-3 rounded-xl transition-all ";
                if (isCurrentUser) {
                  // User hiện tại: Màu xanh nổi bật trên nền vàng
                  rowClass +=
                    "bg-blue-50 border-2 border-blue-500 shadow-md transform scale-[1.01] z-10 relative";
                } else if (idx === 0) {
                  // Top 1: Vàng đậm hơn
                  rowClass +=
                    "bg-yellow-200 border border-yellow-400 shadow-sm";
                } else if (idx < 3) {
                  // Top 2-3
                  rowClass += "bg-yellow-100/80 border border-yellow-200";
                } else {
                  // Các hạng khác: Trắng hoặc vàng rất nhạt
                  rowClass +=
                    "bg-white/60 hover:bg-white/80 border border-transparent";
                }

                return (
                  <div key={idx} className={rowClass}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span
                        className={`font-black min-w-[1.5rem] md:min-w-[2rem] text-center ${
                          idx < 3
                            ? "text-yellow-700 text-base md:text-lg"
                            : "text-gray-400 text-sm"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm truncate max-w-[110px] md:max-w-[140px] ${
                              isCurrentUser ? "text-blue-800" : "text-gray-800"
                            }`}
                          >
                            {r.name}
                          </span>
                          {isCurrentUser && (
                            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                              Bạn
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 md:gap-4 text-right shrink-0">
                      <div className="min-w-[40px]">
                        <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase">
                          Điểm
                        </p>
                        <p
                          className={`font-black text-sm md:text-base ${
                            isCurrentUser ? "text-blue-700" : "text-gray-800"
                          }`}
                        >
                          {r.score}
                        </p>
                      </div>
                      <div className="min-w-[50px]">
                        <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase">
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
                <div className="flex flex-col items-center justify-center h-full text-yellow-700 opacity-60 italic text-sm mt-10">
                  <p>Chưa có dữ liệu xếp hạng</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pb-4 md:pb-8">
        <button
          onClick={onRetest}
          className="bg-white border-2 border-gray-200 text-gray-600 p-3 md:p-4 rounded-2xl font-bold text-sm md:text-base hover:bg-gray-50 transition-colors"
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
