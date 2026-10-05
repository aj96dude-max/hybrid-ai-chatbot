import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Welcome To Ai\nChatbot',
    features: [
      { icon: 'help-circle-outline', title: 'Ask Anything', desc: 'Get instant answers to your questions on any topic.' },
      { icon: 'star-outline', title: 'Get Recommendations', desc: 'Receive personalized recommendations for products, services, and more.' },
      { icon: 'link-outline', title: 'Integrate Services', desc: 'Connect with your favorite apps and services for seamless integration.' },
    ],
  },
  {
    id: '2',
    title: 'Your AI, Perfectly\nTailored',
    features: [
      { icon: 'person-outline', title: 'Learns Your Preferences', desc: 'Our AI learns from your interactions, adapting to your preferences and providing personalized responses and suggestions.' },
      { icon: 'star-outline', title: 'Tailored Recommendations', desc: 'Receive recommendations tailored to your interests, ensuring you always discover something new and exciting.' },
      { icon: 'chatbubble-ellipses-outline', title: 'Adapts Communication Style', desc: 'Our AI adapts its communication style to match yours, making every interaction feel natural and engaging.' },
    ],
  },
  {
    id: '3',
    title: 'Welcome to your\nAI Chatbot',
    description: "Dive into a world of possibilities with your AI Chatbot! Start chatting to unlock personalized assistance, explore its vast capabilities, and discover how it can simplify your daily tasks. It's easy to use and ready to help you with anything you need.",
  }
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = React.useRef(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.replace('Auth');
    }
  };

  const handleSkip = () => {
    navigation.replace('Auth');
  };

  const renderSlide = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <Text style={styles.title}>{item.title}</Text>
        
        {item.features && (
          <View style={styles.featuresContainer}>
            {item.features.map((feat, idx) => (
              <View key={idx} style={styles.featureRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name={feat.icon} size={20} color={COLORS.textPrimary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feat.title}</Text>
                  <Text style={styles.featureDesc}>{feat.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {item.description && (
          <Text style={styles.descriptionText}>{item.description}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* If you have the background image, it can be added here behind the content */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        keyExtractor={item => item.id}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === 2 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1128', // Fallback dark blue
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.ui,
  },
  slide: {
    width,
    paddingHorizontal: 30,
    justifyContent: 'center',
    paddingTop: height * 0.1,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: FONTS.ui,
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: FONTS.ui,
  },
  featureDesc: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONTS.ui,
  },
  descriptionText: {
    color: '#aaa',
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'center',
    fontFamily: FONTS.ui,
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#1877F2',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.ui,
  },
  navPillContainer: {
    width: '100%',
    alignItems: 'center',
  },
  navPill: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  navArrow: {
    padding: 10,
  },
  navDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#444',
    marginHorizontal: 5,
  }
});
