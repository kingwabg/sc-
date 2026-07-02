/**
 * lib/features/hwp-export/client.ts
 *
 * Phase 1: HTML 파일 다운로드 유틸
 * - BOM(U+FEFF) 추가 → 한글 인코딩 안전
 * - .html 확장자로 다운로드 → 한글(HWP) 에서 "파일 → 열기" 가능
 */

export function downloadHtmlAsFile(filename: string, htmlContent: string): void {
  const blob = new Blob([`\ufeff${htmlContent}`], {
    type: "application/html;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
