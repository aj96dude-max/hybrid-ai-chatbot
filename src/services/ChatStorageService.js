import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'chatbot-storage',
});

// Zustand persist middleware requires a specific interface
export const ChatStorageService = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.remove(name);
  },
};
