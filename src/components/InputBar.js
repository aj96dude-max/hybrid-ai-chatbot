import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useChatStore } from '../store/useChatStore';
import { HybridRouterService } from '../services/HybridRouterService';
import { COLORS, FONTS } from '../theme/colors';

export default function InputBar() {
  const [text, setText] = useState('');
  const isTyping = useChatStore((state) => state.isTyping);

  const handleSend = async () => {
    if (text.trim() === '' || isTyping) return;
    const prompt = text;
    setText('');
    await HybridRouterService.submitPrompt(prompt);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Ask anything..."
        placeholderTextColor={COLORS.textSecondary}
        multiline
        editable={!isTyping}
      />
      <TouchableOpacity 
        style={[styles.sendButton, isTyping && styles.sendButtonDisabled]} 
        onPress={handleSend}
        activeOpacity={0.7}
        disabled={isTyping}
      >
        {isTyping ? (
          <ActivityIndicator color={COLORS.background} size="small" />
        ) : (
          <Text style={styles.sendIcon}>↑</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    fontFamily: FONTS.ui,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 4,
    backgroundColor: COLORS.background,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendIcon: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.ui,
  }
});
