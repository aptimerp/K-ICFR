/** @type {import('next').NextConfig} */
const nextConfig = {
  // docx-preview는 ESM 전용 — webpack이 CJS로 트랜스파일하도록 지정
  transpilePackages: ["docx-preview"],

  webpack: (config) => {
    // react-pdf / pdfjs-dist — canvas npm 패키지 참조 제거
    // (브라우저 환경에서는 DOM Canvas API 직접 사용)
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
