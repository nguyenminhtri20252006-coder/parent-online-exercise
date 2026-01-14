/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import RegisterForm from "@/components/RegisterForm";
import GuideView from "@/components/GuideView";
import QuizView from "@/components/QuizView";
import ResultView from "@/components/ResultView";
import FeedbackView from "@/components/FeedbackView";
import { UserData, Question } from "@/types";

type ViewState = "register" | "guide" | "quiz" | "result" | "feedback";

const FACEBOOK_URL = "https://www.facebook.com/lhub304";
const STORAGE_KEY = "parent_online_session";

export default function Home() {
  const [view, setView] = useState<ViewState>("register");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [result, setResult] = useState<{
    score: number;
    duration: number;
  } | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // State lưu câu hỏi đã tải trước
  const [prefetchedQuestions, setPrefetchedQuestions] = useState<Question[]>(
    [],
  );

  // 1. Khôi phục trạng thái phiên làm việc cũ
  useEffect(() => {
    const restoreSession = () => {
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session && session.userData) {
            setUserData(session.userData);
            if (session.result) setResult(session.result);
            if (session.view && session.view !== "landing") {
              setView(session.view);
            }
          }
        } catch (e) {
          console.error("Lỗi khôi phục session:", e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsRestoring(false);
    };
    restoreSession();
  }, []);

  // 2. Tải trước câu hỏi NGAY KHI VÀO TRANG (Background Fetch)
  useEffect(() => {
    const prefetchData = async () => {
      // Nếu đã có dữ liệu rồi thì thôi không tải lại (tránh spam request khi re-render)
      if (prefetchedQuestions.length > 0) return;

      try {
        console.log("🚀 Bắt đầu tải câu hỏi ngầm ngay khi vào trang...");
        const res = await fetch("/api/questions");
        const json = await res.json();
        if (json.status === "success") {
          setPrefetchedQuestions(json.data);
          console.log("✅ Đã tải xong câu hỏi ngầm!");
        }
      } catch (e) {
        console.error("❌ Lỗi prefetch:", e);
      }
    };

    prefetchData();
  }, []); // Chỉ chạy 1 lần khi component mount

  const updateSession = (updates: any) => {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const newSession = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    } catch (error) {
      console.error("Lỗi lưu session:", error);
    }
  };

  const handleRegisterSubmit = (data: UserData) => {
    setUserData(data);
    setView("guide");
    updateSession({ userData: data, view: "guide" });

    // Không cần gọi prefetch ở đây nữa vì đã gọi ngay từ đầu
  };

  const handleGuideFinish = () => {
    setView("quiz");
    updateSession({ view: "quiz", startTime: Date.now() });
  };

  const handleQuizFinish = (score: number, duration: number) => {
    const res = { score, duration };
    setResult(res);
    setView("result");
    updateSession({ view: "result", result: res });
  };

  const handleRetest = () => {
    setResult(null);
    // Khi làm lại, có thể muốn lấy bộ đề mới.
    // Reset state prefetch để QuizView tự fetch lại hoặc giữ nguyên nếu muốn đề cũ.
    // Ở đây ta clear để QuizView tự xử lý logic fetch mới nếu cần.
    setPrefetchedQuestions([]);

    setView("quiz");
    updateSession({ view: "quiz", result: null, quizState: null });
  };

  const handleComplete = () => {
    setView("feedback");
    updateSession({ view: "feedback" });
  };

  const handleRedirectFacebook = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = FACEBOOK_URL;
  };

  if (isRestoring) return null;

  return (
    <main className="min-h-screen font-[family-name:var(--font-inter)]">
      {view === "register" && <RegisterForm onSubmit={handleRegisterSubmit} />}

      {view === "guide" && <GuideView onStart={handleGuideFinish} />}

      {view === "quiz" && userData && (
        <QuizView
          key="quiz-view"
          userData={userData}
          onFinish={handleQuizFinish}
          prefetchedQuestions={prefetchedQuestions} // Truyền dữ liệu đã tải xuống
        />
      )}

      {view === "result" && userData && result && (
        <ResultView
          userData={userData}
          result={result}
          onRetest={handleRetest}
          onComplete={handleComplete}
        />
      )}

      {view === "feedback" && userData && (
        <FeedbackView userData={userData} onRedirect={handleRedirectFacebook} />
      )}
    </main>
  );
}
