import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import * as SecureStore from 'expo-secure-store';
import { useChatStore } from '../store/useChatStore';
import { COLORS, FONTS } from '../theme/colors';
import SettingsModal from './SettingsModal';

export default function Header() {
  const mode = useChatStore((state) => state.mode);
  const setMode = useChatStore((state) => state.setMode);
  const proApiKey = useChatStore((state) => state.proApiKey);
  const setProApiKey = useChatStore((state) => state.setProApiKey);
  
  const createNewSession = useChatStore((state) => state.createNewSession);
  const chatSessions = useChatStore((state) => state.chatSessions);
  const activeSessionId = useChatStore((state) => state.activeSessionId);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);

  // Hydrate API Key on Mount
  useEffect(() => {
    (async () => {
      const storedKey = await SecureStore.getItemAsync('PRO_API_KEY');
      if (storedKey) {
        setProApiKey(storedKey);
      }
    })();
  }, []);

  const handleToggleMode = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'pro' && !proApiKey) {
      setSettingsVisible(true);
    }
  };

  const loadSession = (sessionId) => {
    useChatStore.setState({ 
      activeSessionId: sessionId,
      messages: chatSessions[sessionId]?.messages || []
    });
    setHistoryVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftAction}>
          <TouchableOpacity onPress={() => setHistoryVisible(true)} activeOpacity={0.6} style={styles.iconButton}>
            <Text style={styles.menuIcon}>≡</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[styles.segment, mode === 'rapid' && styles.segmentActive]} 
            onPress={() => handleToggleMode('rapid')}
            activeOpacity={0.6}
          >
            <Text style={[styles.segmentText, mode === 'rapid' && styles.segmentTextActive]}>Rapid</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={[styles.segment, mode === 'pro' && styles.segmentActive]} 
            onPress={() => handleToggleMode('pro')}
            activeOpacity={0.6}
          >
            <Text style={[styles.segmentText, mode === 'pro' && styles.segmentTextActive]}>Pro</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightAction}>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} activeOpacity={0.6} style={[styles.iconButton, { marginRight: 8 }]}>
            <Text style={styles.iconText}>⚙</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={createNewSession} activeOpacity={0.6} style={styles.iconButton}>
            <Text style={styles.iconText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Modal */}
      <SettingsModal 
        visible={settingsVisible} 
        onClose={() => setSettingsVisible(false)} 
      />

      {/* History Drawer Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={historyVisible}
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Chat History</Text>
            <TouchableOpacity onPress={() => setHistoryVisible(false)}>
              <Text style={styles.historyCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <SwipeListView
            data={Object.values(chatSessions || {}).reverse()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const snippet = item.title ? item.title : (item.messages.length > 0 ? item.messages[0].text.substring(0, 40) + '...' : 'Empty Chat');
              const date = new Date(parseInt(item.id)).toLocaleString();
              const isActive = item.id === activeSessionId;
              
              return (
                <View style={[styles.historyItem, isActive && styles.historyItemActive]}>
                  <TouchableOpacity 
                    style={{ flex: 1 }}
                    onPress={() => loadSession(item.id)}
                    activeOpacity={1}
                  >
                    <Text style={styles.historyItemDate}>{date}</Text>
                    <Text style={styles.historyItemSnippet}>{snippet}</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            renderHiddenItem={({ item }) => (
              <View style={styles.historyHiddenItem}>
                <TouchableOpacity 
                  style={styles.historyDeleteButton}
                  onPress={() => useChatStore.getState().deleteSession(item.id)}
                >
                  <Text style={styles.historyDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            rightOpenValue={-75}
            disableRightSwipe
            ListEmptyComponent={
              <Text style={styles.emptyHistory}>No chat history found.</Text>
            }
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: COLORS.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  leftAction: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightAction: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    width: 200,
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  segmentActive: {
    backgroundColor: '#F3F3F3',
  },
  segmentText: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.textPrimary,
    marginTop: -2,
  },
  menuIcon: {
    fontSize: 22,
    fontWeight: '300',
    color: COLORS.textPrimary,
    marginTop: -4,
  },

  historyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  historyTitle: {
    fontFamily: FONTS.ui,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  historyCloseText: {
    fontFamily: FONTS.ui,
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  historyItemActive: {
    backgroundColor: '#F9F9F9',
  },
  historyItemDate: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  historyItemSnippet: {
    fontFamily: FONTS.ui,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  historyHiddenItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#FF3B30',
  },
  historyDeleteButton: {
    width: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyDeleteText: {
    color: COLORS.background,
    fontFamily: FONTS.ui,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyHistory: {
    padding: 40,
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontFamily: FONTS.ui,
  }
});
