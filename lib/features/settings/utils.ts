import type { SettingGroup } from "./types";
import { SETTING_GROUPS } from "./data";

export function getGroupById(id: string): SettingGroup | undefined {
  return SETTING_GROUPS.find((g) => g.id === id);
}

export function getItemById(groupId: string, itemId: string) {
  const group = getGroupById(groupId);
  const item = group?.items.find((i) => i.id === itemId);
  return { group, item };
}
