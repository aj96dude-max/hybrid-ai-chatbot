import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChatStorageService } from '../services/ChatStorageService';

export const useChatStore = create(
  persist(
    (set, get) => ({
      mode: 'rapid', // 'pro' | 'rapid'
      systemPrompt: 'You are a helpful, smart, kind, and efficient AI assistant. You always fulfill the user\'s requests to the best of your ability.',
      
      modelStatus: 'missing',
      downloadProgress: 0,
      downloadTotal: 0,
      
      activeSessionId: Date.now().toString(),
      chatSessions: {}, // { [sessionId]: { id, messages: [] } }
      
      messages: [], // Active messages for UI
      isTyping: false,
      
      setMode: (mode) => set({ mode }),
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      setIsTyping: (isTyping) => set({ isTyping }),
      setModelStatus: (modelStatus) => set({ modelStatus }),
      setDownloadProgress: (progress, total) => set({ downloadProgress: progress, downloadTotal: total }),
      
      createNewSession: () => set((state) => {
        // Save current messages to the current session before creating a new one
        const currentSessions = {
          ...state.chatSessions,
          [state.activeSessionId]: { 
            ...state.chatSessions[state.activeSessionId],
            id: state.activeSessionId, 
            messages: state.messages 
          }
        };
        const newId = Date.now().toString();
        const initialMessage = {
          id: `msg-${newId}`,
          role: 'bot',
          text: 'Hello! I am your support assistant. How can I help you today?'
        };
        
        return {
          chatSessions: {
            ...currentSessions,
            [newId]: { id: newId, title: `Ticket #${newId.slice(-4)}`, messages: [initialMessage] }
          },
          activeSessionId: newId,
          messages: [initialMessage] // Set initial active message
        };
      }),

      renameSession: (sessionId, newTitle) => set((state) => {
        const session = state.chatSessions[sessionId];
        if (!session) return state;
        
        return {
          chatSessions: {
            ...state.chatSessions,
            [sessionId]: { ...session, title: newTitle }
          }
        };
      }),

      addMessage: (message) => set((state) => {
        const updatedMessages = [...state.messages, message];
        return {
          messages: updatedMessages,
          chatSessions: {
            ...state.chatSessions,
            [state.activeSessionId]: { 
              ...state.chatSessions[state.activeSessionId],
              id: state.activeSessionId, 
              messages: updatedMessages 
            }
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
            [state.activeSessionId]: { 
              ...state.chatSessions[state.activeSessionId],
              id: state.activeSessionId, 
              messages: updatedMessages 
            }
          }
        };
      }),

      setBotMessageError: (id, errorMsg) => set((state) => {
        const updatedMessages = state.messages.map((m) =>
          m.id === id ? { ...m, text: m.text + '\n' + errorMsg, error: true } : m
        );
        return {
          messages: updatedMessages,
          chatSessions: {
            ...state.chatSessions,
            [state.activeSessionId]: { 
              ...state.chatSessions[state.activeSessionId],
              id: state.activeSessionId, 
              messages: updatedMessages 
            }
          }
        };
      }),

      popMessages: (count) => set((state) => {
        const updatedMessages = state.messages.slice(0, state.messages.length - count);
        return {
          messages: updatedMessages,
          chatSessions: {
            ...state.chatSessions,
            [state.activeSessionId]: { 
              ...state.chatSessions[state.activeSessionId],
              id: state.activeSessionId, 
              messages: updatedMessages 
            }
          }
        };
      }),
      
      clearHistory: () => set((state) => {
        const newId = Date.now().toString();
        const initialMessage = {
          id: `msg-${newId}`,
          role: 'bot',
          text: 'Hello! I am your support assistant. How can I help you today?'
        };
        
        return {
          messages: [initialMessage],
          chatSessions: {
            ...state.chatSessions,
            [state.activeSessionId]: { id: state.activeSessionId, title: `Ticket #${newId.slice(-4)}`, messages: [initialMessage] }
          }
        };
      }),
      
      deleteSession: (sessionId) => set((state) => {
        const newSessions = { ...state.chatSessions };
        delete newSessions[sessionId];
        
        let newActiveId = state.activeSessionId;
        let newMessages = state.messages;
        
        if (sessionId === state.activeSessionId) {
          newActiveId = Date.now().toString();
          const initialMessage = {
            id: `msg-${newActiveId}`,
            role: 'bot',
            text: 'Hello! I am your support assistant. How can I help you today?'
          };
          newMessages = [initialMessage];
          newSessions[newActiveId] = { id: newActiveId, title: `Ticket #${newActiveId.slice(-4)}`, messages: [initialMessage] };
        }
        
        return {
          chatSessions: newSessions,
          activeSessionId: newActiveId,
          messages: newMessages
        };
      }),
    }),
    {
      name: 'hybrid-chat-storage-v4', // bumped version to force initialization of greeting message
      storage: createJSONStorage(() => ChatStorageService),
      partialize: (state) => ({
        chatSessions: state.chatSessions,
        activeSessionId: state.activeSessionId,
        messages: state.messages,
        mode: state.mode,
        systemPrompt: state.systemPrompt
      }),
    }
  )
);
