import React, { useRef, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../store/useChatStore';
import MessageItem from './MessageItem';
import { COLORS, FONTS } from '../theme/colors';

export default function ChatList() {
  const messages = useChatStore((state) => state.messages);
  const modelStatus = useChatStore((state) => state.modelStatus);
  const progress = useChatStore((state) => state.downloadProgress);
  const total = useChatStore((state) => state.downloadTotal);
  const flatListRef = useRef(null);

  // Reverse messages for the inverted FlatList to handle native bottom-up scrolling
  const reversedMessages = [...messages].reverse();

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
      
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="chatbubbles" size={70} color="#fff" />
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={reversedMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageItem message={item} />}
          style={styles.list}
          contentContainerStyle={styles.content}
          inverted={true}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
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
