/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
// import LandingView from '@/components/LandingView'; // Đã xóa LandingView
import RegisterForm from "@/components/RegisterForm";
import QuizView from "@/components/QuizView";
import ResultView from "@/components/ResultView";
import FeedbackView from "@/components/FeedbackView";
import { UserData } from "@/types";

// Loại bỏ 'landing' khỏi danh sách trạng thái
type ViewState = "register" | "quiz" | "result" | "feedback";

const FACEBOOK_URL = "https://www.facebook.com/lhub304";
const STORAGE_KEY = "parent_online_session";

export default function Home() {
  // Đặt mặc định là 'register' thay vì 'landing'
  const [view, setView] = useState<ViewState>("register");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [result, setResult] = useState<{
    score: number;
    duration: number;
  } | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // 1. Khôi phục trạng thái khi F5
  useEffect(() => {
    const restoreSession = () => {
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          // Chỉ khôi phục nếu session hợp lệ và có userData
          if (session && session.userData) {
            setUserData(session.userData);
            if (session.result) setResult(session.result);
            // Nếu session cũ đang ở landing (từ bản cũ), ép về register
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

  // Hàm helper để lưu session
  const updateSession = (updates: any) => {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const newSession = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    } catch (error) {
      console.error("Lỗi lưu session:", error);
    }
  };

  // Xóa hàm handleStart vì không còn dùng LandingPage

  const handleRegisterSubmit = (data: UserData) => {
    setUserData(data);
    setView("quiz");
    // Bắt đầu session mới
    updateSession({ userData: data, view: "quiz", startTime: Date.now() });
  };

  const handleQuizFinish = (score: number, duration: number) => {
    const res = { score, duration };
    setResult(res);
    setView("result");
    updateSession({ view: "result", result: res });
  };

  const handleRetest = () => {
    setResult(null);
    setView("quiz");
    // Reset phần quiz trong session nhưng giữ userData
    updateSession({ view: "quiz", result: null, quizState: null });
  };

  const handleComplete = () => {
    setView("feedback");
    updateSession({ view: "feedback" });
  };

  const handleRedirectFacebook = () => {
    // Xóa session khi hoàn thành hẳn
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = FACEBOOK_URL;
  };

  if (isRestoring) return null;

  return (
    <main className="min-h-screen font-[family-name:var(--font-inter)]">
      {/* Đã xóa LandingView, vào thẳng RegisterForm */}

      {view === "register" && <RegisterForm onSubmit={handleRegisterSubmit} />}

      {view === "quiz" && userData && (
        <QuizView
          key="quiz-view"
          userData={userData}
          onFinish={handleQuizFinish}
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
