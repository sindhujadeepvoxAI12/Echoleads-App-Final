import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { X, Minus, Plus, CreditCard, Coins } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const CreditsCard = () => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(20);
  const [customAmount, setCustomAmount] = useState(20);
  const scaleAnim = new Animated.Value(1);

  const predefinedAmounts = [50, 100, 200, 500];
  const pricePerCredit = 0.20;

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
    container: {
      backgroundColor: theme.colors.white,
      borderRadius: 20,
      padding: 24,
      margin: 16,
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
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    coinsIcon: {
      marginRight: 8,
    },
    creditsText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      marginBottom: 8,
      fontWeight: '600',
    },
    creditsValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.secondary,
      marginBottom: 20,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 16,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    addButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.white,
      borderRadius: 20,
      padding: 28,
      width: '90%',
      maxWidth: 400,
      shadowColor: theme.colors.black,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 28,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.secondary,
    },
    closeButton: {
      padding: 4,
      backgroundColor: theme.colors.gray50,
      borderRadius: 12,
    },
    sectionTitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 20,
      fontWeight: '600',
    },
    amountSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
    },
    amountButton: {
      backgroundColor: theme.colors.gray100,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 12,
      shadowColor: theme.colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    amountButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    amountDisplay: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.secondary,
      marginHorizontal: 24,
      minWidth: 80,
      textAlign: 'center',
    },
    predefinedAmounts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 32,
    },
    predefinedButton: {
      borderWidth: 2,
      borderColor: theme.colors.gray200,
      borderRadius: 16,
      padding: 16,
      width: '22%',
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor: theme.colors.white,
    },
    predefinedButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
    },
    predefinedButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    summarySection: {
      backgroundColor: theme.colors.gray50,
      borderRadius: 16,
      padding: 20,
      marginBottom: 28,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.secondary,
    },
    paymentButtons: {
      gap: 16,
    },
    paypalButton: {
      backgroundColor: '#FFC439',
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      shadowColor: '#FFC439',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    paypalText: {
      color: '#003087',
      fontSize: 16,
      fontWeight: 'bold',
    },
    cardButton: {
      backgroundColor: theme.colors.secondary,
      borderRadius: 16,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.secondary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    cardButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    cancelButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.gray200,
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      marginTop: 12,
    },
    cancelButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    poweredBy: {
      textAlign: 'center',
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 12,
      fontStyle: 'italic',
    },
  });

  const handleAmountChange = (increment) => {
    const newAmount = Math.max(1, customAmount + increment);
    setCustomAmount(newAmount);
    setSelectedAmount(newAmount);
  };

  const handlePredefinedAmount = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(amount);
  };

  return (
    <>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.headerContainer}>
          <Coins size={24} color={theme.colors.primary} style={styles.coinsIcon} />
          <Text style={styles.creditsText}>Credits Available</Text>
        </View>
        <Text style={styles.creditsValue}>1,250</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Text style={styles.addButtonText}>Add Credits</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buy Credits</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Select Credit Amount</Text>
            
            <View style={styles.amountSelector}>
              <TouchableOpacity 
                style={styles.amountButton}
                onPress={() => handleAmountChange(-1)}
              >
                <Minus size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.amountDisplay}>{selectedAmount}</Text>
              <TouchableOpacity 
                style={styles.amountButton}
                onPress={() => handleAmountChange(1)}
              >
                <Plus size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.predefinedAmounts}>
              {predefinedAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.predefinedButton,
                    selectedAmount === amount && styles.predefinedButtonSelected
                  ]}
                  onPress={() => handlePredefinedAmount(amount)}
                >
                  <Text style={styles.predefinedButtonText}>{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price per credit</Text>
                <Text style={styles.summaryValue}>$ {pricePerCredit.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total amount</Text>
                <Text style={styles.totalValue}>${(selectedAmount * pricePerCredit).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.paymentButtons}>
              <TouchableOpacity style={styles.paypalButton}>
                <Text style={styles.paypalText}>PayPal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cardButton}>
                <CreditCard size={20} color={theme.colors.white} />
                <Text style={styles.cardButtonText}>Debit or Credit Card</Text>
              </TouchableOpacity>
              
              <Text style={styles.poweredBy}>Powered by PayPal</Text>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CreditsCard;