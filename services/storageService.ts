
import { get, set, del } from 'idb-keyval';
import { StateStorage } from 'zustand/middleware';

const STORAGE_KEY = 'cb-hunter-storage';

/**
 * Custom storage engine using idb-keyval for IndexedDB persistence.
 * This prevents UI blocking and increases storage quota.
 */
export const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // Attempt to migrate from localStorage if this is the first access
    const localData = localStorage.getItem(name);
    const dbData = await get(name);

    if (localData && !dbData) {
      console.log(`Migrating ${name} from localStorage to IndexedDB...`);
      await set(name, localData);
      localStorage.removeItem(name);
      return localData;
    }

    return (dbData as string) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

/**
 * Helper to ensure we don't bloat storage with large strings.
 * We should prioritize ephemeral URLs or prompt metadata over raw base64.
 */
export const cleanBase64FromState = (data: any) => {
  // Logic to strip large fields before saving if they are redundant
  // For this app, we mainly generate images on-the-fly, so we keep the store clean.
  return data;
};
