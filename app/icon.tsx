import { ImageResponse } from "next/og";

/**
 * 동적 favicon — app/icon.tsx 는 Next.js App Router의 메타데이터 API가
 * <link rel="icon"> 으로 자동 매핑한다. /favicon.ico 404 해결.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4F46E5",
          color: "#FFFFFF",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          borderRadius: 8,
        }}
      >
        OC
      </div>
    ),
    { ...size },
  );
}
