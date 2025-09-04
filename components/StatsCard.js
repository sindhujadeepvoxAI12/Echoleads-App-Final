import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const StatsCard = ({ icon, value, label, iconBgColor }) => {
  const { theme } = useTheme();
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: 20,
      padding: 20,
      flex: 1,
      alignItems: 'center',
      shadowColor: theme.colors.black,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
      borderWidth: 1,
      borderColor: theme.colors.gray100,
      marginHorizontal: 4,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: iconBgColor || theme.colors.gray100,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: iconBgColor || theme.colors.gray100,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    value: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.secondary,
      marginBottom: 6,
    },
    label: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '600',
      lineHeight: 18,
    },
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default StatsCard;