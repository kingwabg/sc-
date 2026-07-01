import type { TodoItem } from "./types";

/**
 * 배열에서 oldIndex 요소를 newIndex 위치로 이동한 새 배열을 반환합니다.
 */
export function reorderTodos(items: TodoItem[], oldIndex: number, newIndex: number): TodoItem[] {
  const result = [...items];
  const [removed] = result.splice(oldIndex, 1);
  result.splice(newIndex, 0, removed);
  return result;
}
