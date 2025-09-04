import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const Header = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // paddingHorizontal: 20,
      // paddingVertical: 15,
      backgroundColor: theme.colors.background,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoContainer: {
      marginRight: 12,
    },
    logoImage: {
      width: 150,
      height: 40,
      borderRadius: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      padding: 8,
      marginLeft: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.card,
    },
  });

  return (
    <View >
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
          <Bell size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/profile')}>
          <User size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;