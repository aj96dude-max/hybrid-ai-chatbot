import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../store/useChatStore';
import { COLORS, FONTS } from '../theme/colors';

const MODELS = [
  { id: 'pro', title: 'GPT-4', desc: 'general-purpose assistant bot with strengths in programming-related tasks and non english language', color: '#10B981', icon: 'logo-electron' },
  { id: 'rapid', title: 'Mistral', desc: 'general-purpose assistant bot with strengths in programming-related tasks and non english language', color: '#4F46E5', icon: 'aperture' },
  { id: 'pro-2', title: 'GPT Blt', desc: 'general-purpose assistant bot with strengths in programming-related tasks and non english language', color: '#3B82F6', icon: 'leaf' },
  { id: 'pro-3', title: 'LLaMa-3', desc: 'general-purpose assistant bot with strengths in programming-related tasks and non english language', color: '#8B5CF6', icon: 'logo-reddit' },
  { id: 'pro-4', title: 'DALL E - 3', desc: 'general-purpose assistant bot with strengths in programming-related tasks and non english language', color: '#06B6D4', icon: 'color-palette' },
  { id: 'pro-5', title: 'Gemini', desc: 'general-purpose assistant bot with strengths in programming-related tasks and non english language', color: '#2563EB', icon: 'sparkles' },
];

export default function HomeScreen({ navigation }) {
  const setMode = useChatStore((state) => state.setMode);
  const createNewSession = useChatStore((state) => state.createNewSession);

  const startChat = (modeId) => {
    // Fallback unmapped models to pro
    const actualMode = modeId === 'rapid' ? 'rapid' : 'pro';
    setMode(actualMode);
    createNewSession();
    navigation.navigate('Chat');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ai Chat bot</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.heroContainer}>
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Ai chat bot</Text>
              <Text style={styles.heroDesc}>Your AI buddy is here to chat, help, and keep things fun.</Text>
              <TouchableOpacity style={styles.heroBtn} onPress={() => startChat('pro')}>
                <Text style={styles.heroBtnText}>Start Chat</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroImagePlaceholder}>
              {/* Replace with the 3D avatar image if available */}
              <Ionicons name="person-circle" size={100} color="#E0F2FE" style={{ opacity: 0.5, marginRight: -20, marginTop: 20 }} />
            </View>
          </View>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>More Ai Chat Bot's</Text>
          
          {MODELS.map((model, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.modelItem}
              onPress={() => startChat(model.id)}
            >
              <View style={[styles.modelIconContainer, { backgroundColor: model.color }]}>
                <Ionicons name={model.icon} size={28} color="#fff" />
              </View>
              <View style={styles.modelTextContainer}>
                <Text style={styles.modelTitle}>{model.title}</Text>
                <Text style={styles.modelDesc}>{model.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1877F2', // Match header color
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#1877F2',
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.ui,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  heroCard: {
    backgroundColor: '#1877F2', // Actually a gradient in design, but flat blue works
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    zIndex: 2,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: FONTS.ui,
  },
  heroDesc: {
    color: '#E0F2FE',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    fontFamily: FONTS.ui,
    paddingRight: 10,
  },
  heroBtn: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: FONTS.ui,
  },
  heroImagePlaceholder: {
    width: '40%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: FONTS.ui,
  },
  modelItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  modelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modelTextContainer: {
    flex: 1,
  },
  modelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: FONTS.ui,
  },
  modelDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    fontFamily: FONTS.ui,
  }
});
