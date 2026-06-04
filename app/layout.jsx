import "./globals.css";

export const metadata = {
  title: "Smart-ICM | 금강공업 내부회계관리시스템",
  description: "금강공업 내부회계관리시스템 — ERP 연동 자동화",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
