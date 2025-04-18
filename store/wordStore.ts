import { create } from "zustand";

type WordEntry = {
  word: string;
  createdAt: number;
  context?: string;
  sourceApp?: string;
  sourceUrl?: string;
};

type WordStore = {
  words: WordEntry[];
  setWords: (newWords: WordEntry[]) => void;
  addWord: (entry: WordEntry) => void;
  clearWords: () => void;
};

export const useWordStore = create<WordStore>((set) => ({
  words: [],
  setWords: (newWords) => set({ words: newWords }),
  addWord: (entry) =>
    set((state) => ({ words: [entry, ...state.words] })),
  clearWords: () => set({ words: [] }),
}));