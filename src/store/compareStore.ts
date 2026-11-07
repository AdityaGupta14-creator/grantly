import { create } from 'zustand';

export const MAX_COMPARE_ITEMS = 3;

interface CompareState {
  selectedIds: string[];
  toggleCompare: (scholarshipId: string) => 'added' | 'removed' | 'full';
  removeCompare: (scholarshipId: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()((set, get) => ({
  selectedIds: [],
  toggleCompare: (scholarshipId) => {
    const { selectedIds } = get();
    if (selectedIds.includes(scholarshipId)) {
      set({ selectedIds: selectedIds.filter((id) => id !== scholarshipId) });
      return 'removed';
    }
    if (selectedIds.length >= MAX_COMPARE_ITEMS) return 'full';
    set({ selectedIds: [...selectedIds, scholarshipId] });
    return 'added';
  },
  removeCompare: (scholarshipId) => set((state) => ({ selectedIds: state.selectedIds.filter((id) => id !== scholarshipId) })),
  clearCompare: () => set({ selectedIds: [] }),
}));
