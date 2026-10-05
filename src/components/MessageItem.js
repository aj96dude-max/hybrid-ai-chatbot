import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Markdown from 'react-native-markdown-display';
import { COLORS, FONTS } from '../theme/colors';
import { HybridRouterService } from '../services/HybridRouterService';

export default function MessageItem({ message }) {
  const isUser = message.role === 'user';

  const handleCopyMessage = async () => {
    await Clipboard.setStringAsync(message.text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRetry = () => {
    HybridRouterService.retryPrompt();
  };

  const rules = {
    fence: (node, children, parent, styles) => {
      const codeContent = node.content;
      const handleCopyCode = async () => {
        await Clipboard.setStringAsync(codeContent);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      };

      return (
        <View key={node.key} style={styles.codeBlockContainer}>
          <View style={styles.codeHeader}>
            <Text style={styles.codeLanguage}>{node.sourceInfo || 'code'}</Text>
            <TouchableOpacity onPress={handleCopyCode} style={styles.copyCodeButton}>
              <Text style={styles.copyCodeText}>Copy Code</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.codeContentContainer}>
            <Text style={styles.codeText}>{codeContent}</Text>
          </View>
        </View>
      );
    },
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      <Text style={styles.senderName}>{isUser ? 'User' : 'Assistant'}</Text>
      
      {isUser ? (
        <Text style={styles.userText}>{message.text}</Text>
      ) : (
        <View>
          <Markdown style={markdownStyles} rules={rules}>
            {message.text}
          </Markdown>
          <View style={styles.botActions}>
            <TouchableOpacity onPress={handleCopyMessage} style={styles.copyMessageButton}>
              <Text style={styles.copyMessageText}>Copy</Text>
            </TouchableOpacity>
            
            {message.error && (
              <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                <Text style={styles.retryText}>Tap to Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.ui,
    fontSize: 14,
    lineHeight: 22,
  },
  code_inline: {
    fontFamily: FONTS.mono,
    backgroundColor: COLORS.border,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  codeBlockContainer: {
    backgroundColor: '#000000',
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222222',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  codeLanguage: {
    color: '#FFFFFF',
    fontFamily: FONTS.mono,
    fontSize: 12,
  },
  copyCodeButton: {
    padding: 4,
  },
  copyCodeText: {
    color: '#E5E5E5',
    fontFamily: FONTS.ui,
    fontSize: 12,
  },
  codeContentContainer: {
    padding: 12,
  },
  codeText: {
    color: '#FFFFFF',
    fontFamily: FONTS.mono,
    fontSize: 14,
  },
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  userContainer: {
    backgroundColor: COLORS.userMessageBg,
  },
  botContainer: {
    backgroundColor: COLORS.botMessageBg,
  },
  senderName: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  userText: {
    fontFamily: FONTS.ui,
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  copyMessageButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginRight: 8,
  },
  copyMessageText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  botActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  retryButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#FFEBEB',
    backgroundColor: '#FFF5F5',
    borderRadius: 4,
  },
  retryText: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    color: '#E53E3E',
  },
});
