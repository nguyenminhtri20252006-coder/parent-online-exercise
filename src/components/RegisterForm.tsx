// File: src/components/RegisterForm.tsx
import React, { useState } from "react";
import { UserData } from "@/types";

interface Props {
  onSubmit: (data: UserData) => void;
}

export default function RegisterForm({ onSubmit }: Props) {
  const [formData, setFormData] = useState<UserData>({
    name: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10,11}$/;
    return phoneRegex.test(phone);
  };

  const processEmail = (inputEmail: string) => {
    let email = inputEmail.trim();
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      if (!email.includes("@")) {
        email += "@gmail.com";
      }
    }
    return email;
  };

  const handleSubmit = async () => {
    setError("");

    if (!formData.name.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError("Số điện thoại phải là chuỗi số từ 10 đến 11 số.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }

    setIsSubmitting(true);

    // Giả lập delay nhẹ để hiệu ứng loading mượt mà hơn (UX)
    setTimeout(() => {
      const finalEmail = processEmail(formData.email);
      const finalData = { ...formData, email: finalEmail };
      onSubmit(finalData);
      setIsSubmitting(false);
    }, 500);
  };

  // Mobile: text-base (16px), p-3. Desktop: text-lg, p-4.
  const inputClass =
    "w-full p-3 md:p-4 text-base md:text-lg bg-white border-2 border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-500 text-gray-900 font-medium shadow-sm";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gray-100">
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl w-full max-w-lg border border-gray-200">
        {/* Header với Logo và Title */}
        <div className="flex flex-col items-center mb-8">
          {/* Avatar tròn */}
          <div className="w-24 h-24 rounded-full shadow-lg border-4 border-white overflow-hidden mb-4">
            <img
              src="/logo.png"
              alt="Parent Online Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-blue-700 mb-2 text-center uppercase tracking-tight">
            BÀI KIỂM TRA NGÀY 15/1
          </h2>

          {/* Highlight chữ Parent Online */}
          <div className="bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
            <p className="text-center text-blue-600 font-black uppercase tracking-widest text-sm">
              PARENT ONLINE
            </p>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="space-y-1 md:space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide ml-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={inputClass}
              placeholder="Nhập họ tên của bạn..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide ml-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, phone: val });
              }}
              className={inputClass}
              placeholder="0912..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide ml-1">
              Email Google
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={inputClass}
              placeholder="username (@gmail.com)"
              disabled={isSubmitting}
            />
            <div className="flex gap-2 items-start mt-2 px-1 bg-blue-50 p-2 md:p-3 rounded-lg border border-blue-100">
              <span className="text-blue-600 mt-0.5 text-xs md:text-sm">
                ℹ️
              </span>
              <p className="text-xs md:text-sm text-blue-800 font-medium leading-snug">
                Kết quả bài kiểm tra sẽ được gửi về địa chỉ này.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 text-sm md:text-base rounded-xl font-bold flex items-center gap-2">
              ⚠️ <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 md:p-5 rounded-xl font-black text-lg md:text-xl hover:from-blue-700 hover:to-blue-800 transition-all mt-4 uppercase shadow-lg hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              "Bắt đầu kiểm tra"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
