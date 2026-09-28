import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChatStorageService } from '../services/ChatStorageService';

export const useChatStore = create(
  persist(
    (set) => ({
      mode: 'pro', // 'pro' | 'rapid'
      modelStatus: 'missing', // 'missing' | 'downloading' | 'ready'
      downloadProgress: 0,
      downloadTotal: 0,
      messages: [],
      isTyping: false,
      
      setMode: (mode) => set({ mode }),
      setIsTyping: (isTyping) => set({ isTyping }),
      setModelStatus: (modelStatus) => set({ modelStatus }),
      setDownloadProgress: (progress, total) => set({ downloadProgress: progress, downloadTotal: total }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      
      updateBotMessage: (id, token) => set((state) => ({
        messages: state.messages.map((m) => 
          m.id === id ? { ...m, text: m.text + token } : m
        )
      })),
      
      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: 'hybrid-chat-storage',
      storage: createJSONStorage(() => ChatStorageService),
    }
  )
);
