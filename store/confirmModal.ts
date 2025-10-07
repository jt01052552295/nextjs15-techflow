import { create } from 'zustand';

interface ConfirmModalState {
  isOpen: boolean;
  message: string;
  title: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;

  showModal: (params: { message: string; title?: string }) => Promise<boolean>;
  closeModal: () => void;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmModalStore = create<ConfirmModalState>((set, get) => ({
  isOpen: false,
  message: '',
  title: '',
  onConfirm: null,
  onCancel: null,

  showModal: ({ message, title }) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        message,
        title,
        onConfirm: () => {
          get().closeModal();
          resolve(true);
        },
        onCancel: () => {
          get().closeModal();
          resolve(false);
        },
      });
    });
  },

  closeModal: () => set({ isOpen: false }),

  handleConfirm: () => {
    const { onConfirm } = get();
    if (onConfirm) onConfirm();
  },

  handleCancel: () => {
    const { onCancel } = get();
    if (onCancel) onCancel();
  },
}));
