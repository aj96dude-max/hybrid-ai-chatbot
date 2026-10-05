import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../store/useChatStore';
import { COLORS, FONTS } from '../theme/colors';

export default function Header({ navigation }) {
  const mode = useChatStore((state) => state.mode);
  const createNewSession = useChatStore((state) => state.createNewSession);
  
  const title = mode === 'pro' ? 'GPT-4' : 'Mistral';

  const handleNewSession = () => {
    createNewSession();
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.centerContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={handleNewSession}
        >
          <View>
            <Ionicons name="happy-outline" size={26} color="#fff" />
            <View style={styles.badge}>
              <Ionicons name="add" size={10} color="#1877F2" style={{ fontWeight: 'bold' }} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#1877F2',
  },
  container: {
    height: Platform.OS === 'ios' ? 44 : 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#1877F2',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: FONTS.ui,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
