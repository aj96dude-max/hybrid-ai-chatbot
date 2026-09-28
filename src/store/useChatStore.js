import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChatStorageService } from '../services/ChatStorageService';

export const useChatStore = create(
  persist(
    (set, get) => ({
      mode: 'rapid', // 'pro' | 'rapid'
      proApiKey: null, 
      
      modelStatus: 'missing',
      downloadProgress: 0,
      downloadTotal: 0,
      
      activeSessionId: Date.now().toString(),
      chatSessions: {}, // { [sessionId]: { id, messages: [] } }
      
      messages: [], // Active messages for UI
      isTyping: false,
      
      setMode: (mode) => set({ mode }),
      setProApiKey: (key) => set({ proApiKey: key }),
      setIsTyping: (isTyping) => set({ isTyping }),
      setModelStatus: (modelStatus) => set({ modelStatus }),
      setDownloadProgress: (progress, total) => set({ downloadProgress: progress, downloadTotal: total }),
      
      createNewSession: () => set((state) => {
        // Save current messages to the current session before creating a new one
        const currentSessions = {
          ...state.chatSessions,
          [state.activeSessionId]: { id: state.activeSessionId, messages: state.messages }
        };
        const newId = Date.now().toString();
        
        return {
          chatSessions: currentSessions,
          activeSessionId: newId,
          messages: [] // Clear active messages for the new chat
        };
      }),

      addMessage: (message) => set((state) => {
        const updatedMessages = [...state.messages, message];
        return {
          messages: updatedMessages,
          chatSessions: {
            ...state.chatSessions,
            [state.activeSessionId]: { id: state.activeSessionId, messages: updatedMessages }
          }
        };
      }),
      
      updateBotMessage: (id, token) => set((state) => {
        const updatedMessages = state.messages.map((m) => 
          m.id === id ? { ...m, text: m.text + token } : m
        );
        return {
          messages: updatedMessages,
          chatSessions: {
            ...state.chatSessions,
            [state.activeSessionId]: { id: state.activeSessionId, messages: updatedMessages }
          }
        };
      }),
      
      clearHistory: () => set((state) => ({ 
        messages: [],
        chatSessions: {
          ...state.chatSessions,
          [state.activeSessionId]: { id: state.activeSessionId, messages: [] }
        }
      })),
    }),
    {
      name: 'hybrid-chat-storage-v3', // bumped version to avoid hydration conflicts
      storage: createJSONStorage(() => ChatStorageService),
      partialize: (state) => ({
        chatSessions: state.chatSessions,
        activeSessionId: state.activeSessionId,
        messages: state.messages,
        mode: state.mode
      }),
    }
  )
);
