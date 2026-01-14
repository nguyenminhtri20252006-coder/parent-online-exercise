import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Cấu hình font Inter với hỗ trợ tiếng Việt
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Parent Online - Hệ Thống Kiểm Tra",
  description: "Hệ thống kiểm tra kiến thức dành cho phụ huynh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
