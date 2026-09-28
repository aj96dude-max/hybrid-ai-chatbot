import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useChatStore } from '../store/useChatStore';
import { COLORS, FONTS } from '../theme/colors';

export default function Header() {
  const { mode, setMode } = useChatStore();

  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl}>
        <TouchableOpacity 
          style={[styles.segment, mode === 'rapid' && styles.segmentActive]} 
          onPress={() => setMode('rapid')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, mode === 'rapid' && styles.segmentTextActive]}>Rapid</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity 
          style={[styles.segment, mode === 'pro' && styles.segmentActive]} 
          onPress={() => setMode('pro')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, mode === 'pro' && styles.segmentTextActive]}>Pro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: COLORS.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  }
});
