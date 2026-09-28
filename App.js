import React from 'react';
import { SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Header from './src/components/Header';
import ChatList from './src/components/ChatList';
import InputBar from './src/components/InputBar';
import { useChatStore } from './src/store/useChatStore';
import { COLORS } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header />
        <ChatList />
        <InputBar />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  }
});
