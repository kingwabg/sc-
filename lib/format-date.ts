export function formatKoreanDate(d: Date = new Date()): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${String(d.getDate()).padStart(2, "0")}일 ${days[d.getDay()]}요일`;
}
