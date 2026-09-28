import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useChatStore } from '../store/useChatStore';
import { COLORS, FONTS } from '../theme/colors';

export default function Header() {
  const mode = useChatStore((state) => state.mode);
  const setMode = useChatStore((state) => state.setMode);
  const proApiKey = useChatStore((state) => state.proApiKey);
  const setProApiKey = useChatStore((state) => state.setProApiKey);
  const createNewSession = useChatStore((state) => state.createNewSession);

  const [modalVisible, setModalVisible] = useState(false);
  const [tempKey, setTempKey] = useState('');

  const handleToggleMode = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'pro' && !proApiKey) {
      setModalVisible(true);
    }
  };

  const saveApiKey = () => {
    if (tempKey.trim().length < 20) {
      Alert.alert('Invalid Key', 'Please enter a valid OpenAI API key.');
      return;
    }
    setProApiKey(tempKey.trim());
    setModalVisible(false);
  };

  const cancelApiKey = () => {
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftSpacer} />
        
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
  leftSpacer: {
    width: 40,
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
    backgroundColor: '#F3F3F3', // subtle active state
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
  rightAction: {
    width: 40,
    alignItems: 'flex-end',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
  }
});
