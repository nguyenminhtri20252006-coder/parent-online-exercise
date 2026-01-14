// File: src/components/FeedbackView.tsx
import React, { useState } from "react";
import { UserData } from "@/types";
import { Facebook, AlertCircle } from "lucide-react";

interface Props {
  userData: UserData;
  onRedirect: () => void;
}

export default function FeedbackView({ userData, onRedirect }: Props) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      onRedirect();
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch("/api/save-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          feedback: feedback,
        }),
      });
    } catch (error) {
      console.error("Lỗi gửi feedback:", error);
    } finally {
      setIsSubmitting(false);
      onRedirect();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gray-50">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 text-center animate-fade-in-up">
        <div className="text-5xl md:text-6xl mb-4">🎉</div>
        <h2 className="text-2xl md:text-3xl font-black text-blue-700 mb-4 uppercase tracking-tight">
          Cảm ơn bạn!
        </h2>

        {/* Khu vực thông báo Email */}
        <div className="bg-blue-50 p-4 rounded-xl mb-6 md:mb-8 text-sm text-gray-600 space-y-3 border border-blue-100">
          <p>
            Bạn đã hoàn thành bài kiểm tra. Kết quả đã được gửi về email{" "}
            <span className="font-bold text-blue-700">{userData.email}</span>.
          </p>

          {/* Ghi chú quan trọng */}
          <div className="flex gap-2 items-start text-xs text-orange-700 font-medium bg-orange-50 p-2 rounded-lg border border-orange-100 text-left">
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0 text-orange-500"
            />
            <p>
              <b>Lưu ý:</b> Nếu không thấy thư, hãy kiểm tra kỹ trong thư mục{" "}
              <b>&quot;Tất cả hộp thư&quot;</b> (All Mail) hoặc{" "}
              <b>&quot;Thư rác&quot;</b> (Spam/Junk).
            </p>
          </div>
        </div>

        <div className="text-left mb-6">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 ml-1">
            Góp ý của bạn về bài kiểm tra này hoặc nội dung của parent-online
            hiện tại?
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-3 md:p-4 text-base bg-gray-50 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all h-28 md:h-32 resize-none text-gray-700 placeholder-gray-400"
            placeholder="Chia sẻ cảm nhận của bạn để chúng tôi làm tốt hơn..."
            disabled={isSubmitting}
          ></textarea>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#1877F2] text-white p-3 md:p-4 rounded-xl font-bold text-base md:text-lg hover:bg-[#166fe5] shadow-lg transition-all flex items-center justify-center gap-2 md:gap-3 group"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <span>Gửi & Tham gia Cộng đồng</span>
              <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </>
          )}
        </button>

        <button
          onClick={onRedirect}
          disabled={isSubmitting}
          className="mt-4 text-gray-400 text-xs md:text-sm hover:text-gray-600 underline decoration-gray-300"
        >
          Bỏ qua và đi đến Facebook
        </button>
      </div>
    </div>
  );
}
