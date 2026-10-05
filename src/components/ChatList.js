import React, { useRef, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useChatStore } from '../store/useChatStore';
import MessageItem from './MessageItem';
import { COLORS, FONTS } from '../theme/colors';

export default function ChatList() {
  const messages = useChatStore((state) => state.messages);
  const modelStatus = useChatStore((state) => state.modelStatus);
  const progress = useChatStore((state) => state.downloadProgress);
  const total = useChatStore((state) => state.downloadTotal);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      // Small timeout to allow layout calculation
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, messages[messages.length - 1]?.text.length]);

  const renderDownloadBanner = () => {
    if (modelStatus !== 'downloading') return null;
    
    const percent = total > 0 ? (progress / total) * 100 : 0;
    
    return (
      <View style={styles.bannerContainer}>
        <Text style={styles.bannerText}>
          Downloading Local Engine... [{progress} / {total} bytes]
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderDownloadBanner()}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageItem message={item} />}
        style={styles.list}
        contentContainerStyle={styles.content}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  bannerContainer: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: '#F9F9F9',
  },
  bannerText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  }
});
