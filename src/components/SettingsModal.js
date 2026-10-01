import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import { useChatStore } from '../store/useChatStore';
import { COLORS, FONTS } from '../theme/colors';

export default function SettingsModal({ visible, onClose }) {
  const systemPrompt = useChatStore((state) => state.systemPrompt);
  const setSystemPrompt = useChatStore((state) => state.setSystemPrompt);
  
  const [tempPrompt, setTempPrompt] = useState(systemPrompt || '');

  useEffect(() => {
    if (visible) {
      setTempPrompt(systemPrompt || '');
    }
  }, [visible, systemPrompt]);

  const saveSettings = async () => {
    setSystemPrompt(tempPrompt.trim());
    onClose();
  };

  const deleteLocalModel = async () => {
    Alert.alert(
      'Delete Local Engine?',
      'This will remove the 1.5GB model from storage. It will be re-downloaded the next time you use Rapid Mode.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const path = `${FileSystem.documentDirectory}rapid_model_q4_k_m.gguf`;
              await FileSystem.deleteAsync(path, { idempotent: true });
              useChatStore.getState().setModelStatus('missing');
              Alert.alert('Success', 'Local engine deleted successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete file: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const clearChatHistory = () => {
    Alert.alert(
      'Clear All Chat History?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            useChatStore.getState().clearHistory();
            // We also need to clear all sessions
            useChatStore.setState({
              chatSessions: {},
              activeSessionId: Date.now().toString(),
              messages: []
            });
            Alert.alert('Success', 'All chat history cleared.');
          }
        }
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Prompt</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="You are a helpful assistant..."
                placeholderTextColor={COLORS.textSecondary}
                value={tempPrompt}
                onChangeText={setTempPrompt}
                multiline
              />
              <Text style={styles.description}>Global instructions for the AI behavior.</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Storage Management</Text>
              
              <TouchableOpacity style={styles.actionButton} onPress={deleteLocalModel}>
                <Text style={styles.actionButtonText}>Delete Local Model Engine (~1.5GB)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearChatHistory}>
                <Text style={[styles.actionButtonText, styles.dangerText]}>Clear All Chat History</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60, // approximate safe area top
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: FONTS.ui,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  closeButton: {
    paddingVertical: 8,
    paddingLeft: 16,
  },
  closeText: {
    fontFamily: FONTS.ui,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    fontFamily: FONTS.ui,
    color: COLORS.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  description: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  actionButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  actionButtonText: {
    fontFamily: FONTS.ui,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  dangerButton: {
    borderColor: '#FFEBEB',
    backgroundColor: '#FFF5F5',
  },
  dangerText: {
    color: '#E53E3E',
  },
  saveButton: {
    paddingVertical: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  saveButtonText: {
    fontFamily: FONTS.ui,
    fontSize: 16,
    color: COLORS.background,
    fontWeight: '600',
  },
});
