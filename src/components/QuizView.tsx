/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/components/QuizView.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Question, UserData } from "@/types";
import { Volume2 } from "lucide-react";

interface Props {
  userData: UserData;
  onFinish: (score: number, duration: number) => void;
  prefetchedQuestions?: Question[];
}

const STORAGE_KEY = "parent_online_session";

export default function QuizView({
  userData,
  onFinish,
  prefetchedQuestions,
}: Props) {
  // 1. State & Refs
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchedRef = useRef(false);

  // 2. Helper Functions
  const saveProgress = useCallback(
    (newState: any) => {
      const currentSession = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}",
      );
      const quizState = {
        questions: newState.questions || questions,
        currentIndex:
          newState.currentIndex !== undefined
            ? newState.currentIndex
            : currentIndex,
        correctCount:
          newState.correctCount !== undefined
            ? newState.correctCount
            : correctCount,
        timer: newState.timer !== undefined ? newState.timer : timer,
      };
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...currentSession, quizState }),
      );
    },
    [questions, currentIndex, correctCount, timer],
  );

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback(() => {
    stopTimer(); // Clear timer cũ nếu có để tránh trùng lặp
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        const newTime = prev + 1;
        // Lưu timer mỗi 5 giây
        if (newTime % 5 === 0) {
          const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
          if (s.quizState) {
            s.quizState.timer = newTime;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
          }
        }
        return newTime;
      });
    }, 1000);
  }, [stopTimer]);

  const playAudio = (url: string) => {
    if (!url) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => console.log("Audio autoplay blocked:", err));
    }
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption) return;

    setSelectedOption(option);
    const currentQ = questions[currentIndex];
    const correct = option === currentQ.meaning;

    setIsCorrect(correct);
    const newCorrectCount = correct ? correctCount + 1 : correctCount;
    if (correct) setCorrectCount(newCorrectCount);

    saveProgress({ correctCount: newCorrectCount });

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setSelectedOption(null);
        setIsCorrect(null);
        saveProgress({
          currentIndex: nextIndex,
          correctCount: newCorrectCount,
        });
      } else {
        stopTimer();
        const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        delete s.quizState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        const finalScore = Number(
          ((newCorrectCount / questions.length) * 10).toFixed(1),
        );
        onFinish(finalScore, timer);
      }
    }, 1000);
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  // 3. Effects

  // Effect quản lý Timer riêng biệt: Tự động chạy khi hết Loading
  useEffect(() => {
    if (!loading) {
      startTimer();
    }
    return () => stopTimer();
  }, [loading, startTimer, stopTimer]);

  // Effect khởi tạo dữ liệu
  useEffect(() => {
    if (fetchedRef.current) return;

    const initQuiz = async () => {
      fetchedRef.current = true;

      // A. Khôi phục từ LocalStorage
      const savedSession = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}",
      );
      if (
        savedSession.quizState &&
        savedSession.quizState.questions?.length > 0
      ) {
        const qs = savedSession.quizState;
        setQuestions(qs.questions);
        setCurrentIndex(qs.currentIndex || 0);
        setCorrectCount(qs.correctCount || 0);
        setTimer(qs.timer || 0);
        setLoading(false);
        // Không gọi startTimer() ở đây nữa, để useEffect ở trên tự lo
        return;
      }

      // B. Sử dụng dữ liệu đã Prefetch
      if (prefetchedQuestions && prefetchedQuestions.length > 0) {
        setQuestions(prefetchedQuestions);
        setLoading(false);
        saveProgress({
          questions: prefetchedQuestions,
          currentIndex: 0,
          correctCount: 0,
          timer: 0,
        });
        return;
      }

      // C. Fetch trực tiếp (Fallback)
      try {
        const res = await fetch("/api/questions");
        const json = await res.json();
        if (json.status === "success" && json.data.length > 0) {
          const newQuestions = json.data;
          setQuestions(newQuestions);
          setLoading(false);
          saveProgress({
            questions: newQuestions,
            currentIndex: 0,
            correctCount: 0,
            timer: 0,
          });
        } else {
          alert("Lỗi tải câu hỏi: " + (json.message || "Dữ liệu rỗng"));
        }
      } catch (e) {
        console.error(e);
        alert("Không thể kết nối đến máy chủ.");
      }
    };

    initQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  useEffect(() => {
    if (!loading && questions.length > 0 && questions[currentIndex]) {
      playAudio(questions[currentIndex].audioUrl);
    }
  }, [currentIndex, loading, questions]);

  // 4. Render
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Đang tải đề thi...
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0) return null;

  const question = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6 pt-2">
          <div className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-blue-600 shadow-sm border border-blue-100 text-sm md:text-base">
            Câu {currentIndex + 1}/{questions.length}
          </div>
          <div className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full font-mono font-bold text-orange-500 shadow-sm border border-orange-100 text-sm md:text-base">
            {formatTime(timer)}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg flex flex-col items-center justify-center mb-6 border border-gray-100 relative min-h-[180px] md:min-h-[200px]">
          <button
            onClick={() => playAudio(question.audioUrl)}
            className="absolute top-3 right-3 md:top-4 md:right-4 bg-blue-50 p-2 md:p-3 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Volume2 size={20} className="md:w-6 md:h-6" />
          </button>

          <p className="text-lg md:text-xl text-center leading-relaxed font-medium text-gray-700 mt-4 px-2">
            {question.sentence
              .split(new RegExp(`(${question.word})`, "gi"))
              .map((part, i) =>
                part.toLowerCase() === question.word.toLowerCase() ? (
                  <span
                    key={i}
                    className="bg-yellow-300 px-1 rounded text-blue-800"
                  >
                    {part}
                  </span>
                ) : (
                  part
                ),
              )}
          </p>
        </div>

        <div className="grid gap-3 mb-8">
          {question.options.map((opt, idx) => {
            let btnClass =
              "w-full p-4 md:p-5 text-left border-2 rounded-2xl font-semibold text-base md:text-lg shadow-sm transition-all ";

            if (selectedOption) {
              if (opt === question.meaning) {
                btnClass += "bg-green-500 border-green-600 text-white";
              } else if (opt === selectedOption && !isCorrect) {
                btnClass += "bg-red-500 border-red-600 text-white";
              } else {
                btnClass += "bg-white border-gray-100 text-gray-400 opacity-50";
              }
            } else {
              btnClass +=
                "bg-white border-gray-100 text-gray-700 hover:border-blue-400 hover:shadow-md active:bg-blue-50";
            }

            return (
              <button
                key={idx}
                disabled={!!selectedOption}
                onClick={() => handleOptionClick(opt)}
                className={btnClass}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
