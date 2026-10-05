import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../store/useChatStore';
import { HybridRouterService } from '../services/HybridRouterService';
import { COLORS, FONTS } from '../theme/colors';

const SUGGESTIONS = [
  { id: '1', text: '🤔 What is GPT-4 ?' },
  { id: '2', text: '💰 Pricing' },
  { id: '3', text: '🙋 FAQ' },
  { id: '4', text: '💡 Tips & Tricks' }
];

export default function InputBar() {
  const [text, setText] = useState('');
  const isTyping = useChatStore((state) => state.isTyping);

  const handleSend = async () => {
    if (text.trim() === '' || isTyping) return;
    const prompt = text;
    setText('');
    await HybridRouterService.submitPrompt(prompt);
  };

  const handleStop = () => {
    HybridRouterService.abortGeneration();
  };

  const handleSuggestion = async (suggestion) => {
    if (isTyping) return;
    const prompt = suggestion.replace(/[🤔💰🙋💡]/g, '').trim();
    await HybridRouterService.submitPrompt(prompt);
  };

  return (
    <View style={styles.wrapper}>
      {/* Suggestions Row */}
      {!isTyping && (
        <View style={styles.suggestionsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsContainer}>
            {SUGGESTIONS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.suggestionChip} onPress={() => handleSuggestion(item.text)}>
                <Text style={styles.suggestionText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Row */}
      <View style={styles.container}>
        <TouchableOpacity style={styles.plusButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="🤔 What is ChatGPT ?"
            placeholderTextColor="#888"
            multiline
            editable={!isTyping}
          />
          <TouchableOpacity style={styles.micButton}>
            <Ionicons name="mic-outline" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {isTyping ? (
          <TouchableOpacity style={styles.stopButton} onPress={handleStop} activeOpacity={0.7}>
            <View style={styles.stopIcon} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.sendButton, text.trim() === '' && styles.sendButtonDisabled]} 
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={text.trim() === ''}
          >
            <Ionicons name="send" size={16} color={text.trim() === '' ? "#888" : "#fff"} style={{ marginLeft: 2, marginTop: 2 }} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  suggestionsWrapper: {
    paddingVertical: 10,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  suggestionText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.ui,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center', // Changed to center instead of flex-end to align circular buttons perfectly
    paddingTop: 4,
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    backgroundColor: '#fff',
    minHeight: 44,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    fontFamily: FONTS.ui,
    fontSize: 15,
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
  },
  micButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#374151',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  stopButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#FEE2E2', // Light red for visual stopping
    borderRadius: 20,
  },
  stopIcon: {
    width: 12,
    height: 12,
    backgroundColor: '#EF4444',
    borderRadius: 2,
  }
});
