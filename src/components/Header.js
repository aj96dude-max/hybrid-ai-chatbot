import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, FlatList } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import { useChatStore } from '../store/useChatStore';
import { COLORS, FONTS } from '../theme/colors';

export default function Header() {
  const mode = useChatStore((state) => state.mode);
  const setMode = useChatStore((state) => state.setMode);
  const proApiKey = useChatStore((state) => state.proApiKey);
  const setProApiKey = useChatStore((state) => state.setProApiKey);
  
  const createNewSession = useChatStore((state) => state.createNewSession);
  const chatSessions = useChatStore((state) => state.chatSessions);
  const activeSessionId = useChatStore((state) => state.activeSessionId);

  const [modalVisible, setModalVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [tempKey, setTempKey] = useState('');

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
      setModalVisible(true);
    }
  };

  const saveApiKey = async () => {
    if (tempKey.trim().length < 20) {
      Alert.alert('Invalid Key', 'Please enter a valid OpenAI API key.');
      return;
    }
    const key = tempKey.trim();
    await SecureStore.setItemAsync('PRO_API_KEY', key);
    setProApiKey(key);
    setModalVisible(false);
  };

  const cancelApiKey = () => {
    setModalVisible(false);
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
          <TouchableOpacity onPress={createNewSession} activeOpacity={0.6} style={styles.iconButton}>
            <Text style={styles.iconText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* API Key Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelApiKey}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pro Cloud Engine</Text>
            <Text style={styles.modalSubtitle}>Please enter your OpenAI API key to enable Pro mode.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="sk-..."
              placeholderTextColor={COLORS.textSecondary}
              value={tempKey}
              onChangeText={setTempKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelApiKey}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveApiKey}>
                <Text style={styles.saveText}>Save & Enable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity onPress={async () => {
                try {
                  const path = `${FileSystem.documentDirectory}rapid_model_q4_k_m.gguf`;
                  await FileSystem.deleteAsync(path, { idempotent: true });
                  useChatStore.getState().setModelStatus('missing');
                  Alert.alert('Engine Reset', 'The offline model has been deleted and will re-download on next prompt.');
                } catch (e) {
                  Alert.alert('Error', 'Failed to delete file: ' + e.message);
                }
              }} style={{marginRight: 16}}>
                <Text style={[styles.historyCloseText, {color: COLORS.textSecondary}]}>Reset Engine</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                <Text style={styles.historyCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <FlatList
            data={Object.values(chatSessions || {}).reverse()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const snippet = item.messages.length > 0 ? item.messages[0].text.substring(0, 40) + '...' : 'Empty Chat';
              const date = new Date(parseInt(item.id)).toLocaleString();
              const isActive = item.id === activeSessionId;
              
              return (
                <View style={[styles.historyItem, isActive && styles.historyItemActive]}>
                  <TouchableOpacity 
                    style={{ flex: 1 }}
                    onPress={() => loadSession(item.id)}
                  >
                    <Text style={styles.historyItemDate}>{date}</Text>
                    <Text style={styles.historyItemSnippet}>{snippet}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => {
                      useChatStore.getState().deleteSession(item.id);
                    }}
                    style={{ padding: 8, justifyContent: 'center' }}
                  >
                    <Text style={{ color: 'red', fontFamily: FONTS.ui }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
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
    width: 40,
    alignItems: 'flex-end',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 24,
  },
  modalTitle: {
    fontFamily: FONTS.ui,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    fontFamily: FONTS.ui,
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelText: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 6,
  },
  saveText: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    color: COLORS.background,
    fontWeight: '500',
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
  emptyHistory: {
    padding: 40,
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontFamily: FONTS.ui,
  }
});
