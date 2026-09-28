import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';

export default function MessageItem({ message }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      <Text style={styles.senderName}>{isUser ? 'User' : 'Assistant'}</Text>
      <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
        {message.text}
      </Text>
    </View>
  );
}

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
  messageText: {
    fontSize: 14,
    lineHeight: 22,
  },
  userText: {
    fontFamily: FONTS.ui,
    color: COLORS.textPrimary,
  },
  botText: {
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  }
});
