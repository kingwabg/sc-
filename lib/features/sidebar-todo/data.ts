import { readLS, writeLS } from "@/lib/store/_ls";

const STORAGE_KEY = "ox:sidebar-todos";

export function getTodos(): import("./types").TodoItem[] {
  return readLS<import("./types").TodoItem[]>(STORAGE_KEY, []);
}

export function saveTodos(items: import("./types").TodoItem[]): void {
  writeLS(STORAGE_KEY, items);
}
