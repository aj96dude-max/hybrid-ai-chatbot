import { Platform } from 'react-native';

let storage = null;
if (Platform.OS !== 'web') {
  const { createMMKV } = require('react-native-mmkv');
  storage = createMMKV({
    id: 'chatbot-storage',
  });
}

// Zustand persist middleware requires a specific interface
export const ChatStorageService = {
  setItem: (name, value) => {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(name, value); } catch (e) {}
    } else {
      storage.set(name, value);
    }
  },
  getItem: (name) => {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(name); } catch (e) { return null; }
    } else {
      const value = storage.getString(name);
      return value ?? null;
    }
  },
  removeItem: (name) => {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(name); } catch (e) {}
    } else {
      storage.remove(name);
    }
  },
};
