// File: src/components/GuideView.tsx
"use client"; // Thêm dòng này để định nghĩa rõ đây là Client Component

import React from "react";
import { Ear, CheckCircle2, Trophy, ArrowRight } from "lucide-react";

interface Props {
  onStart: () => void;
}

const GuideView = ({ onStart }: Props) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 animate-fade-in-up">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-black text-blue-700 mb-6 text-center uppercase">
          Hướng dẫn làm bài
        </h2>

        <div className="space-y-6 mb-8">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="bg-white p-2 rounded-full shadow-sm text-blue-600">
              <Ear size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">1. Nghe & Đọc</h3>
              <p className="text-sm text-gray-600">
                Nghe phát âm và đọc câu ví dụ chứa từ vựng.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="bg-white p-2 rounded-full shadow-sm text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">2. Chọn đáp án</h3>
              <p className="text-sm text-gray-600">
                Chọn nghĩa tiếng Việt chính xác nhất của từ đó.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="bg-white p-2 rounded-full shadow-sm text-orange-600">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">3. Đua top</h3>
              <p className="text-sm text-gray-600">
                Hoàn thành thật nhanh để đứng đầu bảng xếp hạng.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-black text-lg hover:bg-blue-700 shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
          <span>Đã hiểu, Bắt đầu ngay</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default GuideView;
